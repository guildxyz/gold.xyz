import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONNECTION } from "../consts"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { PlaceBidArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { placeBidWasm } from "../wasm-factory/instructions"

export async function placeBid(
  auctionId: string,
  auctionOwnerPubkey: PublicKey,
  bidder: PublicKey,
  amount: number
) {
  const auctionIdArray = padTo32Bytes(auctionId)
  console.log(auctionIdArray)
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

  const placeBidArgs = new PlaceBidArgs({
    userMainPubkey: bidder,
    auctionOwnerPubkey: auctionOwnerPubkey,
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
