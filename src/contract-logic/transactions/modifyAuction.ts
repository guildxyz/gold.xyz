import { Transaction } from "@solana/web3.js"
import importGlue from "contract-logic/importGlue"
import parseInstruction from "./parseInstruction"

export type ModifyData = {
  description?: string
  socials?: string[]
  encorePeriod?: number
}

export default async function modifyAuction(
  auctionOwnerPubkey: string,
  auctionId: string,
  modifyData: ModifyData
): Promise<Transaction> {
  const { modifyAuctionWasm } = await importGlue()

  try {
    const instruction = parseInstruction(
      await modifyAuctionWasm({
        auctionOwnerPubkey,
        auctionId,
        description: modifyData.description,
        socials: modifyData.socials,
        encorePeriod: modifyData.encorePeriod,
      })
    )
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
