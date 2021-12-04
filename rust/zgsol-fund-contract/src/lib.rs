mod entrypoint;
mod error;
pub mod instruction;
pub mod pda;
pub mod processor;
pub mod state;

pub use error::AuctionContractError;
pub use solana_program;

solana_program::declare_id!("go1dcKcvafq8SDwmBKo6t2NVzyhvTEZJkMwnnfae99U");

const MAX_AUCTION_NUM: usize = 100;
const MAX_BID_HISTORY_LENGTH: usize = 10;
const MAX_DESCRIPTION_LEN: usize = 200;
const MAX_SOCIALS_LEN: usize = 100;
const MAX_SOCIALS_NUM: usize = 5;

pub const RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL: u64 = 30;
