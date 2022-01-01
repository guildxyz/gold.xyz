import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY, LAMPORTS } from "../consts"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { ClaimFundsArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"

export async function claimFunds(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey,
  amount: number
) {
  const { claimFundsWasm, getCurrentCycleWasm } = await import("../../../wasm-factory")

  const currentCycleNumber = await getCurrentCycleWasm(auctionId)

  const auctionIdArray = padTo32Bytes(auctionId)
  const claimFundsArgs = new ClaimFundsArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
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
