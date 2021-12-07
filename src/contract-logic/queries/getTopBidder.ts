import { Connection, PublicKey } from "@solana/web3.js"
import { getCurrentCycleState, getRootStatePubkey } from "./readCycleState"

export async function getTopBidder(connection: Connection, auctionId: Uint8Array) {
  const auctionRootPubkey = await getRootStatePubkey(auctionId)
  const auctionCycleState = await getCurrentCycleState(connection, auctionRootPubkey)

  let history_len = auctionCycleState.bidHistory.length
  if (history_len == 0) {
    return PublicKey.default
  } else {
    return new PublicKey(auctionCycleState.bidHistory[history_len - 1].bidderPubkey)
  }
}
