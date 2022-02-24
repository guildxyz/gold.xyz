import { Transaction } from "@solana/web3.js"
import { parseInstruction } from "../utils/parseInstruction"

export default async function claimFunds(
  auctionId: string,
  callerPubkey: string,
  ownerPubkey: string,
  cycleNumber: number,
  amount: number,
): Promise<Transaction> {
  const { claimFundsWasm, Pubkey } = await import("../../gold-wasm")

  try {
    const instruction = parseInstruction(await claimFundsWasm(
      auctionId,
      new Pubkey(callerPubkey),
      new Pubkey(ownerPubkey),
      BigInt(cycleNumber),
      amount
    ))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
