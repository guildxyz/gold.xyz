import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONNECTION, CONTRACT_ADMIN_PUBKEY } from "../consts"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { ClaimFundsArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { claimFundsWasm } from "../wasm-factory/instructions"

export async function claimFunds(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array,
  amount: number
) {
  const currentCycleNumber = await getCurrentCycleNumberFromId(
    CONNECTION,
    auctionId,
    auctionOwnerPubkey
  )

  const claimFundsArgs = new ClaimFundsArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionId,
    cycleNumber: currentCycleNumber,
    amount: amount,
  })

  const claimFundsInstruction = parseInstruction(
    claimFundsWasm(serialize(SCHEMA, claimFundsArgs))
  )

  return new Transaction().add(claimFundsInstruction)
}
