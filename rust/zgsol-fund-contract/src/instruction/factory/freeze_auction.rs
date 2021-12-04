use super::*;

#[derive(BorshSchema, BorshSerialize, BorshDeserialize)]
pub struct FreezeAuctionArgs {
    pub auction_owner_pubkey: Pubkey,
    #[alias([u8; 32])]
    pub auction_id: AuctionId,
    pub top_bidder_pubkey: Option<Pubkey>,
    pub cycle_number: u64,
}

pub fn freeze_auction(args: &FreezeAuctionArgs) -> Instruction {
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );
    let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(
            &auction_root_state_pubkey,
            &args.cycle_number.to_le_bytes(),
        ),
        &crate::ID,
    );
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );

    let top_bidder = if let Some(bidder) = args.top_bidder_pubkey {
        bidder
    } else {
        Pubkey::new_unique()
    };

    let accounts = vec![
        AccountMeta::new_readonly(args.auction_owner_pubkey, true),
        AccountMeta::new(auction_root_state_pubkey, false),
        AccountMeta::new(auction_cycle_state_pubkey, false),
        AccountMeta::new(auction_bank_pubkey, false),
        AccountMeta::new(top_bidder, false),
    ];

    let instruction = AuctionInstruction::Freeze {
        id: args.auction_id,
    };

    Instruction {
        program_id: crate::ID,
        accounts,
        data: instruction.try_to_vec().unwrap(),
    }
}
