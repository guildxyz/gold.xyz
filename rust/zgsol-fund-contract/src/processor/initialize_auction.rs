use super::*;

use solana_program::clock::UnixTimestamp;

#[allow(clippy::too_many_arguments)]
pub fn initialize_auction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    auction_id: AuctionId,
    auction_name: AuctionName,
    auction_description: AuctionDescription,
    auction_config: AuctionConfig,
    create_token_args: CreateTokenArgs,
    auction_start_timestamp: Option<UnixTimestamp>,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    // User accounts
    let auction_owner_account = next_account_info(account_info_iter)?;
    // Contract state accounts
    let auction_pool_account = next_account_info(account_info_iter)?;
    let auction_root_state_account = next_account_info(account_info_iter)?;
    let auction_cycle_state_account = next_account_info(account_info_iter)?;
    let auction_bank_account = next_account_info(account_info_iter)?;
    // Contract PDA account
    let contract_pda = next_account_info(account_info_iter)?;
    // Solana accounts
    let rent_program = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    if !auction_owner_account.is_signer {
        msg!("admin signature is missing");
        return Err(ProgramError::MissingRequiredSignature);
    }

    let auction_root_state_seeds =
        get_auction_root_state_seeds(&auction_id, auction_owner_account.key);
    let auction_root_state_pda = SignerPda::new_checked(
        &auction_root_state_seeds,
        auction_root_state_account.key,
        program_id,
    )
    .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let cycle_num_bytes = 1_u64.to_le_bytes();
    let auction_cycle_state_seeds =
        get_auction_cycle_state_seeds(auction_root_state_account.key, &cycle_num_bytes);
    let auction_cycle_state_pda = SignerPda::new_checked(
        &auction_cycle_state_seeds,
        auction_cycle_state_account.key,
        program_id,
    )
    .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let auction_bank_seeds = get_auction_bank_seeds(&auction_id, auction_owner_account.key);
    let auction_bank_pda =
        SignerPda::new_checked(&auction_bank_seeds, auction_bank_account.key, program_id)
            .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let contract_pda_seeds = get_contract_pda_seeds();
    let contract_signer_pda =
        SignerPda::new_checked(&contract_pda_seeds, contract_pda.key, program_id)
            .map_err(|_| AuctionContractError::InvalidSeeds)?;

    if !auction_root_state_account.data_is_empty() {
        return Err(AuctionContractError::AuctionAlreadyInitialized.into());
    }

    // Create auction root and first cycle state accounts
    create_state_account(
        auction_owner_account,
        auction_root_state_account,
        auction_root_state_pda.signer_seeds(),
        program_id,
        system_program,
        AuctionRootState::MAX_SERIALIZED_LEN,
    )?;
    create_state_account(
        auction_owner_account,
        auction_cycle_state_account,
        auction_cycle_state_pda.signer_seeds(),
        program_id,
        system_program,
        AuctionCycleState::MAX_SERIALIZED_LEN,
    )?;

    // Register new auction into the auction pool
    let mut auction_pool = AuctionPool::read(auction_pool_account)?;
    if auction_pool
        .pool
        .insert(auction_id, *auction_root_state_account.key)
        .is_some()
    {
        return Err(AuctionContractError::AuctionIdNotUnique.into());
    }
    auction_pool.write(auction_pool_account)?;

    // Create auction bank account
    create_state_account(
        auction_owner_account,
        auction_bank_account,
        auction_bank_pda.signer_seeds(),
        program_id,
        system_program,
        0,
    )?;

    // Check auction start time (if provided)
    let clock = Clock::get()?;
    if let Some(start_time) = auction_start_timestamp {
        if start_time < clock.unix_timestamp {
            return Err(AuctionContractError::InvalidStartTime.into());
        }
    }
    // NOTE: can the "double unwrap" be avoided?
    let start_time = auction_start_timestamp.unwrap_or(clock.unix_timestamp);
    let end_time = start_time + auction_config.cycle_period;

    // Create default initialization state objects
    let bid_history = BidHistory::new();

    let cycle_state = AuctionCycleState {
        start_time,
        end_time,
        bid_history,
    };
    cycle_state.write(auction_cycle_state_account)?;

    let token_config = match create_token_args {
        CreateTokenArgs::Nft(metadata_args) => {
            // Nft accounts
            let master_edition_account = next_account_info(account_info_iter)?;
            let master_holding_account = next_account_info(account_info_iter)?;
            let master_metadata_account = next_account_info(account_info_iter)?;
            let master_mint_account = next_account_info(account_info_iter)?;
            // Metaplex account
            let metadata_program = next_account_info(account_info_iter)?;

            // Check pda signers
            let master_mint_seeds = get_master_mint_seeds(&auction_id, auction_owner_account.key);
            let master_mint_pda =
                SignerPda::new_checked(&master_mint_seeds, master_mint_account.key, program_id)
                    .map_err(|_| AuctionContractError::InvalidSeeds)?;

            let master_holding_seeds =
                get_master_holding_seeds(&auction_id, auction_owner_account.key);
            let master_holding_pda = SignerPda::new_checked(
                &master_holding_seeds,
                master_holding_account.key,
                program_id,
            )
            .map_err(|_| AuctionContractError::InvalidSeeds)?;
            // TODO: other metadata account pda checks?

            if !master_metadata_account.data_is_empty() {
                return Err(AuctionContractError::AuctionAlreadyInitialized.into());
            }

            // Create mint and respective holding account
            // and mint a single NFT to the holding account

            // create mint account
            create_mint_account(
                auction_owner_account,
                master_mint_account,
                contract_pda,
                master_mint_pda.signer_seeds(),
                rent_program,
                system_program,
                token_program,
                0,
            )?;

            // create master holding account
            create_token_holding_account(
                auction_owner_account,
                contract_pda,
                master_holding_account,
                master_mint_account,
                master_holding_pda.signer_seeds(),
                system_program,
                token_program,
                rent_program,
            )?;

            // mint a single token to the holding account
            let mint_ix = token_instruction::mint_to(
                token_program.key,
                master_mint_account.key,
                master_holding_account.key,
                contract_pda.key,
                &[contract_pda.key],
                1,
            )?;

            invoke_signed(
                &mint_ix,
                &[
                    contract_pda.clone(),
                    token_program.clone(),
                    master_holding_account.clone(),
                    master_mint_account.clone(),
                ],
                &[&contract_signer_pda.signer_seeds()],
            )?;

            // create metadata on this nft account
            let metadata_ix = meta_instruction::create_metadata_accounts(
                *metadata_program.key,
                *master_metadata_account.key,
                *master_mint_account.key,
                *contract_pda.key,
                *auction_owner_account.key,
                *contract_pda.key,
                metadata_args.data.name,
                metadata_args.data.symbol,
                metadata_args.data.uri,
                metadata_args.data.creators,
                metadata_args.data.seller_fee_basis_points,
                true, // update authority is signer (NOTE contract pda will sign, so could be true)
                metadata_args.is_mutable,
            );

            invoke_signed(
                &metadata_ix,
                &[
                    metadata_program.clone(),
                    master_metadata_account.clone(),
                    master_mint_account.clone(),
                    auction_owner_account.clone(),
                    contract_pda.clone(),
                    system_program.clone(),
                    rent_program.clone(),
                ],
                &[&contract_signer_pda.signer_seeds()],
            )?;

            // turn nft into master edition
            let master_edition_ix = meta_instruction::create_master_edition(
                *metadata_program.key,
                *master_edition_account.key,
                *master_mint_account.key,
                *contract_pda.key,
                *contract_pda.key,
                *master_metadata_account.key,
                *auction_owner_account.key,
                auction_config.number_of_cycles,
            );

            invoke_signed(
                &master_edition_ix,
                &[
                    metadata_program.clone(),
                    master_edition_account.clone(),
                    master_mint_account.clone(),
                    contract_pda.clone(),
                    auction_owner_account.clone(),
                    master_metadata_account.clone(),
                    rent_program.clone(),
                    system_program.clone(),
                    token_program.clone(),
                ],
                &[&contract_signer_pda.signer_seeds()],
            )?;

            TokenConfig::Nft(NftData {
                master_edition: *master_edition_account.key,
            })
        }
        CreateTokenArgs::Token {
            decimals,
            per_cycle_amount,
        } => {
            // Parse mint account
            let token_mint_account = next_account_info(account_info_iter)?;

            // Check pda signers
            let token_mint_seeds = get_token_mint_seeds(&auction_id, auction_owner_account.key);
            let token_mint_pda =
                SignerPda::new_checked(&token_mint_seeds, token_mint_account.key, program_id)
                    .map_err(|_| AuctionContractError::InvalidSeeds)?;

            // Create ERC20 mint
            create_mint_account(
                auction_owner_account,
                token_mint_account,
                contract_pda,
                token_mint_pda.signer_seeds(),
                rent_program,
                system_program,
                token_program,
                decimals,
            )?;

            TokenConfig::Token(TokenData {
                per_cycle_amount,
                mint: *token_mint_account.key,
            })
        }
    };

    // Initialize root state account
    let root_state = AuctionRootState {
        auction_name,
        auction_owner: *auction_owner_account.key,
        description: auction_description,
        auction_config,
        token_config,
        status: AuctionStatus {
            current_auction_cycle: 1,
            is_active: true,
            is_frozen: false,
        },
    };
    root_state.write(auction_root_state_account)?;

    Ok(())
}
