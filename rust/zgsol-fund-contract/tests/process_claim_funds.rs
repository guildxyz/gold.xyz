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
use zgsol_testbench::tokio;

const TRANSACTION_FEE: u64 = 5_000;
const AUCTION_CREATION_COST: u64 = 23_726_640 + TRANSACTION_FEE;
const CLOSE_AUCTION_CYCLE_COST_EXISTING_MARKER: u64 = 15_499_920;
const CLOSE_AUCTION_CYCLE_COST_NEW_MARKER: u64 =
    CLOSE_AUCTION_CYCLE_COST_EXISTING_MARKER + 1_113_600;

#[tokio::test]
async fn test_process_claim_funds() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 7,
        encore_period: 1,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(3),
    };

    let payer = testbench.clone_payer();

    let user_1 = TestUser::new(&mut testbench).await;
    let user_2 = TestUser::new(&mut testbench).await;
    let auction_cycle_payer = TestUser::new(&mut testbench).await.keypair;
    let initial_balance = 150_000_000;

    initialize_new_auction(
        &mut testbench,
        &auction_owner.keypair,
        auction_config,
        auction_id,
        TokenType::Nft,
    )
    .await
    .unwrap();

    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    assert_eq!(
        initial_balance - AUCTION_CREATION_COST,
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await
    );
    assert_eq!(
        initial_balance,
        get_account_lamports(&mut testbench, &user_1.keypair.pubkey()).await
    );
    assert_eq!(
        initial_balance,
        get_account_lamports(&mut testbench, &user_2.keypair.pubkey()).await
    );

    // Test single auction no bids were taken
    testbench.warp_to_slot(10_000);
    assert!(auction_cycle_state.end_time < testbench.block_time().await);

    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;

    let mut close_auction_cycle_args = CloseAuctionCycleArgs {
        payer_pubkey: auction_cycle_payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        auction_id,
        next_cycle_num: next_edition,
        token_type: TokenType::Nft,
    };

    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);

    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_cycle_payer.pubkey()).await;
    testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .unwrap();
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_cycle_payer.pubkey()).await;
    assert_eq!(
        CLOSE_AUCTION_CYCLE_COST_NEW_MARKER + TRANSACTION_FEE,
        payer_balance_before - payer_balance_after
    );

    let (auction_cycle_state_pubkey, _auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    let claim_amount = 1_000_000;
    let mut claim_funds_args = ClaimFundsArgs {
        contract_admin_pubkey: payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
        amount: claim_amount,
    };

    let claim_funds_ix = claim_funds(&claim_funds_args);

    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    let not_enough_funds_to_claim_error = testbench
        .process_transaction(&[claim_funds_ix.clone()], &auction_owner.keypair, None)
        .await
        .err()
        .unwrap();
    assert_eq!(
        error::to_auction_error(not_enough_funds_to_claim_error),
        AuctionContractError::InvalidClaimAmount
    );
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    assert_eq!(TRANSACTION_FEE, payer_balance_before - payer_balance_after);

    // Test single bid
    let bid_amount = 10_000_000;
    let bid_args = PlaceBidArgs {
        user_main_pubkey: user_1.keypair.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        amount: bid_amount,
    };

    let bid_instruction = place_bid(&bid_args);

    testbench
        .process_transaction(&[bid_instruction.clone()], &user_1.keypair, None)
        .await
        .unwrap();

    testbench.warp_to_slot(20_000);
    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;
    assert!(auction_cycle_state.end_time < testbench.block_time().await);

    // This should fail because it tries to claim funds from the current auction cycle
    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    let current_bid_claim_error = testbench
        .process_transaction(&[claim_funds_ix.clone()], &auction_owner.keypair, None)
        .await
        .err()
        .unwrap();
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    assert_eq!(TRANSACTION_FEE, payer_balance_before - payer_balance_after);

    assert_eq!(
        error::to_auction_error(current_bid_claim_error),
        AuctionContractError::InvalidClaimAmount
    );

    // This is necessary for some god-forsaken reason
    testbench.warp_to_slot(20_002);

    // Close auction cycle so that we can claim funds
    close_auction_cycle_args.next_cycle_num =
        get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;
    close_auction_cycle_args.top_bidder_pubkey =
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await;
    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);
    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_cycle_payer.pubkey()).await;
    testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .unwrap();
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_cycle_payer.pubkey()).await;
    assert_eq!(
        CLOSE_AUCTION_CYCLE_COST_EXISTING_MARKER + TRANSACTION_FEE,
        payer_balance_before - payer_balance_after
    );

    // This should be successul because the auction cycle of the bid has ended
    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;
    assert!(auction_cycle_state.end_time > testbench.block_time().await);

    claim_funds_args.cycle_number =
        get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await;
    let claim_funds_ix = claim_funds(&claim_funds_args);

    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    testbench
        .process_transaction(&[claim_funds_ix.clone()], &auction_owner.keypair, None)
        .await
        .unwrap();
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    assert_eq!(
        claim_amount / 20 * 19 - TRANSACTION_FEE,
        payer_balance_after - payer_balance_before
    );

    // Close last auction cycle
    testbench.warp_to_slot(30_000);

    assert!(auction_cycle_state.end_time < testbench.block_time().await);

    close_auction_cycle_args.next_cycle_num =
        get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;
    close_auction_cycle_args.top_bidder_pubkey =
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await;

    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);
    testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .unwrap();

    // Claim funds from the ended auction
    claim_funds_args.cycle_number =
        get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await;
    let claim_funds_ix = claim_funds(&claim_funds_args);

    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    testbench
        .process_transaction(&[claim_funds_ix.clone()], &auction_owner.keypair, None)
        .await
        .unwrap();
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    assert_eq!(
        claim_amount / 20 * 19 - TRANSACTION_FEE,
        payer_balance_after - payer_balance_before
    );

    // Freeze auction
    testbench.warp_to_slot(30_002);
    let freeze_args = FreezeAuctionArgs {
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
    };
    let freeze_instruction = freeze_auction(&freeze_args);
    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    testbench
        .process_transaction(&[freeze_instruction.clone()], &auction_owner.keypair, None)
        .await
        .unwrap();
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    assert_eq!(TRANSACTION_FEE, payer_balance_before - payer_balance_after);

    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    assert!(auction_root_state.status.is_frozen);

    // Claim funds from a frozen auction
    testbench.warp_to_slot(34_000);
    claim_funds_args.cycle_number =
        get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await;
    let claim_funds_ix = claim_funds(&claim_funds_args);
    let payer_balance_before =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    let contract_balance_before = get_account_lamports(&mut testbench, &payer.pubkey()).await;
    testbench
        .process_transaction(&[claim_funds_ix.clone()], &auction_owner.keypair, None)
        .await
        .unwrap();
    let payer_balance_after =
        get_account_lamports(&mut testbench, &auction_owner.keypair.pubkey()).await;
    let contract_balance_after = get_account_lamports(&mut testbench, &payer.pubkey()).await;
    assert_eq!(
        claim_amount / 20 * 19 - TRANSACTION_FEE,
        payer_balance_after - payer_balance_before
    );

    assert_eq!(
        claim_amount - (claim_amount / 20 * 19),
        contract_balance_after - contract_balance_before
    );
}
