#![cfg(feature = "test-bpf")]
mod error;
mod test_factory;
use test_factory::{initialize_new_auction, TestUser};

use solana_program::program_option::COption;
use solana_program::pubkey::Pubkey;
use solana_sdk::signer::Signer;
use spl_token::state::{Account as TokenAccount, Mint};
use zgsol_fund_contract::pda::*;
use zgsol_fund_contract::state::*;
use zgsol_fund_contract::AuctionContractError;
use zgsol_fund_contract::ID as CONTRACT_ID;
use zgsol_testbench::tokio;

#[tokio::test]
async fn test_process_initialize_contract() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;
    let auction_id = [123_u8; 32];
    let auction_config = AuctionConfig {
        cycle_period: 86400,
        encore_period: 300,
        minimum_bid_amount: 10_000,
        number_of_cycles: Some(10),
    };
    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

    // check mint account
    let (master_mint_pubkey, _) = Pubkey::find_program_address(
        &get_master_mint_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let (master_edition_pubkey, _) = Pubkey::find_program_address(
        &get_edition_seeds(&master_mint_pubkey),
        &metaplex_token_metadata::ID,
    );

    let master_mint_data: Mint = testbench
        .client()
        .get_packed_account_data(master_mint_pubkey)
        .await
        .unwrap();

    assert!(master_mint_data.is_initialized);
    assert_eq!(
        master_mint_data.mint_authority,
        COption::Some(master_edition_pubkey)
    );
    assert_eq!(master_mint_data.supply, 1);
    assert_eq!(master_mint_data.decimals, 0);

    // check holding account
    let (master_holding_pubkey, _) = Pubkey::find_program_address(
        &get_master_holding_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let master_holding_data: TokenAccount = testbench
        .client()
        .get_packed_account_data(master_holding_pubkey)
        .await
        .unwrap();

    assert_eq!(master_holding_data.amount, 1);

    // check state account
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let cycle_number_bytes = 1_u64.to_le_bytes();
    let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(&auction_root_state_pubkey, &cycle_number_bytes),
        &CONTRACT_ID,
    );

    // Assert that these accounts can be read
    testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;

    let (auction_pool_pubkey, _) = Pubkey::find_program_address(
        &get_auction_pool_seeds(&testbench.payer().pubkey()),
        &CONTRACT_ID,
    );
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert_eq!(1, auction_pool.pool.len());
    assert_eq!(
        auction_pool.pool.get(&[123_u8; 32]).unwrap(),
        &auction_root_state_pubkey
    );

    // Invalid use case
    // Create auction with the same id
    let reinitialize_auction_error = initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .err()
    .unwrap();
    assert_eq!(
        error::to_auction_error(reinitialize_auction_error),
        AuctionContractError::AuctionAlreadyInitialized
    );

    let other_user = TestUser::new(&mut testbench).await;

    let initialize_auction_with_same_id_error = initialize_new_auction(
        &mut testbench,
        &other_user.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .err()
    .unwrap();
    assert_eq!(
        error::to_auction_error(initialize_auction_with_same_id_error),
        AuctionContractError::AuctionIdNotUnique
    );
}
