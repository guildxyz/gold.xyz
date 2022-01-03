import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { FreezeAuctionArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"

export async function freezeAuction(
  auctionId: string,
  auctionOwnerPubkey: PublicKey
) {
  const { freezeAuctionWasm, getTopBidderWasm, getCurrentCycleWasm } = await import("../../../wasm-factory")

  const topBidder = await getTopBidderWasm(auctionId)
  const currentCycleNumber = await getCurrentCycleWasm(auctionId)

  const auctionIdArray = padTo32Bytes(auctionId)
  const freezeAuctionArgs = new FreezeAuctionArgs({
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionIdArray,
    topBidderPubkey: topBidder,
    cycleNumber: currentCycleNumber,
  })

  try {
    const instruction = parseInstruction(freezeAuctionWasm(serialize(SCHEMA, freezeAuctionArgs)))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
