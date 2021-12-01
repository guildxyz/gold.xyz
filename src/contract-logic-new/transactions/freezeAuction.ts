import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONNECTION } from "../consts"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { FreezeAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { freezeAuctionWasm } from "../wasm-factory/instructions"

export async function freezeAuction(
  auctionOwnerPubkey: PublicKey,
  auctionId: string
) {
  const auctionIdArray = padTo32Bytes(auctionId)

  const topBidder = await getTopBidder(
    CONNECTION,
    auctionIdArray,
    auctionOwnerPubkey
  )
  const currentCycleNumber = await getCurrentCycleNumberFromId(
    CONNECTION,
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
