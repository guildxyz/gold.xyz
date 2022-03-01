import { Transaction } from "@solana/web3.js"
import { DeleteAuctionArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"
import { NUM_OF_CYCLES_TO_DELETE } from "../consts"

export async function deleteAuction(
  auctionId: string,
  auctionOwnerPubkey: string,
  topBidderPubkey: string,
  cycleNumber: number,
) {
  const { deleteAuctionWasm } = await import("../../gold-wasm")

  try {
    const instruction = parseInstruction(await deleteAuctionWasm({
      auctionOwnerPubkey,
      topBidderPubkey,
      auctionId,
      cycleNumber: BigInt(cycleNumber),
    }))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
