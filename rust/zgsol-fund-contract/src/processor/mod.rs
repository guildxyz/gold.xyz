mod bid;
mod claim_funds;
mod close_auction_cycle;
mod delete_auction;
mod freeze;
mod initialize_auction;
mod initialize_contract;

use crate::error::AuctionContractError;
use crate::instruction::AuctionInstruction;
use crate::pda::factory::*;
use crate::pda::*;
use crate::state::*;
use metaplex_token_metadata::instruction as meta_instruction;
use solana_program::account_info::{next_account_info, next_account_infos, AccountInfo};
use solana_program::borsh::try_from_slice_unchecked;
use solana_program::clock::Clock;
use solana_program::entrypoint::ProgramResult;
use solana_program::msg;
use solana_program::program::{invoke, invoke_signed};
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use solana_program::system_instruction;
use solana_program::sysvar::Sysvar;
use spl_token::instruction as token_instruction;

use zgsol_utils::{AccountState, MaxSerializedLen, SignerPda};

pub use close_auction_cycle::{increment_name, increment_uri};

pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: AuctionInstruction = try_from_slice_unchecked(instruction_data)?;
    match instruction {
        AuctionInstruction::InitializeContract => {
            initialize_contract::initialize_contract(program_id, accounts)
        }
        AuctionInstruction::InitializeAuction {
            id,
            auction_name,
            description,
            auction_config,
            create_token_args,
            auction_start_timestamp,
        } => initialize_auction::initialize_auction(
            program_id,
            accounts,
            id,
            auction_name,
            description,
            auction_config,
            create_token_args,
            auction_start_timestamp,
        ),
        AuctionInstruction::Bid { amount, id } => {
            bid::process_bid(program_id, accounts, id, amount)
        }
        AuctionInstruction::CloseAuctionCycle { id } => {
            close_auction_cycle::close_auction_cycle(program_id, accounts, id)
        }
        AuctionInstruction::Freeze { id } => freeze::freeze_auction(program_id, accounts, id),
        AuctionInstruction::ClaimFunds { id, amount } => {
            claim_funds::process_claim_funds(program_id, accounts, id, amount)
        }
        AuctionInstruction::DeleteAuction {
            id,
            num_of_cycles_to_delete,
        } => delete_auction::process_delete_auction(
            program_id,
            accounts,
            id,
            num_of_cycles_to_delete,
        ),
    }
}
