use super::*;

#[derive(BorshSchema, BorshSerialize, BorshDeserialize)]
pub struct InitializeContractArgs {
    pub contract_admin_pubkey: Pubkey,
}

pub fn initialize_contract(args: &InitializeContractArgs) -> Instruction {
    let (contract_bank_pubkey, _) =
        Pubkey::find_program_address(&get_contract_bank_seeds(), &crate::ID);

    let (auction_pool_pubkey, _) = Pubkey::find_program_address(
        &get_auction_pool_seeds(&args.contract_admin_pubkey),
        &crate::ID,
    );

    let accounts = vec![
        AccountMeta::new(args.contract_admin_pubkey, true),
        AccountMeta::new(contract_bank_pubkey, false),
        AccountMeta::new(auction_pool_pubkey, false),
        AccountMeta::new_readonly(SYS_ID, false),
    ];

    let instruction = AuctionInstruction::InitializeContract;

    // unwrap is fine because instruction is serializable
    let data = instruction.try_to_vec().unwrap();
    Instruction {
        program_id: crate::ID,
        accounts,
        data,
    }
}
