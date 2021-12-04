use super::*;

pub fn process_delete_auction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    auction_id: AuctionId,
    num_of_cycles_to_delete: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let contract_admin_account = next_account_info(account_info_iter)?; // 1
    let contract_bank_account = next_account_info(account_info_iter)?; // 2
    let auction_pool_account = next_account_info(account_info_iter)?; // 3
    let auction_owner_account = next_account_info(account_info_iter)?; // 4
    let auction_bank_account = next_account_info(account_info_iter)?; // 5

    let auction_root_state_account = next_account_info(account_info_iter)?; // 6
    let auction_root_state_seeds =
        get_auction_root_state_seeds(&auction_id, auction_owner_account.key);
    SignerPda::new_checked(
        &auction_root_state_seeds,
        auction_root_state_account.key,
        program_id,
    )
    .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let auction_pool_seeds = get_auction_pool_seeds(contract_admin_account.key);
    SignerPda::new_checked(&auction_pool_seeds, auction_pool_account.key, program_id)
        .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let mut auction_root_state = AuctionRootState::read(auction_root_state_account)?;

    if auction_root_state.status.is_active && !auction_root_state.status.is_frozen {
        return Err(AuctionContractError::AuctionIsActive.into());
    }

    let removable_cycle_states_num = std::cmp::min(
        auction_root_state.status.current_auction_cycle,
        num_of_cycles_to_delete,
    ) as usize;

    // The auction cycle states to remove in reverse chronological order
    let auction_cycle_states = next_account_infos(account_info_iter, removable_cycle_states_num)?; // 7+

    if !contract_admin_account.is_signer {
        msg!("admin signature is missing");
        return Err(ProgramError::MissingRequiredSignature);
    }

    let contract_bank_state = ContractBankState::read(contract_bank_account)?;
    if contract_admin_account.key != &contract_bank_state.contract_admin_pubkey {
        return Err(AuctionContractError::ContractAdminMismatch.into());
    }

    let auction_bank_seeds = get_auction_bank_seeds(&auction_id, auction_owner_account.key);
    SignerPda::new_checked(&auction_bank_seeds, auction_bank_account.key, program_id)
        .map_err(|_| AuctionContractError::InvalidSeeds)?;

    // Iterate over auction cycle states
    let mut cycle_num = auction_root_state.status.current_auction_cycle;
    for auction_cycle_state_account in auction_cycle_states {
        // Check auction cycle state account address
        let cycle_num_bytes = cycle_num.to_le_bytes();
        let auction_cycle_state_seeds =
            get_auction_cycle_state_seeds(auction_root_state_account.key, &cycle_num_bytes);
        SignerPda::new_checked(
            &auction_cycle_state_seeds,
            auction_cycle_state_account.key,
            program_id,
        )
        .map_err(|_| AuctionContractError::InvalidSeeds)?;

        // Deallocate cycle state
        deallocate_state(auction_cycle_state_account, contract_admin_account);

        cycle_num -= 1;
    }

    // Decrement cycle number
    auction_root_state.status.current_auction_cycle -= removable_cycle_states_num as u64;

    // Return if there are still cycle states to remove (to not run out of compute units)
    if auction_root_state.status.current_auction_cycle > 0 {
        auction_root_state.write(auction_root_state_account)?;
        return Ok(());
    }

    // Deallocate remaining states if all cycle states are deallocated
    deallocate_state(auction_bank_account, auction_owner_account);
    deallocate_state(auction_root_state_account, contract_admin_account);

    let mut auction_pool = AuctionPool::read(auction_pool_account)?;
    auction_pool.pool.remove(&auction_id);
    auction_pool.write(auction_pool_account)?;

    Ok(())
}

#[inline(always)]
fn deallocate_state<'a>(from: &'a AccountInfo, to: &'a AccountInfo) {
    let lamports_to_claim = **from.lamports.borrow();
    **from.lamports.borrow_mut() -= lamports_to_claim;
    **to.lamports.borrow_mut() += lamports_to_claim;
}
