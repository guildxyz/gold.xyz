import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { FreezeAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { freezeAuction } from "../wasm-factory/instructions"

export async function freeze(auctionOwnerPubkey: PublicKey, auctionId: Uint8Array) {
  // TODO: query
  const topBidder = auctionOwnerPubkey

  // TODO: query
  const currentCycleNumber = 1

  const freezeAuctionArgs = new FreezeAuctionArgs({
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionId,
    topBidderPubkey: topBidder,
    cycleNumber: currentCycleNumber,
  })

  const freezeAuctionInstruction = parseInstruction(
    freezeAuction(serialize(SCHEMA, freezeAuctionArgs))
  )

  return new Transaction().add(freezeAuctionInstruction)
}
