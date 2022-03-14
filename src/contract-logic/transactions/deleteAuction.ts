import { Transaction } from "@solana/web3.js"
import importGlue from "contract-logic/importGlue"
import parseInstruction from "./parseInstruction"

export default async function deleteAuction(
  auctionId: string,
  auctionOwnerPubkey: string,
  cycleNumber: number,
  topBidderPubkey?: string
) {
  const { deleteAuctionWasm } = await importGlue()

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
