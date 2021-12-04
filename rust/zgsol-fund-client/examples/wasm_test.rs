use borsh::BorshSerialize;
use metaplex_token_metadata::instruction::CreateMetadataAccountArgs;
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::solana_program::pubkey::Pubkey;
use zgsol_fund_contract::state::{AuctionConfig, AuctionDescription, CreateTokenArgs};
use zgsol_utils::MaxLenString;

use std::convert::TryInto;

pub fn main() {
    let args = InitializeAuctionArgs {
        contract_admin_pubkey: Pubkey::new_unique(),
        auction_owner_pubkey: Pubkey::new_unique(),
        auction_id: [77; 32],
        auction_name: [55; 32],
        auction_config: AuctionConfig {
            cycle_period: 1000,
            encore_period: 500,
            number_of_cycles: Some(13),
            minimum_bid_amount: 10_000_000,
        },
        auction_description: AuctionDescription {
            description: MaxLenString::new("Cool description".to_string()),
            socials: vec![MaxLenString::new("https://www.gold.xyz".to_string())]
                .try_into()
                .unwrap(),
            goal_treasury_amount: Some(420_000_000_000),
        },
        create_token_args: CreateTokenArgs::Nft(CreateMetadataAccountArgs {
            data: metaplex_token_metadata::state::Data {
                name: "random auction #1".to_owned(),
                symbol: "RAND".to_owned(),
                uri: "uri/1.jpg".to_owned(),
                seller_fee_basis_points: 10,
                creators: None,
            },
            is_mutable: true,
        }),
        auction_start_timestamp: None,
    };

    let serialized = args.try_to_vec().unwrap();
    println!("init auction:\n{:?}", serialized);

    let args = FreezeAuctionArgs {
        auction_owner_pubkey: Pubkey::new_unique(),
        auction_id: [104; 32],
        top_bidder_pubkey: Some(Pubkey::new_unique()),
        cycle_number: 17,
    };

    let serialized = args.try_to_vec().unwrap();
    println!("freeze:\n{:?}", serialized);

    let args = PlaceBidArgs {
        user_main_pubkey: Pubkey::new_unique(),
        auction_owner_pubkey: Pubkey::new_unique(),
        auction_id: [23; 32],
        cycle_number: 150,
        top_bidder_pubkey: None,
        amount: 100_000_000,
    };

    let serialized = args.try_to_vec().unwrap();
    println!("bid:\n{:?}", serialized);

    let args = ClaimFundsArgs {
        contract_admin_pubkey: Pubkey::new_unique(),
        auction_owner_pubkey: Pubkey::new_unique(),
        auction_id: [87; 32],
        cycle_number: 11,
        amount: 12345678,
    };

    let serialized = args.try_to_vec().unwrap();
    println!("claim funds:\n{:?}", serialized);

    let args = DeleteAuctionArgs {
        contract_admin_pubkey: Pubkey::new_unique(),
        auction_owner_pubkey: Pubkey::new_unique(),
        auction_id: [107; 32],
        current_auction_cycle: 120,
        num_of_cycles_to_delete: 45,
    };

    let serialized = args.try_to_vec().unwrap();
    println!("delete:\n{:?}", serialized);
}
