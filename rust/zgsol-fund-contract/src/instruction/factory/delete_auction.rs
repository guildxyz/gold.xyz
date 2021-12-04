use super::*;

#[derive(BorshSchema, BorshSerialize, BorshDeserialize)]
pub struct DeleteAuctionArgs {
    pub contract_admin_pubkey: Pubkey,
    pub auction_owner_pubkey: Pubkey,
    #[alias([u8; 32])]
    pub auction_id: AuctionId,
    pub current_auction_cycle: u64,
    pub num_of_cycles_to_delete: u64,
}

pub fn delete_auction(args: &DeleteAuctionArgs) -> Instruction {
    let (contract_bank_pubkey, _) =
        Pubkey::find_program_address(&get_contract_bank_seeds(), &crate::ID);

    let (auction_pool_pubkey, _) = Pubkey::find_program_address(
        &get_auction_pool_seeds(&args.contract_admin_pubkey),
        &crate::ID,
    );

    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );

    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );

    let mut accounts = vec![
        AccountMeta::new(args.contract_admin_pubkey, true),
        AccountMeta::new(contract_bank_pubkey, false),
        AccountMeta::new(auction_pool_pubkey, false),
        AccountMeta::new(args.auction_owner_pubkey, false),
        AccountMeta::new(auction_bank_pubkey, false),
        AccountMeta::new(auction_root_state_pubkey, false),
    ];

    let cycles_to_include = std::cmp::min(args.current_auction_cycle, args.num_of_cycles_to_delete);
    for i in 0..cycles_to_include {
        let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
            &get_auction_cycle_state_seeds(
                &auction_root_state_pubkey,
                &(args.current_auction_cycle - i).to_le_bytes(),
            ),
            &crate::ID,
        );
        accounts.push(AccountMeta::new(auction_cycle_state_pubkey, false));
    }

    let instruction = AuctionInstruction::DeleteAuction {
        id: args.auction_id,
        num_of_cycles_to_delete: args.num_of_cycles_to_delete,
    };

    Instruction {
        program_id: crate::ID,
        accounts,
        data: instruction.try_to_vec().unwrap(),
    }
}
