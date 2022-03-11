import { Transaction } from "@solana/web3.js"
import parseInstruction from "./parseInstruction"

export default async function placeBid(
  bidderPubkey: string,
  auctionId: string,
  cycleNumber: number,
  amount: number,
  topBidderPubkey?: string
) {
  const { placeBidWasm } = await import(`${process.env.NEXT_PUBLIC_GOLD_GLUE}`)

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
