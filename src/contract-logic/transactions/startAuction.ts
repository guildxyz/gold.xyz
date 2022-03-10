import { Transaction } from "@solana/web3.js"
import { AuctionConfig } from "../queries/types"
import parseInstruction from "./parseInstruction"

export default async function startAuction(auctionConfig: AuctionConfig) {
  const { initializeAuctionWasm } = await import(`${process.env.NEXT_PUBLIC_GOLD_GLUE}`)
  try {
    const instruction = parseInstruction(await initializeAuctionWasm(auctionConfig))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
