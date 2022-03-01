import { Transaction } from "@solana/web3.js"
import { parseInstruction } from "../utils/parseInstruction"

export default async function claimFunds(
  auctionId: string,
  payerPubkey: string,
  auctionOwnerPubkey: string,
  cycleNumber: number,
  amount: number,
): Promise<Transaction> {
  const { claimFundsWasm } = await import("gold-glue")

  try {
    const instruction = parseInstruction(await claimFundsWasm({
      payerPubkey,
      auctionOwnerPubkey,
      auctionId,
      cycleNumber: cycleNumber,
      amount
    }))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
