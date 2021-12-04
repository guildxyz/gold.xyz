use solana_client::rpc_client::RpcClient;
use solana_sdk::borsh::try_from_slice_unchecked;
use solana_sdk::bs58;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use solana_sdk::transaction::Transaction;
use structopt::StructOpt;
use zgsol_fund_contract::instruction::factory::{close_auction_cycle, CloseAuctionCycleArgs};
use zgsol_fund_contract::pda::{get_auction_cycle_state_seeds, get_auction_pool_seeds};
use zgsol_fund_contract::state::{
    AuctionCycleState, AuctionPool, AuctionRootState, TokenConfig, TokenType,
};

#[allow(unused)]
#[derive(Debug, StructOpt)]
struct Opt {
    #[structopt(long, short = "-t")]
    testnet: bool,
    #[structopt(long, short = "-d")]
    devnet: bool,
    #[structopt(long, short = "-m")]
    mainnet: bool,
}

const CONTRACT_ADMIN_PUBKEY_STR: &str = "DSj6JNpVvv8QUMw5W8vcMB4bgBcjVDxcRTir8va6gW66";
const PROGRAM_PUBKEY_STR: &str = "go1dcKcvafq8SDwmBKo6t2NVzyhvTEZJkMwnnfae99U";
#[rustfmt::skip]
const BOT_SECRET: [u8; 64] = [
  145, 203,  89,  29, 222, 184, 219, 205,   5,  91, 167,
   87,  77, 216,  87,  50, 224, 181,  43,  89, 184,  19,
  156, 223, 138, 207,  68,  76, 146, 103,  25, 215,  50,
  110, 172, 245, 231, 233,  15, 190, 123, 231,  13,  53,
  181, 240, 122, 168,  89, 178, 129,  58, 109, 184, 163,
   97, 191,  19, 114, 229, 113, 224,  40,  20
];
const MIN_BALANCE: u64 = 1_000_000_000; // lamports
const SLEEP_DURATION: u64 = 5000; // milliseconds

pub fn main() {
    let opt = Opt::from_args();
    let net = if opt.mainnet {
        "mainnet-beta"
    } else if opt.devnet {
        "devnet"
    } else {
        "testnet"
    };
    let connection_url = format!("https://api.{}.solana.com", net);
    // unwraps below are fine because we are working with pre-tested consts
    let bot_keypair = Keypair::from_bytes(&BOT_SECRET).unwrap();
    let connection = RpcClient::new_with_commitment(connection_url, CommitmentConfig::confirmed());
    let program_id_bytes = bs58::decode(PROGRAM_PUBKEY_STR).into_vec().unwrap();
    let program_id = Pubkey::new(&program_id_bytes);
    let contract_admin_bytes = bs58::decode(CONTRACT_ADMIN_PUBKEY_STR).into_vec().unwrap();
    let contract_admin_pubkey = Pubkey::new(&contract_admin_bytes);

    loop {
        if let Err(e) = try_main(
            &connection,
            &bot_keypair,
            &program_id,
            &contract_admin_pubkey,
        ) {
            println!("[ERROR] {:?}", e)
        }
    }
}

#[allow(deprecated)] // TODO remove this once solana 1.9.0 is out
fn try_main(
    connection: &RpcClient,
    bot_keypair: &Keypair,
    program_id: &Pubkey,
    contract_admin_pubkey: &Pubkey,
) -> Result<(), anyhow::Error> {
    // READ AUCTION POOL
    let (auction_pool_pubkey, _) =
        Pubkey::find_program_address(&get_auction_pool_seeds(contract_admin_pubkey), program_id);
    let auction_pool_data = connection.get_account_data(&auction_pool_pubkey)?;
    let auction_pool: AuctionPool = try_from_slice_unchecked(&auction_pool_data)?;

    // AIRDROP IF NECESSARY
    let bot_balance = connection.get_balance(&bot_keypair.pubkey())?;
    if bot_balance < MIN_BALANCE {
        let airdrop_signature = connection.request_airdrop(&bot_keypair.pubkey(), MIN_BALANCE)?;
        let mut i = 0;
        while !connection.confirm_transaction(&airdrop_signature)? {
            i += 1;
            if i <= 100 {
                break;
            }
        }
    }

    // GET CURRENT BLOCKCHAIN TIME
    let slot = connection.get_slot()?;
    let block_time = connection.get_block_time(slot)?;
    println!("[DEBUG] time: {} [s]", block_time);
    std::thread::sleep(std::time::Duration::from_millis(SLEEP_DURATION));
    // READ INDIVIDUAL STATES
    for (auction_id, state_pubkey) in auction_pool.pool.contents().iter() {
        let auction_state_data = connection.get_account_data(state_pubkey)?;
        let auction_state: AuctionRootState = try_from_slice_unchecked(&auction_state_data)?;
        let current_cycle_bytes = auction_state.status.current_auction_cycle.to_le_bytes();
        // IF FROZEN OR INACTIVE, CONTINUE ITERATION
        if auction_state.status.is_frozen || !auction_state.status.is_active {
            continue;
        }

        let (cycle_state_pubkey, _) = Pubkey::find_program_address(
            &get_auction_cycle_state_seeds(state_pubkey, &current_cycle_bytes),
            program_id,
        );
        let current_cycle_data = connection.get_account_data(&cycle_state_pubkey)?;
        let auction_cycle_state: AuctionCycleState = try_from_slice_unchecked(&current_cycle_data)?;

        // IF NOT EXPIRED, CONTINUE ITERATION
        if block_time < auction_cycle_state.end_time {
            continue;
        }

        let token_type = match auction_state.token_config {
            TokenConfig::Nft(_) => TokenType::Nft,
            TokenConfig::Token(_) => TokenType::Token,
        };

        let top_bidder = if auction_cycle_state.bid_history.is_empty() {
            None
        } else {
            let bid_history_len = auction_cycle_state.bid_history.len();
            auction_cycle_state
                .bid_history
                .get(bid_history_len - 1)
                .map(|x| x.bidder_pubkey)
        };
        let close_auction_cycle_args = CloseAuctionCycleArgs {
            payer_pubkey: bot_keypair.pubkey(),
            auction_owner_pubkey: auction_state.auction_owner,
            top_bidder_pubkey: top_bidder,
            auction_id: *auction_id,
            next_cycle_num: auction_state.status.current_auction_cycle,
            token_type,
        };
        let close_auction_cycle_ix = close_auction_cycle(&close_auction_cycle_args);

        // TODO `use get_latest_blockhash` once it's stable
        let (latest_blockhash, _) = connection.get_recent_blockhash()?;

        let transaction = Transaction::new_signed_with_payer(
            &[close_auction_cycle_ix],
            Some(&bot_keypair.pubkey()),
            &[bot_keypair],
            latest_blockhash,
        );

        // TODO use send_and_confirm_transaction once `get_latest_blockhash` is stabilized
        let signature = connection.send_transaction(&transaction).unwrap();
        println!("[DEBUG] tx signature: {:?}", signature);
    }

    Ok(())
}
