use super::*;
use std::convert::TryInto;
use zgsol_utils::MaxLenString;

// TODO: Optional max supply for ERC20 tokens

#[derive(BorshSchema, BorshSerialize, BorshDeserialize)]
pub struct InitializeAuctionArgs {
    pub contract_admin_pubkey: Pubkey,
    pub auction_owner_pubkey: Pubkey,
    #[alias([u8; 32])]
    pub auction_id: AuctionId,
    #[alias([u8; 32])]
    pub auction_name: AuctionName,
    pub auction_config: AuctionConfig,
    pub auction_description: AuctionDescription,
    pub create_token_args: CreateTokenArgs,
    pub auction_start_timestamp: Option<UnixTimestamp>,
}

impl InitializeAuctionArgs {
    pub fn new_test(
        admin: Pubkey,
        owner: Pubkey,
        config: AuctionConfig,
        id: [u8; 32],
        token_type: TokenType,
    ) -> Self {
        let create_token_args = match token_type {
            TokenType::Nft => CreateTokenArgs::Nft(CreateMetadataAccountArgs {
                data: metaplex_token_metadata::state::Data {
                    name: "random auction #1".to_owned(),
                    symbol: "RAND".to_owned(),
                    uri: "uri/1.jpg".to_owned(),
                    seller_fee_basis_points: 10,
                    creators: None,
                },
                is_mutable: true,
            }),
            TokenType::Token => CreateTokenArgs::Token {
                decimals: 1,
                per_cycle_amount: 100,
            },
        };

        Self {
            contract_admin_pubkey: admin,
            auction_owner_pubkey: owner,
            auction_id: id,
            auction_name: [111; 32],
            auction_config: config,
            auction_description: AuctionDescription {
                description: MaxLenString::new("Cool description".to_string()),
                socials: vec![MaxLenString::new("https://www.gold.xyz".to_string())]
                    .try_into()
                    .unwrap(),
                goal_treasury_amount: Some(420_000_000_000),
            },
            create_token_args,
            auction_start_timestamp: None,
        }
    }
}

pub fn initialize_auction(args: &InitializeAuctionArgs) -> Instruction {
    let (auction_root_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_root_state_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );
    let (auction_cycle_state_pubkey, _) = Pubkey::find_program_address(
        &get_auction_cycle_state_seeds(&auction_root_state_pubkey, &1_u64.to_le_bytes()),
        &crate::ID,
    );
    let (auction_bank_pubkey, _) = Pubkey::find_program_address(
        &get_auction_bank_seeds(&args.auction_id, &args.auction_owner_pubkey),
        &crate::ID,
    );

    let (auction_pool_pubkey, _) = Pubkey::find_program_address(
        &get_auction_pool_seeds(&args.contract_admin_pubkey),
        &crate::ID,
    );

    let (contract_pda, _) = Pubkey::find_program_address(&get_contract_pda_seeds(), &crate::ID);

    let mut accounts = vec![
        AccountMeta::new(args.auction_owner_pubkey, true),
        AccountMeta::new(auction_pool_pubkey, false),
        AccountMeta::new(auction_root_state_pubkey, false),
        AccountMeta::new(auction_cycle_state_pubkey, false),
        AccountMeta::new(auction_bank_pubkey, false),
        AccountMeta::new_readonly(contract_pda, false),
        AccountMeta::new_readonly(RENT_ID, false),
        AccountMeta::new_readonly(SYS_ID, false),
        AccountMeta::new_readonly(TOKEN_ID, false),
    ];

    let mut token_accounts = match args.create_token_args {
        CreateTokenArgs::Nft(_) => {
            let master_pdas = EditionPda::new(
                EditionType::Master,
                &args.auction_id,
                &args.auction_owner_pubkey,
            );
            vec![
                AccountMeta::new(master_pdas.edition, false),
                AccountMeta::new(master_pdas.holding, false),
                AccountMeta::new(master_pdas.metadata, false),
                AccountMeta::new(master_pdas.mint, false),
                AccountMeta::new_readonly(META_ID, false),
            ]
        }
        CreateTokenArgs::Token { .. } => {
            let (token_mint_pubkey, _) = Pubkey::find_program_address(
                &get_token_mint_seeds(&args.auction_id, &args.auction_owner_pubkey),
                &crate::ID,
            );
            vec![AccountMeta::new(token_mint_pubkey, false)]
        }
    };

    accounts.append(&mut token_accounts);

    let instruction = AuctionInstruction::InitializeAuction {
        id: args.auction_id,
        auction_name: args.auction_name,
        auction_config: args.auction_config,
        description: args.auction_description.clone(),
        create_token_args: args.create_token_args.clone(),
        auction_start_timestamp: args.auction_start_timestamp,
    };
    // unwrap is fine because instruction is serializable
    let data = instruction.try_to_vec().unwrap();
    Instruction {
        program_id: crate::ID,
        accounts,
        data,
    }
}
