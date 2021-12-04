use crate::error::AuctionContractError;
use crate::{
    MAX_AUCTION_NUM, MAX_BID_HISTORY_LENGTH, MAX_DESCRIPTION_LEN, MAX_SOCIALS_LEN, MAX_SOCIALS_NUM,
};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::clock::UnixTimestamp;
use solana_program::pubkey::Pubkey;
use zgsol_borsh_schema::BorshSchema;
use zgsol_utils::{AccountState, MaxLenBTreeMap, MaxLenString, MaxLenVec, MaxSerializedLen};

use metaplex_token_metadata::instruction::CreateMetadataAccountArgs;

pub type SocialsString = MaxLenString<MAX_SOCIALS_LEN>;
pub type SocialsVec = MaxLenVec<SocialsString, MAX_SOCIALS_NUM>;
pub type DescriptionString = MaxLenString<MAX_DESCRIPTION_LEN>;

#[repr(C)]
#[derive(BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, Debug, Clone)]
pub struct AuctionDescription {
    #[alias(String)]
    pub description: DescriptionString,
    #[alias(Vec<String>)]
    pub socials: SocialsVec,
    pub goal_treasury_amount: Option<u64>,
}

#[repr(C)]
#[derive(BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, Debug, Clone, Copy)]
pub struct AuctionConfig {
    /// Duration of an auction cycle.
    pub cycle_period: UnixTimestamp,
    /// Duration of the last bid required to complete the auction
    pub encore_period: UnixTimestamp,
    /// Number of cycles
    pub number_of_cycles: Option<u64>,
    /// Minimum bid accepted (in lamports!)
    pub minimum_bid_amount: u64,
}

#[repr(C)]
#[derive(BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, Debug, Clone)]
pub struct AuctionStatus {
    pub current_auction_cycle: u64,
    pub is_frozen: bool,
    pub is_active: bool,
}

#[repr(C)]
#[derive(BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, Debug, Clone)]
pub struct BidData {
    pub bidder_pubkey: Pubkey,
    pub bid_amount: u64,
}

#[derive(BorshSchema, BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum CreateTokenArgs {
    Nft(CreateMetadataAccountArgs),
    Token { decimals: u8, per_cycle_amount: u64 },
}

#[derive(BorshSchema, BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum TokenType {
    Nft,
    Token,
}

#[repr(C)]
#[derive(BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, Debug, Clone)]
pub struct NftData {
    pub master_edition: Pubkey,
}

#[repr(C)]
#[derive(BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, Debug, Clone)]
pub struct TokenData {
    pub mint: Pubkey,
    pub per_cycle_amount: u64,
}

#[repr(C)]
#[derive(BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, Debug, Clone)]
pub enum TokenConfig {
    Nft(NftData),
    Token(TokenData),
}

pub type BidHistory = MaxLenVec<BidData, MAX_BID_HISTORY_LENGTH>;
pub type AuctionId = [u8; 32];
pub type AuctionName = [u8; 32];

#[repr(C)]
#[derive(
    BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, AccountState, Debug, Clone,
)]
pub struct AuctionRootState {
    #[alias([u8; 32])]
    pub auction_name: AuctionName,
    pub auction_owner: Pubkey,
    pub description: AuctionDescription,
    pub auction_config: AuctionConfig,
    pub token_config: TokenConfig,
    pub status: AuctionStatus,
}

#[repr(C)]
#[derive(
    BorshSchema, BorshDeserialize, BorshSerialize, MaxSerializedLen, AccountState, Debug, Clone,
)]
pub struct AuctionCycleState {
    pub start_time: UnixTimestamp,
    pub end_time: UnixTimestamp,
    #[alias(Vec<BidData>)]
    pub bid_history: BidHistory,
}

#[repr(C)]
#[derive(
    BorshSchema, BorshDeserialize, BorshSerialize, AccountState, MaxSerializedLen, Debug, Clone,
)]
pub struct AuctionPool {
    #[alias(BTreeMap<[u8; 32], Pubkey>)]
    pub pool: MaxLenBTreeMap<AuctionId, Pubkey, MAX_AUCTION_NUM>,
}

#[repr(C)]
#[derive(
    BorshSchema, BorshDeserialize, BorshSerialize, AccountState, MaxSerializedLen, Debug, Clone,
)]
pub struct ContractBankState {
    pub contract_admin_pubkey: Pubkey,
}

#[repr(C)]
pub enum AuctionInteraction {
    Bid,
    CloseCycle,
}

#[repr(C)]
pub struct AuctionStateTemp<'a> {
    pub root_state: &'a AuctionRootState,
    pub cycle_state: &'a AuctionCycleState,
}

impl<'a> AuctionStateTemp<'a> {
    pub fn check_status(
        &self,
        current_timestamp: UnixTimestamp,
        interaction_type: AuctionInteraction,
    ) -> Result<(), AuctionContractError> {
        if self.root_state.status.is_frozen {
            return Err(AuctionContractError::AuctionFrozen);
        }
        if !self.root_state.status.is_active {
            return Err(AuctionContractError::AuctionEnded);
        }
        match interaction_type {
            AuctionInteraction::Bid => {
                if current_timestamp >= self.cycle_state.end_time {
                    return Err(AuctionContractError::AuctionCycleEnded);
                }
            }
            AuctionInteraction::CloseCycle => {
                if current_timestamp < self.cycle_state.end_time {
                    return Err(AuctionContractError::AuctionIsInProgress);
                }
            }
        }

        Ok(())
    }

    pub fn check_bid_amount(&self, bid_amount: u64) -> Result<(), AuctionContractError> {
        if bid_amount < self.root_state.auction_config.minimum_bid_amount {
            return Err(AuctionContractError::InvalidBidAmount);
        }
        if let Some(most_recent_bid) = self.cycle_state.bid_history.get_last_element() {
            if bid_amount <= most_recent_bid.bid_amount {
                return Err(AuctionContractError::InvalidBidAmount);
            }
        }
        Ok(())
    }

    pub fn is_last_auction_cycle(&self) -> bool {
        if let Some(number_of_cycles) = self.root_state.auction_config.number_of_cycles {
            return self.root_state.status.current_auction_cycle >= number_of_cycles;
        }
        false
    }
}

#[cfg(test)]
mod test_max_serialized_len {
    use super::*;
    use std::convert::TryInto;

    #[test]
    fn max_serialized_len() {
        let auction_config = AuctionConfig {
            cycle_period: 86400,
            encore_period: 300,
            minimum_bid_amount: 10_000,
            number_of_cycles: Some(5),
        };

        let mut bid_history = BidHistory::new();
        let bid_data = BidData {
            bid_amount: 0,
            bidder_pubkey: Pubkey::new_unique(),
        };
        for _ in 0..10 {
            bid_history.cyclic_push(bid_data.clone());
        }
        let auction_owner = Pubkey::new_unique();

        let token_config = TokenConfig::Token(TokenData {
            per_cycle_amount: 20000,
            mint: Pubkey::new_unique(),
        });

        let auction_status = AuctionStatus {
            is_active: true,
            is_frozen: false,
            current_auction_cycle: 1,
        };

        let description_string: DescriptionString =
            DescriptionString::new("X".repeat(MAX_DESCRIPTION_LEN));

        assert_eq!(
            DescriptionString::MAX_SERIALIZED_LEN,
            description_string.try_to_vec().unwrap().len()
        );

        let long_link: SocialsString = "X".repeat(MAX_SOCIALS_LEN).try_into().unwrap();
        let socials_vec: SocialsVec = std::iter::repeat(long_link)
            .take(MAX_SOCIALS_NUM)
            .collect::<Vec<SocialsString>>()
            .try_into()
            .unwrap();

        assert_eq!(
            SocialsVec::MAX_SERIALIZED_LEN,
            socials_vec.try_to_vec().unwrap().len()
        );

        let auction_description = AuctionDescription {
            description: description_string,
            socials: socials_vec,
            goal_treasury_amount: Some(420_000_000_000),
        };

        assert_eq!(
            AuctionDescription::MAX_SERIALIZED_LEN,
            auction_description.try_to_vec().unwrap().len()
        );

        let auction_name = [1; 32];

        let root_state = AuctionRootState {
            auction_name,
            auction_owner,
            description: auction_description,
            auction_config,
            token_config,
            status: auction_status,
        };

        assert_eq!(
            AuctionRootState::MAX_SERIALIZED_LEN,
            root_state.try_to_vec().unwrap().len()
        );

        let cycle_state = AuctionCycleState {
            start_time: 0,
            end_time: 100_000_000,
            bid_history: bid_history.clone(),
        };

        assert_eq!(
            AuctionCycleState::MAX_SERIALIZED_LEN,
            cycle_state.try_to_vec().unwrap().len()
        );
    }
}
