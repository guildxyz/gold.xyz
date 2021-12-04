// TODO if unused remove these.
//mod client_error;
//mod client_utils;
//mod gold_client;
//
//pub use client_error::*;
//pub use gold_client::*;

//pub const PROGRAM_KEYPAIR_FILE: &str = "zgsol_fund_contract-keypair.json";
use borsh::BorshSerialize;
use wasm_bindgen::prelude::*;
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::{
    get_auction_bank_seeds, get_auction_cycle_state_seeds, get_auction_pool_seeds,
    get_auction_root_state_seeds, get_master_mint_seeds, get_metadata_seeds,
};
use zgsol_fund_contract::solana_program::borsh::try_from_slice_unchecked;
use zgsol_fund_contract::solana_program::pubkey::Pubkey;

#[wasm_bindgen(js_name = "initAuctionWasm")]
pub fn wasm_init_auction(serialized_input: Vec<u8>) -> String {
    let args = try_from_slice_unchecked(&serialized_input.to_vec()).unwrap();
    let instruction = initialize_auction(&args);
    serde_json::to_string(&instruction).unwrap()
}

#[wasm_bindgen(js_name = "freezeAuctionWasm")]
pub fn wasm_freeze_auction(serialized_input: Vec<u8>) -> String {
    let args = try_from_slice_unchecked(&serialized_input.to_vec()).unwrap();
    let instruction = freeze_auction(&args);
    serde_json::to_string(&instruction).unwrap()
}

#[wasm_bindgen(js_name = "placeBidWasm")]
pub fn wasm_place_bid(serialized_input: Vec<u8>) -> String {
    let args = try_from_slice_unchecked(&serialized_input.to_vec()).unwrap();
    let instruction = place_bid(&args);
    serde_json::to_string(&instruction).unwrap()
}

#[wasm_bindgen(js_name = "claimFundsWasm")]
pub fn wasm_claim_funds(serialized_input: Vec<u8>) -> String {
    let args = try_from_slice_unchecked(&serialized_input.to_vec()).unwrap();
    let instruction = claim_funds(&args);
    serde_json::to_string(&instruction).unwrap()
}

#[wasm_bindgen(js_name = "deleteAuctionWasm")]
pub fn wasm_delete_auction(serialized_input: Vec<u8>) -> String {
    let args = try_from_slice_unchecked(&serialized_input.to_vec()).unwrap();
    let instruction = delete_auction(&args);
    serde_json::to_string(&instruction).unwrap()
}

#[wasm_bindgen(js_name = "initContractWasm")]
pub fn wasm_init_contract(serialized_input: Vec<u8>) -> String {
    let args = try_from_slice_unchecked(&serialized_input.to_vec()).unwrap();
    let instruction = initialize_contract(&args);
    serde_json::to_string(&instruction).unwrap()
}

#[wasm_bindgen(js_name = "getAuctionPoolPubkeyWasm")]
pub fn wasm_auction_pool_pubkey(admin_pubkey: &[u8]) -> Vec<u8> {
    let admin_pubkey = Pubkey::new(admin_pubkey); // panics if admin_pubkey length is not 32
    let (auction_pool_pubkey, _) = Pubkey::find_program_address(
        &get_auction_pool_seeds(&admin_pubkey),
        &zgsol_fund_contract::ID,
    );
    auction_pool_pubkey.try_to_vec().unwrap()
}

#[wasm_bindgen(js_name = "getAuctionBankPubkeyWasm")]
pub fn wasm_auction_bank_pubkey(auction_id: &[u8], owner_pubkey: &[u8]) -> Vec<u8> {
    let owner_pubkey = Pubkey::new(owner_pubkey);
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(auction_id, &owner_pubkey),
        &zgsol_fund_contract::ID,
    );
    auction_bank_pubkey.try_to_vec().unwrap()
}

#[wasm_bindgen(js_name = "getRootStatePubkeyWasm")]
pub fn wasm_root_state_pubkey(auction_id: &[u8], owner_pubkey: &[u8]) -> Vec<u8> {
    let owner_pubkey = Pubkey::new(owner_pubkey);
    let (root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(auction_id, &owner_pubkey),
        &zgsol_fund_contract::ID,
    );
    root_state_pubkey.try_to_vec().unwrap()
}

#[wasm_bindgen(js_name = "getCycleStatePubkeyWasm")]
pub fn wasm_cycle_state_pubkey(root_state_pubkey: &[u8], cycle_number_bytes: &[u8]) -> Vec<u8> {
    let root_state_pubkey = Pubkey::new(root_state_pubkey);
    let (cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(&root_state_pubkey, cycle_number_bytes),
        &zgsol_fund_contract::ID,
    );
    cycle_state_pubkey.try_to_vec().unwrap()
}

#[wasm_bindgen(js_name = "getMasterMintPubkeyWasm")]
pub fn wasm_master_mint_pubkey(auction_id: &[u8], owner_pubkey: &[u8]) -> Vec<u8> {
    let owner_pubkey = Pubkey::new(owner_pubkey);
    let (master_mint_pubkey, _) = Pubkey::find_program_address(
        &get_master_mint_seeds(auction_id, &owner_pubkey),
        &zgsol_fund_contract::ID,
    );
    master_mint_pubkey.try_to_vec().unwrap()
}

#[wasm_bindgen(js_name = "getMasterMetadataPubkeyWasm")]
pub fn wasm_master_metadata_pubkey(mint_pubkey: &[u8]) -> Vec<u8> {
    let mint_pubkey = Pubkey::new(mint_pubkey);
    let (master_metadata_pubkey, _) = Pubkey::find_program_address(
        &get_metadata_seeds(&mint_pubkey),
        &metaplex_token_metadata::ID,
    );
    master_metadata_pubkey.try_to_vec().unwrap()
}
