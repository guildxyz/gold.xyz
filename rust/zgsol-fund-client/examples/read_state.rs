pub fn main() {}
/*
use zgsol_fund_client::*;

use solana_sdk::pubkey::Pubkey;
use zgsol_connection::*;

const PROGRAM_PUBKEY: Pubkey = Pubkey::new_from_array([
    164, 63, 52, 124, 240, 47, 140, 6, 25, 245, 245, 104, 33, 182, 189, 97, 155, 57, 52, 190, 177,
    245, 232, 57, 17, 76, 135, 102, 158, 31, 45, 110,
]);

const AUCTION_OWNER: &str = "95b225CEtMmkRYUpg626DNqen55FgwEGbH5NKVXHUejT";

const AUCTION_ID: [u8; 32] = [
    1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 42,
];

const CONNECTION_TYPE: SolanaConnectionType = SolanaConnectionType::Admin {
    program_keypair_file: PROGRAM_KEYPAIR_FILE,
};

fn pubkey_from_base58(pubkey_str: &str) -> Pubkey {
    let base58 = bs58::decode(pubkey_str).into_vec().unwrap();

    let mut pubkey_array: [u8; 32] = Default::default();
    pubkey_array.copy_from_slice(&base58.as_slice()[0..32]);
    Pubkey::new_from_array(pubkey_array)
}

fn main() -> Result<(), AuctionClientError> {
    let solana_connection = SolanaConnection::new(CONNECTION_TYPE)?;
    let gold_client = GoldClient::new(solana_connection)?;

    gold_client.print_auction_state(
        AUCTION_ID,
        &pubkey_from_base58(AUCTION_OWNER),
        &PROGRAM_PUBKEY,
    )?;
    Ok(())
}
*/
