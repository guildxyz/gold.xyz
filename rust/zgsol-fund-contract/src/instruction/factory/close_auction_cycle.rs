use super::*;

#[derive(BorshSchema, BorshSerialize, BorshDeserialize)]
pub struct CloseAuctionCycleArgs {
    pub payer_pubkey: Pubkey,
    pub auction_owner_pubkey: Pubkey,
    pub top_bidder_pubkey: Option<Pubkey>,
    #[alias([u8; 32])]
    pub auction_id: AuctionId,
    pub next_cycle_num: u64,
    pub token_type: TokenType,
}

pub fn close_auction_cycle(args: &CloseAuctionCycleArgs) -> Instruction {
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );

    let (contract_pda, _) = Pubkey::find_program_address(&get_contract_pda_seeds(), &crate::ID);

    let top_bidder = if let Some(bidder) = args.top_bidder_pubkey {
        bidder
    } else {
        args.auction_owner_pubkey
    };

    let (current_auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(
            &auction_root_state_pubkey,
            &args.next_cycle_num.to_le_bytes(),
        ),
        &crate::ID,
    );
    let (next_auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(
            &auction_root_state_pubkey,
            &(args.next_cycle_num + 1).to_le_bytes(),
        ),
        &crate::ID,
    );

    let mut accounts = vec![
        AccountMeta::new(args.payer_pubkey, true),
        AccountMeta::new(auction_bank_pubkey, false),
        AccountMeta::new(args.auction_owner_pubkey, false),
        AccountMeta::new(auction_root_state_pubkey, false),
        AccountMeta::new(current_auction_cycle_state_pubkey, false),
        AccountMeta::new(next_auction_cycle_state_pubkey, false),
        AccountMeta::new_readonly(top_bidder, false),
        AccountMeta::new_readonly(contract_pda, false),
        AccountMeta::new_readonly(RENT_ID, false),
        AccountMeta::new_readonly(SYS_ID, false),
        AccountMeta::new_readonly(TOKEN_ID, false),
    ];

    let mut token_accounts = match args.token_type {
        TokenType::Nft => {
            let master_pdas = EditionPda::new(
                EditionType::Master,
                &args.auction_id,
                &args.auction_owner_pubkey,
            );
            let child_pdas = EditionPda::new(
                EditionType::Child(args.next_cycle_num),
                &args.auction_id,
                &args.auction_owner_pubkey,
            );

            let next_edition_div = args
                .next_cycle_num
                .checked_div(EDITION_MARKER_BIT_SIZE)
                .unwrap();
            let next_edition_string = next_edition_div.to_string();
            let (child_edition_marker_pubkey, _) = Pubkey::find_program_address(
                &get_edition_marker_seeds(&next_edition_string, &master_pdas.mint),
                &metaplex_token_metadata::ID,
            );

            vec![
                AccountMeta::new_readonly(META_ID, false),
                AccountMeta::new(child_pdas.edition, false),
                AccountMeta::new(child_edition_marker_pubkey, false),
                AccountMeta::new(child_pdas.metadata, false),
                AccountMeta::new(child_pdas.mint, false),
                AccountMeta::new(child_pdas.holding, false),
                AccountMeta::new(master_pdas.edition, false),
                AccountMeta::new(master_pdas.metadata, false),
                AccountMeta::new_readonly(master_pdas.mint, false),
                AccountMeta::new_readonly(master_pdas.holding, false),
            ]
        }
        TokenType::Token => {
            let (token_mint_pubkey, _) = Pubkey::find_program_address(
                &get_token_mint_seeds(&args.auction_id, &args.auction_owner_pubkey),
                &crate::ID,
            );
            let (token_holding_pubkey, _) = Pubkey::find_program_address(
                &get_token_holding_seeds(&token_mint_pubkey, &top_bidder),
                &crate::ID,
            );
            vec![
                AccountMeta::new(token_mint_pubkey, false),
                AccountMeta::new(token_holding_pubkey, false),
            ]
        }
    };

    accounts.append(&mut token_accounts);

    let instruction = AuctionInstruction::CloseAuctionCycle {
        id: args.auction_id,
    };

    Instruction {
        program_id: crate::ID,
        accounts,
        data: instruction.try_to_vec().unwrap(),
    }
}
