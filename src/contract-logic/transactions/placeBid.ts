import { Transaction } from "@solana/web3.js"
import { parseInstruction } from "../utils/parseInstruction"

export default async function placeBid(
  bidderPubkey: string,
  auctionId: string,
  cycleNumber: number,
  amount: number,
  topBidderPubkey?: string,
) {
  const { placeBidWasm } = await import("gold-glue")

  try {
    const instruction = parseInstruction(await placeBidWasm({
      bidderPubkey,
      auctionId,
      cycleNumber,
      amount,
      topBidderPubkey,
    }))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
