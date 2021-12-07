import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { FreezeAuctionArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"

export async function freezeAuction(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey
) {
  const { freezeAuctionWasm } = await import("../../../zgen-solana/zgsol-fund-client/wasm-factory");
  const auctionIdArray = padTo32Bytes(auctionId)

  const topBidder = await getTopBidder(connection, auctionIdArray)
  const currentCycleNumber = await getCurrentCycleNumberFromId(
    connection,
    auctionIdArray
  )

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
