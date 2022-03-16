import { Transaction } from "@solana/web3.js"
import importGlue from "contract-logic/importGlue"
import parseInstruction from "./parseInstruction"

export default async function placeBid(
  bidderPubkey: string,
  auctionId: string,
  cycleNumber: number,
  amount: number,
  topBidderPubkey?: string
) {
  const { placeBidWasm } = await importGlue()

  try {
    const instruction = parseInstruction(
      await placeBidWasm({
        bidderPubkey,
        auctionId,
        cycleNumber,
        amount,
        topBidderPubkey,
      })
    )
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
