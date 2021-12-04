#![cfg(feature = "test-bpf")]
mod error;
mod test_factory;
use test_factory::*;

use solana_program::pubkey::Pubkey;
use solana_sdk::signer::Signer;
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::*;
use zgsol_fund_contract::state::*;
use zgsol_fund_contract::ID as CONTRACT_ID;
use zgsol_testbench::tokio;

const TRANSACTION_FEE: u64 = 5000;

#[tokio::test]
async fn test_process_freeze() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [2; 32];
    let auction_config = AuctionConfig {
        cycle_period: 100,
        encore_period: 30,
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

    // check state account
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    let (auction_cycle_state_pubkey, _auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;
    assert!(!auction_root_state.status.is_frozen);

    // Bid to auction once
    let user = TestUser::new(&mut testbench).await;
    let initial_balance = 150_000_000;
    assert_eq!(
        initial_balance,
        get_account_lamports(&mut testbench, &user.keypair.pubkey()).await
    );
    let bid_amount = 10_000_000;
    let cycle_number = get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await;
    let place_bid_args = PlaceBidArgs {
        user_main_pubkey: user.keypair.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        amount: bid_amount,
    };

    let bid_instruction = place_bid(&place_bid_args);

    testbench
        .process_transaction(&[bid_instruction.clone()], &user.keypair, None)
        .await
        .unwrap();

    assert_eq!(
        initial_balance - bid_amount - TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user.keypair.pubkey()).await
    );

    // Freezing auction
    let freeze_args = FreezeAuctionArgs {
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        cycle_number,
    };
    let freeze_instruction = freeze_auction(&freeze_args);
    testbench
        .process_transaction(&[freeze_instruction.clone()], &auction_owner.keypair, None)
        .await
        .unwrap();
    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    assert!(auction_root_state.status.is_frozen);
    assert_eq!(
        initial_balance - TRANSACTION_FEE,
        get_account_lamports(&mut testbench, &user.keypair.pubkey()).await
    );
    // Freezing already frozen auction
    // NOTE: has no effect
    testbench
        .process_transaction(&[freeze_instruction], &auction_owner.keypair, None)
        .await
        .unwrap();
    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(&auction_root_state_pubkey)
        .await;
    assert!(auction_root_state.status.is_frozen);
}
