#[cfg(feature = "client")]
pub mod factory;

use crate::state::{AuctionConfig, AuctionDescription, AuctionId, AuctionName, CreateTokenArgs};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::clock::UnixTimestamp;

// NOTE could hold a reference to description and metadata args
// to avoid cloning them, in the factory, but performance is not
// crucial in that part of the code.
#[allow(clippy::large_enum_variant)]
#[repr(C)]
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub enum AuctionInstruction {
    InitializeContract,
    InitializeAuction {
        id: AuctionId,
        auction_name: AuctionName,
        auction_config: AuctionConfig,
        description: AuctionDescription,
        create_token_args: CreateTokenArgs,
        auction_start_timestamp: Option<UnixTimestamp>,
    },
    Freeze {
        id: AuctionId,
    },
    CloseAuctionCycle {
        id: AuctionId,
    },
    Bid {
        id: AuctionId,
        amount: u64,
    },
    ClaimFunds {
        id: AuctionId,
        amount: u64,
    },
    DeleteAuction {
        id: AuctionId,
        num_of_cycles_to_delete: u64,
    },
}
