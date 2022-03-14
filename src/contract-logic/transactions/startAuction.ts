import { Transaction } from "@solana/web3.js"
import importGlue from "contract-logic/importGlue"
import { AuctionConfig } from "../queries/types"
import parseInstruction from "./parseInstruction"

export default async function startAuction(auctionConfig: AuctionConfig) {
  const { initializeAuctionWasm } = await importGlue()
  try {
    const instruction = parseInstruction(await initializeAuctionWasm(auctionConfig))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
