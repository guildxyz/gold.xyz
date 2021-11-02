import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import * as StateLayout from "../layouts/state"

export async function getTopBidder(
  connection: Connection,
  auctionCycleStatePubkey: PublicKey
) {
  let auctionCycleStateAccount = await connection.getAccountInfo(
    auctionCycleStatePubkey
  )
  let auctionCycleStateAccountData: Buffer = auctionCycleStateAccount!.data
  let auctionCycleState = deserializeUnchecked(
    StateLayout.AUCTION_CYCLE_STATE_SCHEMA,
    StateLayout.AuctionCycleState,
    auctionCycleStateAccountData
  )

  let history_len = auctionCycleState.bidHistory.length
  if (history_len == 0) {
    return PublicKey.default
  } else {
    return new PublicKey(auctionCycleState.bidHistory[history_len - 1].bidderPubkey)
  }
}
