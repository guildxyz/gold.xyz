use super::*;
use solana_program::rent::Rent;

pub fn process_claim_funds(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    auction_id: AuctionId,
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let auction_owner_account = next_account_info(account_info_iter)?;
    let auction_bank_account = next_account_info(account_info_iter)?;
    let auction_root_state_account = next_account_info(account_info_iter)?;
    let auction_cycle_state_account = next_account_info(account_info_iter)?;

    let contract_admin_account = next_account_info(account_info_iter)?;
    let contract_bank_account = next_account_info(account_info_iter)?;

    if !auction_owner_account.is_signer {
        msg!("admin signature is missing");
        return Err(ProgramError::MissingRequiredSignature);
    }

    let contract_bank_state = ContractBankState::read(contract_bank_account)?;
    if contract_admin_account.key != &contract_bank_state.contract_admin_pubkey {
        return Err(AuctionContractError::ContractAdminMismatch.into());
    }

    // Check pda addresses
    let auction_root_state_seeds =
        get_auction_root_state_seeds(&auction_id, auction_owner_account.key);
    SignerPda::new_checked(
        &auction_root_state_seeds,
        auction_root_state_account.key,
        program_id,
    )
    .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let auction_root_state = AuctionRootState::read(auction_root_state_account)?;

    let cycle_num_bytes = auction_root_state
        .status
        .current_auction_cycle
        .to_le_bytes();
    let auction_cycle_state_seeds =
        get_auction_cycle_state_seeds(auction_root_state_account.key, &cycle_num_bytes);
    SignerPda::new_checked(
        &auction_cycle_state_seeds,
        auction_cycle_state_account.key,
        program_id,
    )
    .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let auction_cycle_state = AuctionCycleState::read(auction_cycle_state_account)?;

    let auction_bank_seeds = get_auction_bank_seeds(&auction_id, auction_owner_account.key);
    SignerPda::new_checked(&auction_bank_seeds, auction_bank_account.key, program_id)
        .map_err(|_| AuctionContractError::InvalidSeeds)?;
    let contract_bank_seeds = get_contract_bank_seeds();
    SignerPda::new_checked(&contract_bank_seeds, contract_bank_account.key, program_id)
        .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let mut lamports_to_claim = **auction_bank_account.lamports.borrow();

    // If the auction is not active, the bank account does not need to persist anymore
    if auction_root_state.status.is_active {
        lamports_to_claim -= Rent::get()?.minimum_balance(0);
    }

    // Current bid cannot be claimed until the end of the auction cycle
    if let Some(most_recent_bid) = auction_cycle_state.bid_history.get_last_element() {
        lamports_to_claim -= most_recent_bid.bid_amount;
    }

    if auction_owner_account.key != &auction_root_state.auction_owner {
        return Err(AuctionContractError::AuctionOwnerAuthenticationNeeded.into());
    }

    if amount > lamports_to_claim {
        return Err(AuctionContractError::InvalidClaimAmount.into());
    }

    let lamport_divided = amount / 20;
    let auction_owner_share = lamport_divided * 19;
    let contract_admin_share = amount - auction_owner_share;

    **contract_admin_account.lamports.borrow_mut() += contract_admin_share;
    **auction_owner_account.lamports.borrow_mut() += auction_owner_share;
    **auction_bank_account.lamports.borrow_mut() -= auction_owner_share + contract_admin_share;

    Ok(())
}
