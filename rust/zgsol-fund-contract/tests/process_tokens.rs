#![cfg(feature = "test-bpf")]
#![feature(string_remove_matches)]
mod error;
mod test_factory;

use test_factory::*;

use solana_program::program_option::COption;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::Signer;

use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::*;
use zgsol_fund_contract::state::*;
use zgsol_fund_contract::ID as CONTRACT_ID;
use zgsol_testbench::tokio;

#[tokio::test]
async fn test_process_tokens() {
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
        TokenType::Token,
    )
    .await
    .unwrap();

    let (auction_cycle_state_pubkey, auction_cycle_state) =
        get_auction_cycle_state(&mut testbench, &auction_root_state_pubkey).await;

    let (token_mint_pubkey, _) = Pubkey::find_program_address(
        &get_token_mint_seeds(&auction_id, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );

    let (contract_pda, _) = Pubkey::find_program_address(&get_contract_pda_seeds(), &CONTRACT_ID);

    let token_mint = testbench.get_mint_account(&token_mint_pubkey).await;

    assert_eq!(token_mint.mint_authority, COption::Some(contract_pda),);

    assert_eq!(token_mint.supply, 0);

    assert_eq!(token_mint.decimals, 1);

    assert!(token_mint.is_initialized);

    assert_eq!(token_mint.freeze_authority, COption::None,);

    // Test no bids were taken
    testbench.warp_to_slot(60000);
    let current_time = testbench.block_time().await;
    assert!(auction_cycle_state.end_time < current_time);

    let next_cycle_num = get_current_cycle_number(&mut testbench, &auction_root_state_pubkey).await;

    let close_auction_cycle_args = CloseAuctionCycleArgs {
        payer_pubkey: auction_cycle_payer.pubkey(),
        auction_owner_pubkey: auction_owner.keypair.pubkey(),
        top_bidder_pubkey: get_top_bidder_pubkey(&mut testbench, &auction_cycle_state_pubkey).await,
        auction_id,
        next_cycle_num,
        token_type: TokenType::Token,
    };

    let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);

    testbench
        .process_transaction(
            &[close_auction_cycle_ix.clone()],
            &auction_cycle_payer,
            None,
        )
        .await
        .unwrap();

    let token_mint = testbench.get_mint_account(&token_mint_pubkey).await;
    assert_eq!(token_mint.supply, 100,);

    let (token_holding_pubkey, _) = Pubkey::find_program_address(
        &get_token_holding_seeds(&token_mint_pubkey, &auction_owner.keypair.pubkey()),
        &CONTRACT_ID,
    );
    let token_holding = testbench.get_token_account(&token_holding_pubkey).await;
    assert_eq!(token_holding.amount, 100,);
    assert_eq!(token_holding.owner, auction_owner.keypair.pubkey(),);
}
