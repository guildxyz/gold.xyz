import { Transaction } from "@solana/web3.js"
import { AuctionConfig } from "../queries/types"
import { parseInstruction } from "../utils/parseInstruction"

// TODO: separate error in contract if the metadata account is existing
//  (auction with same parameters as a deleted one results in PDA with same seeds)
export async function startAuction(auctionConfig: AuctionConfig) {
  const { initializeAuctionWasm } = await import("../../gold-wasm")
  try {
    const instruction = parseInstruction(await initializeAuctionWasm(auctionConfig))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
