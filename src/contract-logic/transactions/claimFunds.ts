import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { LAMPORTS } from "../consts"
import { ClaimFundsArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"

export async function claimFunds(
  auctionId: string,
  auctionOwnerPubkey: PublicKey,
  amount: number,
): Promise<Transaction> {
  const { claimFundsWasm, getCurrentCycleWasm } = await import("../wasm-factory")

  const currentCycleNumber = await getCurrentCycleWasm(auctionId)

  const auctionIdArray = padTo32Bytes(auctionId)
  const claimFundsArgs = new ClaimFundsArgs({
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionIdArray,
    cycleNumber: currentCycleNumber,
    amount: amount * LAMPORTS,
  })

  try {
    const instruction = parseInstruction(claimFundsWasm(serialize(SCHEMA, claimFundsArgs)))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
