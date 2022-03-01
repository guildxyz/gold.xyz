import { Transaction } from "@solana/web3.js"
import { parseInstruction } from "../utils/parseInstruction"

export default async function modifyAuctionWasm(
  auctionOwnerPubkey: string,
  auctionId: string,
  description?: string,
  socials?: string,
  encorePeriod?: string,
): Promise<Transaction> {
  const { modifyAuctionWasm } = await import("../../gold-wasm")

  try {
    const instruction = parseInstruction(await modifyAuctionWasm({
      auctionOwnerPubkey,
      auctionId,
      description,
      socials,
      encorePeriod,
    }))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
