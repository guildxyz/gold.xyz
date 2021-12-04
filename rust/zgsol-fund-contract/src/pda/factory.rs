use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::program::invoke_signed;
use solana_program::program_pack::Pack;
use solana_program::pubkey::Pubkey;
use solana_program::rent::Rent;
use solana_program::system_instruction;
use solana_program::sysvar::Sysvar;

use spl_token::instruction as token_instruction;
use spl_token::state::{Account, Mint};

#[allow(clippy::too_many_arguments)]
pub fn create_token_holding_account<'a>(
    payer_account: &AccountInfo<'a>,
    owner_account: &AccountInfo<'a>,
    account_to_be_created: &AccountInfo<'a>,
    mint_account: &AccountInfo<'a>,
    signers_seeds: Vec<&[u8]>,
    system_program: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    rent_program: &AccountInfo<'a>,
) -> ProgramResult {
    // Creating account
    let rent = &Rent::from_account_info(rent_program)?;
    let create_account_instruction = system_instruction::create_account(
        payer_account.key,
        account_to_be_created.key,
        rent.minimum_balance(Account::LEN),
        Account::LEN as u64,
        token_program.key,
    );

    invoke_signed(
        &create_account_instruction,
        &[
            payer_account.clone(),
            account_to_be_created.clone(),
            system_program.clone(),
        ],
        &[&signers_seeds[..]],
    )?;

    // Initializing account
    let initialize_account_instruction = token_instruction::initialize_account(
        token_program.key,
        account_to_be_created.key,
        mint_account.key,
        owner_account.key,
    )?;

    invoke_signed(
        &initialize_account_instruction,
        &[
            account_to_be_created.clone(),
            owner_account.clone(),
            token_program.clone(),
            mint_account.clone(),
            rent_program.clone(),
        ],
        &[&signers_seeds[..]],
    )?;
    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn create_mint_account<'a>(
    payer_account: &AccountInfo<'a>,
    mint_account: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    signers_seeds: Vec<&[u8]>,
    rent_program: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    decimals: u8,
) -> ProgramResult {
    // Creating account
    let rent = &Rent::from_account_info(rent_program)?;
    let min_balance = rent.minimum_balance(Mint::LEN);
    let create_account_instruction = system_instruction::create_account(
        payer_account.key,
        mint_account.key,
        min_balance,
        Mint::LEN as u64,
        token_program.key,
    );

    invoke_signed(
        &create_account_instruction,
        &[
            payer_account.clone(),
            mint_account.clone(),
            system_program.clone(),
        ],
        &[&signers_seeds[..]],
    )?;

    // Initializing mint
    let initialize_mint_instruction = token_instruction::initialize_mint(
        token_program.key,
        mint_account.key,
        mint_authority.key,
        None,
        decimals,
    )?;

    invoke_signed(
        &initialize_mint_instruction,
        &[
            payer_account.clone(),
            mint_account.clone(),
            token_program.clone(),
            mint_authority.clone(),
            rent_program.clone(),
        ],
        &[&signers_seeds[..]],
    )?;
    Ok(())
}

pub fn create_account<'a>(
    payer_account: &AccountInfo<'a>,
    account_to_be_created: &AccountInfo<'a>,
    owner_pubkey: &Pubkey,
    signers_seeds: Vec<&[u8]>,
    system_program: &AccountInfo<'a>,
) -> ProgramResult {
    let rent = Rent::get()?;

    let create_account_instruction = system_instruction::create_account(
        payer_account.key,
        account_to_be_created.key,
        rent.minimum_balance(0),
        0,
        owner_pubkey,
    );

    invoke_signed(
        &create_account_instruction,
        &[
            payer_account.clone(),
            account_to_be_created.clone(),
            system_program.clone(),
        ],
        &[&signers_seeds[..]],
    )?;

    Ok(())
}

pub fn create_state_account<'a>(
    payer_account: &AccountInfo<'a>,
    account_to_be_created: &AccountInfo<'a>,
    signers_seeds: Vec<&[u8]>,
    program_id: &Pubkey,
    system_program: &AccountInfo<'a>,
    data_length: usize,
) -> ProgramResult {
    let rent = Rent::get()?;

    let create_account_instruction = system_instruction::create_account(
        payer_account.key,
        account_to_be_created.key,
        rent.minimum_balance(data_length),
        data_length as u64,
        program_id,
    );

    invoke_signed(
        &create_account_instruction,
        &[
            payer_account.clone(),
            account_to_be_created.clone(),
            system_program.clone(),
        ],
        &[&signers_seeds[..]],
    )?;

    Ok(())
}
