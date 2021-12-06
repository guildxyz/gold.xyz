import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { FreezeAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { freezeAuctionWasm } from "../wasm-factory/instructions"

export async function freezeAuction(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey
) {
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

  const freezeAuctionInstruction = parseInstruction(
    freezeAuctionWasm(serialize(SCHEMA, freezeAuctionArgs))
  )

  return new Transaction().add(freezeAuctionInstruction)
}
