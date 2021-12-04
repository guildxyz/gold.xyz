pub mod factory;

use metaplex_token_metadata::state::{EDITION, PREFIX};
use solana_program::pubkey::Pubkey;

pub fn get_contract_pda_seeds<'a>() -> [&'a [u8]; 1] {
    [b"auction_contract"]
}

pub fn get_auction_pool_seeds(admin: &Pubkey) -> [&[u8]; 2] {
    [b"auction_pool", admin.as_ref()]
}

pub fn get_auction_bank_seeds<'a>(
    auction_id: &'a [u8],
    auction_owner_pubkey: &'a Pubkey,
) -> [&'a [u8]; 3] {
    [b"auction_bank", auction_id, auction_owner_pubkey.as_ref()]
}

pub fn get_auction_root_state_seeds<'a>(
    auction_id: &'a [u8],
    auction_owner_pubkey: &'a Pubkey,
) -> [&'a [u8]; 3] {
    [
        b"auction_root_state",
        auction_id,
        auction_owner_pubkey.as_ref(),
    ]
}

pub fn get_auction_cycle_state_seeds<'a>(
    auction_root_state_pubkey: &'a Pubkey,
    cycle_number_bytes: &'a [u8],
) -> [&'a [u8]; 3] {
    [
        b"auction_cycle_state",
        auction_root_state_pubkey.as_ref(),
        cycle_number_bytes,
    ]
}

pub fn get_contract_bank_seeds<'a>() -> [&'a [u8]; 1] {
    [b"auction_contract_bank"]
}

pub fn get_token_mint_seeds<'a>(auction_id: &'a [u8], auction_owner: &'a Pubkey) -> [&'a [u8]; 3] {
    [b"token_mint", auction_id, auction_owner.as_ref()]
}
pub fn get_token_holding_seeds<'a>(mint: &'a Pubkey, user: &'a Pubkey) -> [&'a [u8]; 3] {
    [b"token_holding", mint.as_ref(), user.as_ref()]
}

pub fn get_master_mint_seeds<'a>(
    auction_id: &'a [u8],
    auction_owner_pubkey: &'a Pubkey,
) -> [&'a [u8]; 3] {
    [b"master_mint", auction_id, auction_owner_pubkey.as_ref()]
}

pub fn get_master_holding_seeds<'a>(
    auction_id: &'a [u8],
    auction_owner_pubkey: &'a Pubkey,
) -> [&'a [u8]; 3] {
    [b"master_holding", auction_id, auction_owner_pubkey.as_ref()]
}

pub fn get_edition_seeds(mint_pubkey: &Pubkey) -> [&[u8]; 4] {
    [
        PREFIX.as_bytes(),
        metaplex_token_metadata::ID.as_ref(),
        mint_pubkey.as_ref(),
        EDITION.as_bytes(),
    ]
}

pub fn get_user_asset_seeds<'a>(
    auction_id: &'a [u8],
    user_pubkey: &'a Pubkey,
    mint_pubkey: &'a Pubkey,
) -> [&'a [u8]; 4] {
    [
        b"user_asset",
        auction_id,
        user_pubkey.as_ref(),
        mint_pubkey.as_ref(),
    ]
}

pub fn get_auction_mint_seeds<'a>(
    auction_id: &'a [u8],
    auction_owner_pubkey: &'a Pubkey,
) -> [&'a [u8]; 3] {
    [b"auction_mint", auction_id, auction_owner_pubkey.as_ref()]
}

pub fn get_child_mint_seeds<'a>(
    edition: &'a [u8; 8],
    auction_id: &'a [u8],
    auction_owner_pubkey: &'a Pubkey,
) -> [&'a [u8]; 4] {
    [
        b"child_mint",
        auction_id,
        auction_owner_pubkey.as_ref(),
        edition,
    ]
}

pub fn get_child_holding_seeds<'a>(
    edition: &'a [u8; 8],
    auction_id: &'a [u8],
    auction_owner_pubkey: &'a Pubkey,
) -> [&'a [u8]; 4] {
    [
        b"child_holding",
        auction_id,
        auction_owner_pubkey.as_ref(),
        edition,
    ]
}

pub fn get_edition_marker_seeds<'a>(edition_str: &'a str, mint: &'a Pubkey) -> [&'a [u8]; 5] {
    [
        PREFIX.as_bytes(),
        metaplex_token_metadata::ID.as_ref(),
        mint.as_ref(),
        EDITION.as_bytes(),
        edition_str.as_bytes(),
    ]
}

pub fn get_user_asset_pubkey(
    auction_id: &[u8],
    user_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    program_id: &Pubkey,
) -> Pubkey {
    let (user_asset_pubkey, _bump_seed) = Pubkey::find_program_address(
        &get_user_asset_seeds(auction_id, user_pubkey, mint_pubkey),
        program_id,
    );
    user_asset_pubkey
}

pub fn get_metadata_seeds(mint_pubkey: &Pubkey) -> [&[u8]; 3] {
    [
        metaplex_token_metadata::state::PREFIX.as_bytes(),
        metaplex_token_metadata::ID.as_ref(),
        mint_pubkey.as_ref(),
    ]
}

pub enum EditionType {
    Master,
    Child(u64),
}

#[derive(Debug)]
pub struct EditionPda {
    pub edition: Pubkey,
    pub mint: Pubkey,
    pub holding: Pubkey,
    pub metadata: Pubkey,
}

impl EditionPda {
    pub fn new(
        edition_type: EditionType,
        auction_id: &[u8],
        auction_owner_pubkey: &Pubkey,
    ) -> Self {
        let (mint, holding) = match edition_type {
            EditionType::Master => {
                let (mint, _) = Pubkey::find_program_address(
                    &get_master_mint_seeds(auction_id, auction_owner_pubkey),
                    &crate::ID,
                );
                let (holding, _) = Pubkey::find_program_address(
                    &get_master_holding_seeds(auction_id, auction_owner_pubkey),
                    &crate::ID,
                );
                (mint, holding)
            }
            EditionType::Child(next_edition) => {
                let (mint, _) = Pubkey::find_program_address(
                    &get_child_mint_seeds(
                        &next_edition.to_le_bytes(),
                        auction_id,
                        auction_owner_pubkey,
                    ),
                    &crate::ID,
                );
                let (holding, _) = Pubkey::find_program_address(
                    &get_child_holding_seeds(
                        &next_edition.to_le_bytes(),
                        auction_id,
                        auction_owner_pubkey,
                    ),
                    &crate::ID,
                );
                (mint, holding)
            }
        };
        let (metadata, _) =
            Pubkey::find_program_address(&get_metadata_seeds(&mint), &metaplex_token_metadata::ID);
        let (edition, _) =
            Pubkey::find_program_address(&get_edition_seeds(&mint), &metaplex_token_metadata::ID);
        Self {
            edition,
            mint,
            holding,
            metadata,
        }
    }
}
