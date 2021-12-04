import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { FreezeAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils/parseInstruction"
import { padTo32Bytes } from "../utils/padTo32Bytes"
//import { freezeAuctionWasm } from "../wasm-factory/instructions"

export async function freezeAuction(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey
) {
  const { freezeAuctionWasm } = async import("../../../zgen-solana/zgsol-fund-client/wasm-factory");
  const auctionIdArray = padTo32Bytes(auctionId)

  const topBidder = await getTopBidder(
    connection,
    auctionIdArray,
    auctionOwnerPubkey
  )
  const currentCycleNumber = await getCurrentCycleNumberFromId(
    connection,
    auctionIdArray,
    auctionOwnerPubkey
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
