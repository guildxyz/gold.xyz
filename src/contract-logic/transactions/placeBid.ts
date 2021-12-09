import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { PlaceBidArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"
import { LAMPORTS } from "../consts"

export async function placeBid(
  connection: Connection,
  auctionId: string,
  bidder: PublicKey,
  amount: number // in SOL
) {
  const { placeBidWasm } = await import("../../../wasm-factory")
  const auctionIdArray = padTo32Bytes(auctionId)
  const topBidder = await getTopBidder(connection, auctionIdArray)
  const currentCycleNumber = await getCurrentCycleNumberFromId(connection, auctionIdArray)

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
