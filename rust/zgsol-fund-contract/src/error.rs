use num_derive::{FromPrimitive, ToPrimitive};
use solana_program::program_error::ProgramError;
use thiserror::Error;
use zgsol_utils::SignerPdaError;

#[derive(Error, Debug, PartialEq, Eq, FromPrimitive, ToPrimitive)]
pub enum AuctionContractError {
    #[error("Invalid instruction.")]
    InvalidInstruction = 500,
    #[error("Auction cycle ended but not closed.")]
    AuctionCycleEnded = 501,
    #[error("Auction is frozen.")]
    AuctionFrozen = 502,
    #[error("Auction is already initialized.")]
    AuctionAlreadyInitialized = 503,
    #[error("Contract is already initialized.")]
    ContractAlreadyInitialized = 504,
    #[error("Auction is in progress.")]
    AuctionIsInProgress = 505,
    #[error("Provided PDA seeds doesn't match the expected key.")]
    InvalidSeeds = 506,
    #[error("Invalid bid amount.")]
    InvalidBidAmount = 507,
    #[error("Auction owner required")]
    AuctionOwnerAuthenticationNeeded = 508,
    #[error("Start time cannot be in the past")]
    InvalidStartTime = 509,
    #[error("Top bidder account mismatch")]
    TopBidderAccountMismatch = 510,
    #[error("Master edition pubkey mismatch")]
    MasterEditionMismatch = 511,
    #[error("Next child edition number mismatch")]
    ChildEditionNumberMismatch = 512,
    #[error("Nft alredy exists")]
    NftAlreadyExists = 513,
    #[error("Invalid claim amount")]
    InvalidClaimAmount = 514,
    #[error("Auction ended")]
    AuctionEnded = 515,
    #[error("Auction id is not unique")]
    AuctionIdNotUnique = 516,
    #[error("Contract admin mismatch")]
    ContractAdminMismatch = 517,
    #[error("Auction is still active")]
    AuctionIsActive = 518,
    #[error("Metadata name or uri error")]
    MetadataManipulationError = 519,
}

impl From<AuctionContractError> for ProgramError {
    fn from(e: AuctionContractError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl From<SignerPdaError> for AuctionContractError {
    fn from(_: SignerPdaError) -> Self {
        AuctionContractError::InvalidSeeds
    }
}
