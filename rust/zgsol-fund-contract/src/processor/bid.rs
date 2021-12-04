use super::*;

pub fn process_bid(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    auction_id: AuctionId,
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user_main_account = next_account_info(account_info_iter)?; // 1
    let auction_owner_account = next_account_info(account_info_iter)?; // 2
    let auction_bank_account = next_account_info(account_info_iter)?; // 3
    let auction_root_state_account = next_account_info(account_info_iter)?; // 4
    let auction_cycle_state_account = next_account_info(account_info_iter)?; // 5
    let top_bidder_account = next_account_info(account_info_iter)?; // 6
    let system_program = next_account_info(account_info_iter)?; // 7

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

    let cycle_num = auction_root_state
        .status
        .current_auction_cycle
        .to_le_bytes();
    let auction_cycle_state_seeds =
        get_auction_cycle_state_seeds(auction_root_state_account.key, &cycle_num);
    SignerPda::new_checked(
        &auction_cycle_state_seeds,
        auction_cycle_state_account.key,
        program_id,
    )
    .map_err(|_| AuctionContractError::InvalidSeeds)?;

    let mut auction_cycle_state = AuctionCycleState::read(auction_cycle_state_account)?;

    let auction_bank_seeds = get_auction_bank_seeds(&auction_id, auction_owner_account.key);
    SignerPda::new_checked(&auction_bank_seeds, auction_bank_account.key, program_id)
        .map_err(|_| AuctionContractError::InvalidSeeds)?;

    // Check if user is signer
    if !user_main_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check and update auction status
    let auction_state = AuctionStateTemp {
        root_state: &auction_root_state,
        cycle_state: &auction_cycle_state,
    };

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;
    auction_state.check_status(current_timestamp, AuctionInteraction::Bid)?;
    auction_state.check_bid_amount(amount)?;

    let most_recent_bid_option = auction_cycle_state.bid_history.get_last_element();
    if let Some(ref most_recent_bid) = most_recent_bid_option {
        if top_bidder_account.key != &most_recent_bid.bidder_pubkey {
            return Err(AuctionContractError::TopBidderAccountMismatch.into());
        }
    }

    // Transfer SOL to fund
    let lamport_transfer_ix =
        system_instruction::transfer(user_main_account.key, auction_bank_account.key, amount);

    invoke(
        &lamport_transfer_ix,
        &[
            user_main_account.to_owned(),
            auction_bank_account.to_owned(),
            system_program.to_owned(),
        ],
    )?;

    // Transfer SOL to previous top bidder
    if let Some(ref most_recent_bid) = most_recent_bid_option {
        **auction_bank_account.lamports.borrow_mut() -= most_recent_bid.bid_amount;
        **top_bidder_account.lamports.borrow_mut() += most_recent_bid.bid_amount;
    }

    let bid_data = BidData {
        bid_amount: amount,
        bidder_pubkey: *user_main_account.key,
    };

    auction_cycle_state.bid_history.cyclic_push(bid_data);

    // Check if auction end time needs to be updated
    let current_timestamp = clock.unix_timestamp;
    if current_timestamp
        > auction_cycle_state.end_time - auction_root_state.auction_config.encore_period
    {
        auction_cycle_state.end_time =
            current_timestamp + auction_root_state.auction_config.encore_period;
    }

    auction_cycle_state.write(auction_cycle_state_account)?;

    Ok(())
}
