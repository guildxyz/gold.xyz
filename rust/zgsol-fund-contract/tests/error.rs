#![cfg(feature = "test-bpf")]
use solana_sdk::instruction::InstructionError;
use solana_sdk::transaction::TransactionError;
use zgsol_fund_contract::AuctionContractError;

use num_traits::FromPrimitive;

// For some reason the compiler always throws dead_code on this
#[allow(dead_code)]
pub fn to_auction_error(program_err: TransactionError) -> AuctionContractError {
    match program_err {
        TransactionError::InstructionError(_, InstructionError::Custom(code)) => {
            FromPrimitive::from_u32(code).unwrap()
        }
        _ => unimplemented!(),
    }
}
