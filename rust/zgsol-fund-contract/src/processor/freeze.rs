use super::*;

pub fn freeze_auction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    auction_id: AuctionId,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let auction_owner_account = next_account_info(account_info_iter)?; // 1
    let auction_root_state_account = next_account_info(account_info_iter)?; // 2
    let auction_cycle_state_account = next_account_info(account_info_iter)?; // 2
    let auction_bank_account = next_account_info(account_info_iter)?; // 3
    let top_bidder_account = next_account_info(account_info_iter)?; // 4

    if !auction_owner_account.is_signer {
        msg!("admin signature is missing");
        return Err(ProgramError::MissingRequiredSignature);
    }

    let auction_root_state_seeds =
        get_auction_root_state_seeds(&auction_id, auction_owner_account.key);
    SignerPda::new_checked(
        &auction_root_state_seeds,
        auction_root_state_account.key,
        program_id,
    )
    .map_err(|_| AuctionContractError::InvalidSeeds)?;
    let mut auction_root_state = AuctionRootState::read(auction_root_state_account)?;

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

    if auction_root_state.status.is_frozen {
        return Ok(());
    }

    if auction_owner_account.key != &auction_root_state.auction_owner {
        return Err(AuctionContractError::AuctionOwnerAuthenticationNeeded.into());
    }

    let most_recent_bid_option = auction_cycle_state.bid_history.get_last_element();
    if let Some(most_recent_bid) = most_recent_bid_option {
        if top_bidder_account.key != &most_recent_bid.bidder_pubkey {
            return Err(AuctionContractError::TopBidderAccountMismatch.into());
        }
        **auction_bank_account.lamports.borrow_mut() -= most_recent_bid.bid_amount;
        **top_bidder_account.lamports.borrow_mut() += most_recent_bid.bid_amount;
    }

    auction_root_state.status.is_frozen = true;
    auction_root_state.status.is_active = false;
    auction_root_state.write(auction_root_state_account)?;

    Ok(())
}
