#![cfg(feature = "test-bpf")]

mod error;
mod test_factory;
use test_factory::*;

use solana_program::pubkey::Pubkey;
use solana_sdk::signer::Signer;
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::*;
use zgsol_fund_contract::state::*;
use zgsol_fund_contract::AuctionContractError;
use zgsol_fund_contract::ID as CONTRACT_ID;
use zgsol_testbench::{tokio, Testbench};

const TRANSACTION_FEE: u64 = 5000;

async fn assert_auction_state(
    testbench: &mut Testbench,
    auction_owner_pubkey: &Pubkey,
    auction_id: [u8; 32],
    expected_top_bidder: &Pubkey,
    bid_amount: u64,
) {
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, auction_owner_pubkey),
        &CONTRACT_ID,
    );
    let cycle_number_bytes = 1_u64.to_le_bytes();
    let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(&auction_root_state_pubkey, &cycle_number_bytes),
        &CONTRACT_ID,
    );
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&auction_id, auction_owner_pubkey),
        &CONTRACT_ID,
    );

    // Assert top bidder
    if let Some(top_bidder) = &get_top_bidder_pubkey(testbench, &auction_cycle_state_pubkey).await {
        assert_eq!(top_bidder, expected_top_bidder);
    }

    // Assert fund holding account balance
    let min_balance = testbench.rent.minimum_balance(0);
    assert_eq!(
        min_balance + bid_amount,
        get_account_lamports(testbench, &auction_bank_pubkey).await
    );
}

#[tokio::test]
async fn test_process_bid() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_config = AuctionConfig {
        cycle_period: 100,
        encore_period: 30,
        minimum_bid_amount: 10_000,
        number_of_cycles: Some(10),
    };
    let auction_id = [2; 32];

    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

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
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;

    assert_eq!(
        auction_root_state.auction_config.cycle_period,
        auction_config.cycle_period
    );
    assert_eq!(
        auction_root_state.auction_config.encore_period,
        auction_config.encore_period
    );
    assert!(auction_cycle_state.bid_history.get_last_element().is_none());

    let initial_funds = get_account_lamports(&mut testbench, &auction_bank_pubkey).await;
    assert!(initial_funds > 0);

    let user_1 = TestUser::new(&mut testbench).await;
    let user_2 = TestUser::new(&mut testbench).await;
    let initial_balance = 150_000_000;

    assert_eq!(
        initial_balance,
        get_account_lamports(&mut testbench, &user_1.keypair.pubkey()).await
    );
    assert_eq!(
        initial_balance,
        get_account_lamports(&mut testbench, &user_2.keypair.pubkey()).await
    );

    // Invalid use case
    // Test bid lower than minimum_bid
    let mut place_bid_args = PlaceBidArgs {
        user_main_pubkey: user_2.keypair.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        amount: 1000, // low amount
    };
    let bid_instruction = place_bid(&place_bid_args);

    let lower_than_minimum_bid_error = testbench
        .process_transaction(&[bid_instruction.clone()], &user_2.keypair, None)
        .await
        .err()
        .unwrap();
    assert_eq!(
        error::to_auction_error(lower_than_minimum_bid_error),
        AuctionContractError::InvalidBidAmount
    );
    assert_eq!(
        initial_balance - TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_2.keypair.pubkey()).await
    );

    // Test first bid
    let bid_amount = 1_000_000;
    place_bid_args.user_main_pubkey = user_1.keypair.pubkey();
    place_bid_args.amount = bid_amount;
    let bid_instruction = place_bid(&place_bid_args);

    testbench
        .process_transaction(&[bid_instruction.clone()], &user_1.keypair, None)
        .await
        .unwrap();

    assert_auction_state(
        &mut testbench,
        &auction_owner.keypair.pubkey(),
        auction_id,
        &user_1.keypair.pubkey(),
        bid_amount,
    )
    .await;

    // Assert balances
    assert_eq!(
        initial_balance - bid_amount - TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_1.keypair.pubkey()).await
    );

    // Test higher than current bid
    let bid_amount_higher = 2_000_000;
    place_bid_args.user_main_pubkey = user_2.keypair.pubkey();
    place_bid_args.top_bidder_pubkey =
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await;
    place_bid_args.amount = bid_amount_higher;
    let bid_instruction = place_bid(&place_bid_args);

    testbench
        .process_transaction(&[bid_instruction.clone()], &user_2.keypair, None)
        .await
        .unwrap();

    assert_auction_state(
        &mut testbench,
        &auction_owner.keypair.pubkey(),
        auction_id,
        &user_2.keypair.pubkey(),
        bid_amount_higher,
    )
    .await;

    // Assert balances
    assert_eq!(
        initial_balance - TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_1.keypair.pubkey()).await
    );

    assert_eq!(
        initial_balance - bid_amount_higher - 2 * TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_2.keypair.pubkey()).await
    );

    // Invalid use case
    // Test bid lower than current bid
    let bid_amount_lower = 100_000;
    place_bid_args.user_main_pubkey = user_2.keypair.pubkey();
    place_bid_args.amount = bid_amount_lower;
    let bid_instruction = place_bid(&place_bid_args);

    let lower_bid_error = testbench
        .process_transaction(&[bid_instruction.clone()], &user_2.keypair, None)
        .await
        .err()
        .unwrap();
    assert_eq!(
        error::to_auction_error(lower_bid_error),
        AuctionContractError::InvalidBidAmount
    );
    assert_auction_state(
        &mut testbench,
        &auction_owner.keypair.pubkey(),
        auction_id,
        &user_2.keypair.pubkey(),
        bid_amount_higher,
    )
    .await;
    // Assert balances
    assert_eq!(
        initial_balance - TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_1.keypair.pubkey()).await
    );

    assert_eq!(
        initial_balance - bid_amount_higher - 3 * TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_2.keypair.pubkey()).await
    );

    // Invalid use case
    // Test bid into expired auction
    testbench.warp_to_slot(100_000);
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;
    assert!(auction_cycle_state.end_time < testbench.block_time().await);
    let bid_to_expired_auction_error = testbench
        .process_transaction(&[bid_instruction.clone()], &user_2.keypair, None)
        .await
        .err()
        .unwrap();

    assert_eq!(
        error::to_auction_error(bid_to_expired_auction_error),
        AuctionContractError::AuctionCycleEnded
    );

    assert_auction_state(
        &mut testbench,
        &auction_owner.keypair.pubkey(),
        auction_id,
        &user_2.keypair.pubkey(),
        bid_amount_higher,
    )
    .await;
    // Assert balances
    assert_eq!(
        initial_balance - TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_1.keypair.pubkey()).await
    );

    assert_eq!(
        initial_balance - bid_amount_higher - 4 * TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user_2.keypair.pubkey()).await
    );

    let (auction_pool_pubkey, _) = Pubkey::find_program_address(
        &get_auction_pool_seeds(&testbench.payer().pubkey()),
        &CONTRACT_ID,
    );
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert_eq!(1, auction_pool.pool.len());
    assert_eq!(
        auction_pool.pool.get(&auction_id).unwrap(),
        &auction_root_state_pubkey
    );
}

#[tokio::test]
async fn bid_to_frozen_account() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let user_2 = TestUser::new(&mut testbench).await;

    let auction_id = [2; 32];
    let auction_config = AuctionConfig {
        cycle_period: 100,
        encore_period: 30,
        minimum_bid_amount: 10_000,
        number_of_cycles: Some(10),
    };

    // Test bid into frozen auction
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let cycle_number_bytes = 1_u64.to_le_bytes();
    let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(&auction_root_state_pubkey, &cycle_number_bytes),
        &CONTRACT_ID,
    );

    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    assert!(!auction_root_state.status.is_frozen);
    let freeze_auction_args = FreezeAuctionArgs {
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
    };
    let freeze_instruction = freeze_auction(&freeze_auction_args);
    testbench
        .process_transaction(&[freeze_instruction.clone()], &auction_owner.keypair, None)
        .await
        .unwrap();

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    assert!(auction_root_state.status.is_frozen);

    let place_bid_args = PlaceBidArgs {
        user_main_pubkey: user_2.keypair.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        amount: 1_000_000,
    };
    let bid_instruction = place_bid(&place_bid_args);

    let bid_to_frozen_auction_error = testbench
        .process_transaction(&[bid_instruction.clone()], &user_2.keypair, None)
        .await
        .err()
        .unwrap();

    assert_eq!(
        error::to_auction_error(bid_to_frozen_auction_error),
        AuctionContractError::AuctionFrozen
    );

    // Test bid into frozen AND expired account
    testbench.warp_to_slot(100_000);
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;
    assert!(auction_cycle_state.end_time < testbench.block_time().await);
    let bid_to_frozen_and_expired_auction_error = testbench
        .process_transaction(&[bid_instruction.clone()], &user_2.keypair, None)
        .await
        .err()
        .unwrap();

    assert_eq!(
        error::to_auction_error(bid_to_frozen_and_expired_auction_error),
        AuctionContractError::AuctionFrozen
    );
}

#[tokio::test]
async fn test_encore_bid() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [2; 32];
    let auction_config = AuctionConfig {
        cycle_period: 1000,
        encore_period: 200,
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

    let user = TestUser::new(&mut testbench).await;

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

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;

    // Place bid to trigger encore
    let place_bid_args = PlaceBidArgs {
        user_main_pubkey: user.keypair.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        amount: 2_000_000,
    };
    let bid_instruction = place_bid(&place_bid_args);

    let mut slot = 100;
    let slot_increment = 100;
    while testbench.block_time().await < auction_cycle_state.end_time - 100 {
        slot += slot_increment;
        testbench.warp_to_slot(slot);
    }

    // Assert that we should trigger encore with the bid
    assert!(
        testbench.block_time().await
            > auction_cycle_state.end_time - auction_root_state.auction_config.encore_period
    );
    assert!(testbench.block_time().await < auction_cycle_state.end_time);

    let end_time_before = auction_cycle_state.end_time;
    testbench
        .process_transaction(&[bid_instruction.clone()], &user.keypair, None)
        .await
        .unwrap();

    // Fetch cycle state again (updated by the transaction)
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;
    let end_time_after = auction_cycle_state.end_time;

    assert!(end_time_after > end_time_before);
    assert!(end_time_after < end_time_before + auction_root_state.auction_config.encore_period);

    // This test is theoretically true, but the BanksClient works in mysterious ways
    // May need to comment this out later
    assert_eq!(
        end_time_after,
        testbench.block_time().await + auction_root_state.auction_config.encore_period
    );
}
