#![cfg(feature = "test-bpf")]
#![feature(string_remove_matches)]
mod error;
mod test_factory;

use test_factory::*;

use metaplex_token_metadata::state::{Data as MetadataStateData, Metadata};
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::Signer;
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::*;
use zgsol_fund_contract::processor::{increment_name, increment_uri};
use zgsol_fund_contract::state::*;
use zgsol_fund_contract::AuctionContractError;
use zgsol_fund_contract::ID as CONTRACT_ID;
use zgsol_testbench::tokio;

const TRANSACTION_FEE: u64 = 5_000;
const CLOSE_AUCTION_CYCLE_LAST_CYCLE: u64 = 12_799_440;
const CLOSE_AUCTION_CYCLE_COST_EXISTING_MARKER: u64 = 15_499_920;
const CLOSE_AUCTION_CYCLE_COST_NEW_MARKER: u64 =
    CLOSE_AUCTION_CYCLE_COST_EXISTING_MARKER + 1_113_600;

#[tokio::test]
async fn test_process_close_auction_cycle() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 6,
        encore_period: 2,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(1000),
    };

    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    let user_1 = TestUser::new(&mut testbench).await;
    let user_2 = TestUser::new(&mut testbench).await;
    let auction_cycle_payer = TestUser::new(&mut testbench).await.keypair;
    let initial_balance = 150_000_000;

    assert_eq!(
        initial_balance,
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
    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    // TODO
    //assert_eq!(auction_state.auction_id, auction_id);
    assert_eq!(
        auction_root_state.auction_config.cycle_period,
        auction_config.cycle_period
    );
    assert_eq!(
        auction_root_state.auction_config.encore_period,
        auction_config.encore_period
    );
    assert!(auction_cycle_state.bid_history.get_last_element().is_none());

    // Test no bids were taken
    testbench.warp_to_slot(6000);
    let current_time = testbench.block_time().await;
    assert!(auction_cycle_state.end_time < current_time);

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
    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    // Check if auction timings were correctly updated
    let current_time = testbench.block_time().await;
    assert!(current_time < auction_cycle_state.end_time);

    // Check minted nft
    assert_eq!(next_edition, 1);
    let child_edition = EditionPda::new(
        EditionType::Child(next_edition),
        &auction_id,
        &auction_owner.keypair.pubkey(),
    );

    let first_nft_account = testbench.get_token_account(&child_edition.holding).await;
    let child_mint_account = testbench.get_mint_account(&child_edition.mint).await;
    assert_eq!(first_nft_account.mint, child_edition.mint);
    assert_eq!(first_nft_account.owner, auction_owner.keypair.pubkey());
    assert_eq!(first_nft_account.amount, 1);
    assert_eq!(child_mint_account.supply, 1);

    // 5000 lamports is the transaction fee
    //let rent = testbench.rent.minimum_balance(TokenAccount::LEN);
    //assert_eq!(payer_balance_before - 5000 - rent, payer_balance_after);

    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;

    // Check if other data are unchanged
    assert_eq!(
        auction_root_state.auction_config.cycle_period,
        auction_config.cycle_period
    );
    assert_eq!(
        auction_root_state.auction_config.encore_period,
        auction_config.encore_period
    );
    assert!(auction_cycle_state.bid_history.get_last_element().is_none());

    // Test some bids were taken
    let bid_amount = 10_000_000;
    let place_bid_args = PlaceBidArgs {
        user_main_pubkey: user_1.keypair.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        amount: bid_amount,
    };
    let bid_instruction = place_bid(&place_bid_args);

    testbench
        .process_transaction(&[bid_instruction.clone()], &user_1.keypair, None)
        .await
        .unwrap();

    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;

    assert_eq!(
        auction_cycle_state
            .bid_history
            .get_last_element()
            .unwrap()
            .bidder_pubkey,
        user_1.keypair.pubkey(),
    );
    assert_eq!(
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey)
            .await
            .unwrap(),
        user_1.keypair.pubkey(),
    );
    assert_eq!(
        auction_cycle_state
            .bid_history
            .get_last_element()
            .unwrap()
            .bid_amount,
        bid_amount
    );

    testbench.warp_to_slot(12000);
    assert!(auction_cycle_state.end_time < testbench.block_time().await);

    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;

    close_auction_cycle_args.top_bidder_pubkey =
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await;
    close_auction_cycle_args.next_cycle_num = next_edition;
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

    let (auction_cycle_state_pubkey, _auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    // Check if asset holding is created and asset is minted
    assert_eq!(next_edition, 2);
    let child_edition = EditionPda::new(
        EditionType::Child(next_edition),
        &auction_id,
        &auction_owner.keypair.pubkey(),
    );

    let user_1_nft_account = testbench.get_token_account(&child_edition.holding).await;
    let child_mint_account = testbench.get_mint_account(&child_edition.mint).await;
    assert_eq!(user_1_nft_account.mint, child_edition.mint);
    assert_eq!(user_1_nft_account.owner, user_1.keypair.pubkey());
    assert_eq!(user_1_nft_account.amount, 1);
    assert_eq!(child_mint_account.supply, 1);

    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;
    assert!(auction_cycle_state.bid_history.get_last_element().is_none());

    // NOTE Long test, doesn't need to be run every time
    // TODO consider removing it?
    /*
    for child_nft_num in 4..600{
        testbench.warp_to_slot(child_nft_num * 500);
        let (auction_cycle_state_pubkey, auction_cycle_state) = get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

        assert!(auction_cycle_state.end_time < testbench.block_time().await);

        let next_edition =
            get_next_child_edition(&mut testbench, &auction_root_state.nft_data.master_edition).await;

        let close_auction_cycle_ix = close_auction_cycle(
            &auction_cycle_payer.pubkey(),
            &payer.pubkey(),
            &auction_owner.keypair.pubkey(),
            get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
            &auction_id,
            next_edition,
        );

        let payer_balance_before = get_account_lamports(&mut testbench, &auction_cycle_payer.pubkey()).await;
        testbench
            .process_transaction(&[close_auction_cycle_ix.clone()], &auction_cycle_payer, None)
            .await
            .unwrap();
        let payer_balance_after = get_account_lamports(&mut testbench, &auction_cycle_payer.pubkey()).await;

        if child_nft_num % 248 == 0{
            assert_eq!(CLOSE_AUCTION_CYCLE_COST_NEW_MARKER + TRANSACTION_FEE, payer_balance_before - payer_balance_after);
        }else{
            assert_eq!(CLOSE_AUCTION_CYCLE_COST_EXISTING_MARKER + TRANSACTION_FEE, payer_balance_before - payer_balance_after);
        }
    }
    */
}

#[tokio::test]
async fn test_ended_auction() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 1,
        encore_period: 0,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(1),
    };

    let user = TestUser::new(&mut testbench).await;
    let auction_cycle_payer = TestUser::new(&mut testbench).await.keypair;

    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
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

    testbench.warp_to_slot(10000);

    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;
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
        CLOSE_AUCTION_CYCLE_LAST_CYCLE + TRANSACTION_FEE,
        payer_balance_before - payer_balance_after
    );
    testbench.warp_to_slot(20000);
    let (auction_cycle_state_pubkey, _auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    // Invalid use case
    // Test bid on ended auction
    let bid_amount_higher = 2_000_000;
    let place_bid_args = PlaceBidArgs {
        user_main_pubkey: user.keypair.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        auction_id,
        cycle_number: get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await,
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        amount: bid_amount_higher,
    };
    let bid_instruction = place_bid(&place_bid_args);

    // Invalid use case
    // Close cycle on ended auction
    let bid_on_ended_auction_error = testbench
        .process_transaction(&[bid_instruction.clone()], &user.keypair, None)
        .await
        .err()
        .unwrap();

    assert_eq!(
        error::to_auction_error(bid_on_ended_auction_error),
        AuctionContractError::AuctionEnded
    );

    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;

    close_auction_cycle_args.top_bidder_pubkey =
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await;
    close_auction_cycle_args.next_cycle_num = next_edition - 1;
    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);
    let close_cycle_on_ended_auction_error = testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .err()
        .unwrap();
    assert_eq!(
        error::to_auction_error(close_cycle_on_ended_auction_error),
        AuctionContractError::AuctionEnded
    );
}

#[tokio::test]
async fn test_frozen_auction() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 1,
        encore_period: 0,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(1),
    };

    let auction_cycle_payer = TestUser::new(&mut testbench).await.keypair;

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

    testbench.warp_to_slot(6000);
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;
    assert!(auction_cycle_state.end_time < testbench.block_time().await);

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

    // Invalid use case
    // End cycle on frozen auction
    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;

    let close_auction_cycle_args = CloseAuctionCycleArgs {
        payer_pubkey: auction_cycle_payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        auction_id,
        next_cycle_num: next_edition,
        token_type: TokenType::Nft,
    };
    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);

    testbench.warp_to_slot(6002);
    let close_cycle_on_frozen_auction_error = testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .err()
        .unwrap();
    assert_eq!(
        error::to_auction_error(close_cycle_on_frozen_auction_error),
        AuctionContractError::AuctionFrozen
    );
}

#[tokio::test]
async fn test_child_metadata_change() {
    let (mut testbench, auction_owner) = test_factory::testbench_setup().await;

    let auction_id = [1; 32];
    let auction_config = AuctionConfig {
        cycle_period: 5,
        encore_period: 1,
        minimum_bid_amount: 100_000, // lamports
        number_of_cycles: Some(3),
    };

    let auction_cycle_payer = TestUser::new(&mut testbench).await.keypair;

    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&auction_id, &auction_owner.keypair.pubkey()),
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

    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    // Close the first cycle
    testbench.warp_to_slot(10000);
    let current_time = testbench.block_time().await;
    assert!(auction_cycle_state.end_time < current_time);

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

    let master_edition = EditionPda::new(
        EditionType::Master,
        &auction_id,
        &auction_owner.keypair.pubkey(),
    );
    let master_metadata_before = testbench
        .get_and_deserialize_account_data::<Metadata>(&master_edition.metadata)
        .await;

    testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .unwrap();

    // Check minted nft
    assert_eq!(next_edition, 1);
    let child_edition = EditionPda::new(
        EditionType::Child(next_edition),
        &auction_id,
        &auction_owner.keypair.pubkey(),
    );

    let master_metadata_after = testbench
        .get_and_deserialize_account_data::<Metadata>(&master_edition.metadata)
        .await;
    let child_metadata = testbench
        .get_and_deserialize_account_data::<Metadata>(&child_edition.metadata)
        .await;

    check_metadata_update(
        &master_metadata_before,
        &master_metadata_after,
        &child_metadata,
        false,
    );

    // Close the second cycle
    testbench.warp_to_slot(20000);
    let current_time = testbench.block_time().await;
    assert!(auction_cycle_state.end_time < current_time);

    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;

    close_auction_cycle_args.top_bidder_pubkey =
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await;
    close_auction_cycle_args.next_cycle_num = next_edition;
    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);

    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;
    let master_metadata_before = master_metadata_after.clone();

    testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .unwrap();

    // Check minted nft
    assert_eq!(next_edition, 2);
    let child_edition = EditionPda::new(
        EditionType::Child(next_edition),
        &auction_id,
        &auction_owner.keypair.pubkey(),
    );

    let master_metadata_after = testbench
        .get_and_deserialize_account_data::<Metadata>(&master_edition.metadata)
        .await;
    let child_metadata = testbench
        .get_and_deserialize_account_data::<Metadata>(&child_edition.metadata)
        .await;

    check_metadata_update(
        &master_metadata_before,
        &master_metadata_after,
        &child_metadata,
        false,
    );

    // Close the third (last) cycle
    testbench.warp_to_slot(30000);
    let current_time = testbench.block_time().await;
    assert!(auction_cycle_state.end_time < current_time);

    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;

    close_auction_cycle_args.top_bidder_pubkey =
        get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await;
    close_auction_cycle_args.next_cycle_num = next_edition;
    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);

    let next_edition = get_next_child_edition(&mut testbench, &auction_root_state_pubkey).await;
    let master_metadata_before = master_metadata_after.clone();

    testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .unwrap();

    // Check minted nft
    assert_eq!(next_edition, 3);
    let child_edition = EditionPda::new(
        EditionType::Child(next_edition),
        &auction_id,
        &auction_owner.keypair.pubkey(),
    );

    let master_metadata_after = testbench
        .get_and_deserialize_account_data::<Metadata>(&master_edition.metadata)
        .await;
    let child_metadata = testbench
        .get_and_deserialize_account_data::<Metadata>(&child_edition.metadata)
        .await;

    check_metadata_update(
        &master_metadata_before,
        &master_metadata_after,
        &child_metadata,
        true,
    );
}

fn check_metadata_update(
    master_metadata_before: &Metadata,
    master_metadata_after: &Metadata,
    child_metadata: &Metadata,
    is_last_cycle: bool,
) {
    let mut master_metadata_before = master_metadata_before.data.clone();
    let mut master_metadata_after = master_metadata_after.data.clone();
    let child_metadata = child_metadata.data.clone();

    assert_eq!(master_metadata_before.name, child_metadata.name);

    increment_name(&mut master_metadata_before.name, is_last_cycle).unwrap();
    increment_uri(&mut master_metadata_before.uri, is_last_cycle).unwrap();
    unpuff_metadata(&mut master_metadata_before);
    unpuff_metadata(&mut master_metadata_after);

    assert_eq!(master_metadata_before, master_metadata_after);
}

fn unpuff_metadata(metadata_state_data: &mut MetadataStateData) {
    metadata_state_data.name.remove_matches("\u{0}");
    metadata_state_data.uri.remove_matches("\u{0}");
    metadata_state_data.symbol.remove_matches("\u{0}");
}
