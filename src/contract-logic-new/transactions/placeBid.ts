import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { PlaceBidArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import * as wasmFactory from "../wasm-factory/instructions"

export async function placeBid(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array,
  bidder: PublicKey
) {
  // TODO: query?
  const amount = 1000

  // TODO: query
  const topBidder = auctionOwnerPubkey

  // TODO: query
  const currentCycleNumber = 1

  const placeBidArgs = new PlaceBidArgs({
    userMainPubkey: bidder,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionId,
    cycleNumber: currentCycleNumber,
    topBidderPubkey: topBidder,
    amount: amount,
  })

  const placeBidInstruction = parseInstruction(
    wasmFactory.placeBid(serialize(SCHEMA, placeBidArgs))
  )

  return new Transaction().add(placeBidInstruction)
}
