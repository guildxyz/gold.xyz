#![cfg(feature = "test-bpf")]
mod error;
mod test_factory;

use test_factory::*;
use zgsol_testbench::Testbench;

use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::*;
use zgsol_fund_contract::state::*;
use zgsol_fund_contract::AuctionContractError;
use zgsol_fund_contract::ID as CONTRACT_ID;
use zgsol_fund_contract::RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL;
use zgsol_testbench::tokio;

#[tokio::test]
async fn test_delete_small_auction() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 5,
        encore_period: 1,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(10),
    };

    let payer = testbench.clone_payer();

    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

    let (auction_pool_pubkey, _) =
        Pubkey::find_program_address(&get_auction_pool_seeds(&payer.pubkey()), &CONTRACT_ID);
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    close_n_cycles(&mut testbench, auction_id, &auction_owner, &payer, 3, 100).await;

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;

    assert_eq!(auction_root_state.status.current_auction_cycle, 4);

    let delete_auction_args = DeleteAuctionArgs {
        contract_admin_pubkey: payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        current_auction_cycle: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey)
            .await,
        num_of_cycles_to_delete: RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL,
    };
    let delete_auction_ix = delete_auction(&delete_auction_args);

    // Invalid use case
    // Trying to delete active auction
    let delete_active_auction_error = testbench
        .process_transaction(&[delete_auction_ix.clone()], &payer, None)
        .await
        .err()
        .unwrap();

    assert_eq!(
        error::to_auction_error(delete_active_auction_error),
        AuctionContractError::AuctionIsActive,
    );

    // Freeze auction so it can be deleted
    testbench.warp_to_slot(50000);
    let auction_cycle_state_pubkey =
        get_auction_cycle_pubkey(&mut testbench, &auction_root_state_pubkey).await;
    let freeze_auction_args = FreezeAuctionArgs {
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
    };
    let freeze_instruction = freeze_auction(&freeze_auction_args);

    testbench
        .process_transaction(&[freeze_instruction], &auction_owner.keypair, None)
        .await
        .unwrap();

    // Delete auction
    testbench.warp_to_slot(50020);
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert_eq!(auction_pool.pool.len(), 1);
    testbench
        .process_transaction(&[delete_auction_ix], &payer, None)
        .await
        .unwrap();

    // Test if auction was removed from the pool
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert!(auction_pool.pool.is_empty());

    // Test if state accounts are deleted
    assert!(!is_existing_account(&mut testbench, &auction_root_state_pubkey).await);
    assert!(!is_existing_account(&mut testbench, &auction_bank_pubkey).await);
    assert!(are_given_cycle_states_deleted(&mut testbench, &auction_root_state_pubkey, 1, 4).await);
}

// Very similar to the previous test
// Only difference is that instead of freezing the auction it becomes inactive when closing last cycle
#[tokio::test]
async fn test_delete_inactive_auction() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 5,
        encore_period: 1,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(3),
    };

    let payer = testbench.clone_payer();

    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

    let (auction_pool_pubkey, _) =
        Pubkey::find_program_address(&get_auction_pool_seeds(&payer.pubkey()), &CONTRACT_ID);
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    close_n_cycles(&mut testbench, auction_id, &auction_owner, &payer, 3, 100).await;

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;

    assert!(!auction_root_state.status.is_active);

    let delete_auction_args = DeleteAuctionArgs {
        contract_admin_pubkey: payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        current_auction_cycle: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey)
            .await,
        num_of_cycles_to_delete: RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL,
    };
    let delete_auction_ix = delete_auction(&delete_auction_args);

    // Delete auction
    testbench.warp_to_slot(50000);
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert_eq!(auction_pool.pool.len(), 1);
    testbench
        .process_transaction(&[delete_auction_ix.clone()], &payer, None)
        .await
        .unwrap();

    // Test if auction was removed from the pool
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert!(auction_pool.pool.is_empty());

    // Test if state accounts are deleted
    assert!(!is_existing_account(&mut testbench, &auction_root_state_pubkey).await);
    assert!(!is_existing_account(&mut testbench, &auction_bank_pubkey).await);
    assert!(are_given_cycle_states_deleted(&mut testbench, &auction_root_state_pubkey, 1, 3).await);
}

#[tokio::test]
async fn test_delete_just_long_enough_auction() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 5,
        encore_period: 1,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL),
    };

    let payer = testbench.clone_payer();

    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

    let (auction_pool_pubkey, _) =
        Pubkey::find_program_address(&get_auction_pool_seeds(&payer.pubkey()), &CONTRACT_ID);
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    close_n_cycles(
        &mut testbench,
        auction_id,
        &auction_owner,
        &payer,
        RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL,
        1000,
    )
    .await;

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;

    assert!(!auction_root_state.status.is_active);

    let delete_auction_args = DeleteAuctionArgs {
        contract_admin_pubkey: payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        current_auction_cycle: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey)
            .await,
        num_of_cycles_to_delete: RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL,
    };
    let delete_auction_ix = delete_auction(&delete_auction_args);

    // Delete auction
    testbench.warp_to_slot(500000);
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert_eq!(auction_pool.pool.len(), 1);
    testbench
        .process_transaction(&[delete_auction_ix.clone()], &payer, None)
        .await
        .unwrap();

    // Test that auction is removed from the pool
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert!(auction_pool.pool.is_empty());

    // Test that state accounts are also deleted
    assert!(!is_existing_account(&mut testbench, &auction_root_state_pubkey).await);
    assert!(!is_existing_account(&mut testbench, &auction_bank_pubkey).await);
    assert!(
        are_given_cycle_states_deleted(&mut testbench, &auction_root_state_pubkey, 1, 30).await
    );
}

#[tokio::test]
async fn test_delete_long_auction() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 5,
        encore_period: 1,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL + 1),
    };

    let payer = testbench.clone_payer();

    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

    let (auction_pool_pubkey, _) =
        Pubkey::find_program_address(&get_auction_pool_seeds(&payer.pubkey()), &CONTRACT_ID);
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    close_n_cycles(&mut testbench, auction_id, &auction_owner, &payer, 31, 1000).await;

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;

    assert!(!auction_root_state.status.is_active);

    let mut delete_auction_args = DeleteAuctionArgs {
        contract_admin_pubkey: payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        current_auction_cycle: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey)
            .await,
        num_of_cycles_to_delete: RECOMMENDED_CYCLE_STATES_DELETED_PER_CALL,
    };
    let delete_auction_ix = delete_auction(&delete_auction_args);

    // Delete auction
    testbench.warp_to_slot(500000);
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert_eq!(auction_pool.pool.len(), 1);
    testbench
        .process_transaction(&[delete_auction_ix], &payer, None)
        .await
        .unwrap();

    // Test that auction is not yet removed from the pool
    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert_eq!(auction_pool.pool.len(), 1); // should still be present

    // Test that state accounts are not deleted
    assert!(is_existing_account(&mut testbench, &auction_root_state_pubkey).await);
    assert!(is_existing_account(&mut testbench, &auction_bank_pubkey).await);
    assert!(
        are_given_cycle_states_deleted(&mut testbench, &auction_root_state_pubkey, 2, 31).await
    );
    assert!(does_nth_cycle_state_exist(&mut testbench, &auction_root_state_pubkey, 1).await);

    delete_auction_args.current_auction_cycle =
        get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await;
    let delete_auction_ix = delete_auction(&delete_auction_args);
    testbench
        .process_transaction(&[delete_auction_ix], &payer, None)
        .await
        .unwrap();

    let auction_pool = testbench
        .get_and_deserialize_account_data::<AuctionPool>(&auction_pool_pubkey)
        .await;
    assert!(auction_pool.pool.is_empty()); // should be deleted now

    // Test that state accounts are now deleted
    assert!(!is_existing_account(&mut testbench, &auction_root_state_pubkey).await);
    assert!(!is_existing_account(&mut testbench, &auction_bank_pubkey).await);
    assert!(are_given_cycle_states_deleted(&mut testbench, &auction_root_state_pubkey, 1, 1).await);
}

async fn does_nth_cycle_state_exist(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
    n: u64,
) -> bool {
    let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(auction_root_state_pubkey, &n.to_le_bytes()),
        &CONTRACT_ID,
    );
    is_existing_account(testbench, &auction_cycle_state_pubkey).await
}

async fn are_given_cycle_states_deleted(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
    from: u64,
    to: u64,
) -> bool {
    for i in from..=to {
        if does_nth_cycle_state_exist(testbench, auction_root_state_pubkey, i).await {
            return false;
        }
    }
    true
}

async fn close_n_cycles(
    testbench: &mut Testbench,
    auction_id: AuctionId,
    auction_owner: &TestUser,
    payer: &Keypair,
    n: u64,
    current_slot_estimate: u64,
) {
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    for i in 0..n {
        testbench.warp_to_slot(current_slot_estimate + (i + 1) * 10000);

        let next_edition = get_next_child_edition(testbench, &auction_root_state_pubkey).await;

        let auction_cycle_state_pubkey =
            get_auction_cycle_pubkey(testbench, &auction_root_state_pubkey).await;

        let close_auction_cycle_args = CloseAuctionCycleArgs {
            payer_pubkey: payer.pubkey(),
            auction_owner_pubkey: auction_owner.keypair.pubkey(),
            top_bidder_pubkey: get_top_bidder_pubkey(testbench, &auction_cycle_state_pubkey).await,
            auction_id,
            next_cycle_num: next_edition,
            token_type: TokenType::Nft,
        };
        let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);

        testbench
            .process_transaction(&[close_auction_cycle_ix], payer, None)
            .await
            .unwrap();
    }
}
