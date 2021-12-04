#![cfg(feature = "test-bpf")]
use metaplex_token_metadata::state::MasterEditionV2;
use solana_program::pubkey::Pubkey;
use solana_program::system_instruction;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use solana_sdk::transaction::TransactionError;
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::get_auction_cycle_state_seeds;
use zgsol_fund_contract::state::{
    AuctionConfig, AuctionCycleState, AuctionRootState, NftData, TokenConfig, TokenData, TokenType,
};
use zgsol_fund_contract::ID as CONTRACT_ID;
use zgsol_testbench::*;

#[allow(unused)]
pub struct TestContractConfig {
    pub auction_owner: TestUser,
    pub auction_id: [u8; 32],
}

pub struct TestUser {
    pub keypair: Keypair,
}

impl TestUser {
    pub async fn new(testbench: &mut Testbench) -> Self {
        let keypair = Keypair::new();

        // send lamports to user
        let instruction = system_instruction::transfer(
            &testbench.payer().pubkey(),
            &keypair.pubkey(),
            150_000_000,
        );

        let payer = testbench.clone_payer();

        testbench
            .process_transaction(&[instruction], &payer, None)
            .await
            .unwrap();

        Self { keypair }
    }
}

#[allow(unused)]
pub async fn get_next_child_edition(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
) -> u64 {
    let nft_data = get_nft_data(testbench, auction_root_state_pubkey)
        .await
        .unwrap();

    let master_edition_data = testbench
        .get_and_deserialize_account_data::<MasterEditionV2>(&nft_data.master_edition)
        .await;
    master_edition_data.supply + 1
}

#[allow(unused)]
pub async fn get_nft_data(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
) -> Option<NftData> {
    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(auction_root_state_pubkey)
        .await;
    match auction_root_state.token_config {
        TokenConfig::Token(_) => None,
        TokenConfig::Nft(nft_data) => Some(nft_data),
    }
}

#[allow(unused)]
pub async fn get_token_data(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
) -> Option<TokenData> {
    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(auction_root_state_pubkey)
        .await;
    match auction_root_state.token_config {
        TokenConfig::Token(token_data) => Some(token_data),
        TokenConfig::Nft(_) => None,
    }
}

#[allow(unused)]
pub async fn get_current_cycle_number(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
) -> u64 {
    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(auction_root_state_pubkey)
        .await;
    auction_root_state.status.current_auction_cycle
}

#[allow(unused)]
pub async fn get_top_bidder_pubkey(
    testbench: &mut Testbench,
    auction_cycle_state_pubkey: &Pubkey,
) -> Option<Pubkey> {
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(auction_cycle_state_pubkey)
        .await;
    auction_cycle_state
        .bid_history
        .get_last_element()
        .map(|bid_data| bid_data.bidder_pubkey)
}

#[allow(unused)]
pub async fn initialize_new_auction(
    testbench: &mut Testbench,
    auction_owner: &Keypair,
    auction_config: AuctionConfig,
    auction_id: [u8; 32],
    token_type: TokenType,
) -> Result<(), TransactionError> {
    let initialize_auction_args = InitializeAuctionArgs::new_test(
        testbench.payer().pubkey(),
        auction_owner.pubkey(),
        auction_config,
        auction_id,
        token_type,
    );
    let instruction = initialize_auction(&initialize_auction_args);

    testbench
        .process_transaction(&[instruction], auction_owner, None)
        .await
}

#[allow(unused)]
pub async fn get_auction_cycle_pubkey(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
) -> Pubkey {
    let auction_root_state = testbench
        .get_and_deserialize_account_data::<AuctionRootState>(auction_root_state_pubkey)
        .await;

    let cycle_number_bytes = auction_root_state
        .status
        .current_auction_cycle
        .to_le_bytes();
    let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(auction_root_state_pubkey, &cycle_number_bytes),
        &CONTRACT_ID,
    );

    auction_cycle_state_pubkey
}

#[allow(unused)]
pub async fn is_existing_account(testbench: &mut Testbench, account_pubkey: &Pubkey) -> bool {
    testbench
        .client()
        .get_account(*account_pubkey)
        .await
        .unwrap()
        .is_some()
}

#[allow(unused)]
pub async fn get_auction_cycle_state(
    testbench: &mut Testbench,
    auction_root_state_pubkey: &Pubkey,
) -> (Pubkey, AuctionCycleState) {
    let auction_cycle_state_pubkey =
        get_auction_cycle_pubkey(testbench, auction_root_state_pubkey).await;
    let auction_cycle_state = testbench
        .get_and_deserialize_account_data::<AuctionCycleState>(&auction_cycle_state_pubkey)
        .await;

    (auction_cycle_state_pubkey, auction_cycle_state)
}

#[allow(unused)]
pub async fn testbench_setup() -> (Testbench, TestUser) {
    let program_id = zgsol_fund_contract::id();
    let testbench_program = TestbenchProgram {
        name: "zgsol_fund_contract",
        id: program_id,
        process_instruction: processor!(zgsol_fund_contract::processor::process),
    };

    // load metadata program binary
    let meta_program_id = metaplex_token_metadata::id();
    let meta_program = TestbenchProgram {
        name: "spl_token_metadata",
        id: meta_program_id,
        process_instruction: None,
    };

    let mut testbench = Testbench::new(&[testbench_program, meta_program]).await;
    let initialize_contract_args = InitializeContractArgs {
        contract_admin_pubkey: testbench.payer().pubkey(),
    };
    let init_contract_ix = initialize_contract(&initialize_contract_args);
    testbench
        .process_transaction(&[init_contract_ix], &testbench.clone_payer(), None)
        .await
        .unwrap();

    let auction_owner = TestUser::new(&mut testbench).await;

    (testbench, auction_owner)
}

#[allow(unused)]
pub async fn get_account_lamports(testbench: &mut Testbench, account_pubkey: &Pubkey) -> u64 {
    let account = testbench
        .client()
        .get_account(*account_pubkey)
        .await
        .unwrap()
        .unwrap();
    account.lamports
}
