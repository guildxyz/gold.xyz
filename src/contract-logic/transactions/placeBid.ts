import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { PlaceBidArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils/parseInstruction"
import { padTo32Bytes } from "../utils/padTo32Bytes"
//import { placeBidWasm } from "../wasm-factory/instructions"

export async function placeBid(
  connection: Connection,
  auctionId: string,
  bidder: PublicKey,
  amount: number
) {
  const { placeBidWasm } = async import("../../../zgen-solana/zgsol-fund-client/wasm-factory");
  const auctionIdArray = padTo32Bytes(auctionId)
  console.log(auctionIdArray)
  const topBidder = await getTopBidder(connection, auctionIdArray)
  const currentCycleNumber = await getCurrentCycleNumberFromId(
    connection,
    auctionIdArray
  )

  const placeBidArgs = new PlaceBidArgs({
    userMainPubkey: bidder,
    auctionId: auctionIdArray,
    cycleNumber: currentCycleNumber,
    topBidderPubkey: topBidder,
    amount: amount,
  })

  const placeBidInstruction = parseInstruction(
    placeBidWasm(serialize(SCHEMA, placeBidArgs))
  )

  return new Transaction().add(placeBidInstruction)
}
