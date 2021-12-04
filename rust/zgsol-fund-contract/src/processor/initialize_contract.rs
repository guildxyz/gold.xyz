use super::*;

pub fn initialize_contract(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let contract_admin_account = next_account_info(account_info_iter)?;
    let contract_bank_account = next_account_info(account_info_iter)?;
    let auction_pool_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !contract_admin_account.is_signer {
        msg!("admin signature is missing");
        return Err(ProgramError::MissingRequiredSignature);
    }

    let contract_bank_seeds = get_contract_bank_seeds();
    let contract_bank_pda =
        SignerPda::new_checked(&contract_bank_seeds, contract_bank_account.key, program_id)
            .map_err(|_| AuctionContractError::InvalidSeeds)?;
    let auction_pool_seeds = get_auction_pool_seeds(contract_admin_account.key);
    let auction_pool_pda =
        SignerPda::new_checked(&auction_pool_seeds, auction_pool_account.key, program_id)
            .map_err(|_| AuctionContractError::InvalidSeeds)?;

    if auction_pool_account.data_is_empty() {
        create_state_account(
            contract_admin_account,
            auction_pool_account,
            auction_pool_pda.signer_seeds(),
            program_id,
            system_program,
            AuctionPool::MAX_SERIALIZED_LEN,
        )?;
    } else {
        return Err(AuctionContractError::ContractAlreadyInitialized.into());
    }

    if contract_bank_account.lamports() == 0 {
        create_state_account(
            contract_admin_account,
            contract_bank_account,
            contract_bank_pda.signer_seeds(),
            program_id,
            system_program,
            ContractBankState::MAX_SERIALIZED_LEN,
        )?;
        let contract_bank_state = ContractBankState {
            contract_admin_pubkey: *contract_admin_account.key,
        };
        contract_bank_state.write(contract_bank_account)?;
    } else {
        return Err(AuctionContractError::ContractAlreadyInitialized.into());
    }
    Ok(())
}
