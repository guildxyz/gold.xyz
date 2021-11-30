import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONNECTION } from "../consts"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { FreezeAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { freezeAuctionWasm } from "../wasm-factory/instructions"

export async function freezeAuction(auctionOwnerPubkey: PublicKey, auctionId: Uint8Array) {
  const topBidder = await getTopBidder(CONNECTION, auctionId, auctionOwnerPubkey);
  
  const currentCycleNumber = await getCurrentCycleNumberFromId(CONNECTION, auctionId, auctionOwnerPubkey);

  const freezeAuctionArgs = new FreezeAuctionArgs({
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionId,
    topBidderPubkey: topBidder,
    cycleNumber: currentCycleNumber,
  })

  const freezeAuctionInstruction = parseInstruction(
    freezeAuctionWasm(serialize(SCHEMA, freezeAuctionArgs))
  )

  return new Transaction().add(freezeAuctionInstruction)
}
