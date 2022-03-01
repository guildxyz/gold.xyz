import { Transaction } from "@solana/web3.js"
import { AuctionConfig } from "../queries/types"
import { parseInstruction } from "../utils/parseInstruction"

export default async function startAuction(auctionConfig: AuctionConfig) {
  const { initializeAuctionWasm } = await import("gold-glue")
  try {
    const instruction = parseInstruction(await initializeAuctionWasm(auctionConfig))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
