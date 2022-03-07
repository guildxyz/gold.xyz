import { Transaction } from "@solana/web3.js"
import parseInstruction from "./parseInstruction"

export default async function deleteAuction(
  auctionId: string,
  auctionOwnerPubkey: string,
  cycleNumber: number,
  topBidderPubkey?: string,
) {
  const { deleteAuctionWasm } = await import("gold-glue")

  try {
    const instructions = await deleteAuctionWasm({
      auctionOwnerPubkey,
      topBidderPubkey,
      auctionId,
      cycleNumber,
    })
    let tx = new Transaction()
    instructions.forEach((ix) => tx.add(parseInstruction(ix)))
    return tx
  } catch (e) {
    console.log("wasm error:", e)
  }
}
