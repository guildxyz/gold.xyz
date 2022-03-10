import { Transaction } from "@solana/web3.js"
import { AuctionConfig } from "../queries/types"
import parseInstruction from "./parseInstruction"

export default async function startAuction(auctionConfig: AuctionConfig) {
  const { initializeAuctionWasm } = await import(
    `gold-glue${process.env.NODE_ENV === "production" ? "" : "-dev"}`
  )
  try {
    const instruction = parseInstruction(await initializeAuctionWasm(auctionConfig))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
