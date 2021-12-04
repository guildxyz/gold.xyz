use zgsol_connection::{get_account_data, SolanaConnection};
use zgsol_fund_contract::instruction::factory::*;
use zgsol_fund_contract::pda::get_auction_root_state_seeds;
use zgsol_fund_contract::state::{AuctionConfig, AuctionDescription, AuctionRootState};

use zgsol_utils::MaxLenString;

use crate::client_error::AuctionClientError;
use crate::client_utils::*;

use solana_sdk::borsh::try_from_slice_unchecked;
use solana_sdk::clock::UnixTimestamp;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::Signer;

use metaplex_token_metadata::instruction::CreateMetadataAccountArgs;
use metaplex_token_metadata::state::Data as MetadataStateData;

use std::convert::TryInto;

pub struct GoldClient {
    pub solana_connection: SolanaConnection,
}

impl GoldClient {
    pub fn new(solana_connection: SolanaConnection) -> Result<Self, AuctionClientError> {
        Ok(Self { solana_connection })
    }

    pub fn print_auction_state(
        &self,
        auction_id: [u8; 32],
        auction_owner: &Pubkey,
        program_id: &Pubkey,
    ) -> Result<(), AuctionClientError> {
        let (auction_state_pubkey, _) = Pubkey::find_program_address(
            &get_auction_root_state_seeds(&auction_id, auction_owner),
            program_id,
        );

        let acc_data = get_account_data(&self.solana_connection, &auction_state_pubkey)?;
        let auction_root_state: AuctionRootState = try_from_slice_unchecked(&acc_data)?;
        dbg!(auction_root_state);
        Ok(())
    }

    pub fn call_initialize_contract(&self) -> Result<(), AuctionClientError> {
        let admin = &self.solana_connection.admin_keypair;
        let auction_id = [123_u8; 32];
        let auction_config = AuctionConfig {
            cycle_period: 86400,
            encore_period: 300,
            minimum_bid_amount: 10_000,
            number_of_cycles: Some(10),
        };
        let auction_start_timestamp: Option<UnixTimestamp> = None;

        let metadata_args = CreateMetadataAccountArgs {
            data: MetadataStateData {
                name: "ZgeNft auction".to_owned(),
                symbol: "ZGN".to_owned(),
                uri: "uri".to_owned(),
                seller_fee_basis_points: 10,
                creators: None,
            },
            is_mutable: true,
        };

        let auction_owner = new_main_account(&self.solana_connection, None)?;

        let auction_name = [0; 32];

        let auction_description = AuctionDescription {
            description: MaxLenString::new("Cool description".to_string()),
            socials: vec![MaxLenString::new("https://www.gold.xyz".to_string())]
                .try_into()
                .unwrap(),
            goal_treasury_amount: Some(420_000_000_000),
        };

        let mut init_contract_ix = initialize_contract(&admin.pubkey());
        let init_auction_ix = initialize_auction(
            &auction_owner.pubkey(),
            &admin.pubkey(),
            &auction_id,
            &auction_name,
            auction_description,
            auction_config,
            metadata_args,
            auction_start_timestamp,
        );

        println!("contract address: {:?}", init_contract_ix.program_id);
        println!(
            "contract address: {:?}",
            self.solana_connection.program_pubkey
        );
        println!("contract address: {:?}", init_auction_ix.program_id);

        init_contract_ix.program_id = self.solana_connection.program_pubkey;

        //self.solana_connection.call_contract_with_instruction(init_contract_ix, &admin, vec![&admin])?;
        self.solana_connection.call_contract_with_instruction(
            init_auction_ix,
            admin,
            vec![admin, &auction_owner],
        )?;

        Ok(())
    }
}
