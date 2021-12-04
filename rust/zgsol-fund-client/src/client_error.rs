use zgsol_fund_contract::AuctionContractError;

use solana_client::client_error::ClientError;
use zgsol_assertions::SolanaAssertionError;
use zgsol_connection::SolanaConnectionError;

#[derive(thiserror::Error, Debug)]
pub enum AuctionClientError {
    #[error(transparent)]
    InternalSolanaError(#[from] anyhow::Error),
    #[error("Could not parse u64 return value: {0}")]
    ConnectionError(#[from] SolanaConnectionError),
    #[error("Solana assertion error. {0}")]
    AssertionError(#[from] SolanaAssertionError),
    #[error("Rpc client error: {0}.")]
    RpcClientError(#[from] ClientError),
    #[error("Parse error: {0}.")]
    ParseError(#[from] std::io::Error),
    #[error("Contract error: {0}.")]
    ContractError(#[from] AuctionContractError),
    #[error("User is not admin")]
    UserIsNotAdmin,
}
