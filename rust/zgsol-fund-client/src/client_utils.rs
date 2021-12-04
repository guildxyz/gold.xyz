use crate::client_error::AuctionClientError;

use solana_sdk::message::Message;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use solana_sdk::system_instruction;
use solana_sdk::system_program;
use solana_sdk::transaction::Transaction;
use zgsol_connection::{get_account_min_balance, SolanaConnection};

use anyhow::Context;

pub fn new_main_account(
    solana_connection: &SolanaConnection,
    seed: Option<&str>,
) -> Result<Keypair, AuctionClientError> {
    let account = if let Some(seed) = seed {
        Keypair::from_base58_string(seed)
    } else {
        Keypair::new()
    };

    if solana_connection
        .rpc_client
        .get_account(&account.pubkey())
        .is_err()
    {
        let min_balance = get_account_min_balance(solana_connection, 0)?;

        let create_account_ix = system_instruction::create_account(
            &solana_connection.admin_keypair.pubkey(),
            &account.pubkey(),
            min_balance + 100_000_000,
            0_u64,
            &system_program::id(),
        );

        let message = Message::new(
            &[create_account_ix],
            Some(&solana_connection.admin_keypair.pubkey()),
        );

        send_transaction_with_message(
            solana_connection,
            message,
            vec![&solana_connection.admin_keypair, &account],
        )?;
    }

    Ok(account)
}

pub fn send_transaction_with_message(
    solana_connection: &SolanaConnection,
    message: Message,
    signers: Vec<&Keypair>,
) -> Result<(), AuctionClientError> {
    let recent_blockhash_result = solana_connection
        .rpc_client
        .get_recent_blockhash()
        .context("Error querying recent blockhash.")?;
    let recent_blockhash = recent_blockhash_result.0;
    let mut transaction = Transaction::new_unsigned(message);
    transaction.try_sign(&signers, recent_blockhash).unwrap();
    solana_connection
        .rpc_client
        .send_and_confirm_transaction_with_spinner(&transaction)
        .unwrap();

    Ok(())
}
