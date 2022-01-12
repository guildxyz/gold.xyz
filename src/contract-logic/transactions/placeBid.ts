import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { PlaceBidArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"
import { LAMPORTS } from "../consts"

export async function placeBid(
  auctionId: string,
  bidder: PublicKey,
  amount: number // in SOL
) {
  const { placeBidWasm, getTopBidderWasm, getCurrentCycleWasm } = await import("../wasm-factory")
  const topBidder = await getTopBidderWasm(auctionId)
  const currentCycleNumber = await getCurrentCycleWasm(auctionId)

  const auctionIdArray = padTo32Bytes(auctionId)
  const placeBidArgs = new PlaceBidArgs({
    userMainPubkey: bidder,
    auctionId: auctionIdArray,
    cycleNumber: currentCycleNumber,
    topBidderPubkey: topBidder,
    amount: amount * LAMPORTS,
  })

  try {
    const instruction = parseInstruction(placeBidWasm(serialize(SCHEMA, placeBidArgs)))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
