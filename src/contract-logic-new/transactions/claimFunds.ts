import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY } from "../consts"
import { ClaimFundsArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import * as wasmFactory from "../wasm-factory/instructions"

export async function claimFunds(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array
) {
  // TODO: parameter
  const amount = 1000

  // TODO: query
  const currentCycleNumber = 1

  const claimFundsArgs = new ClaimFundsArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionId,
    cycleNumber: currentCycleNumber,
    amount: amount,
  })

  const claimFundsInstruction = parseInstruction(
    wasmFactory.claimFunds(serialize(SCHEMA, claimFundsArgs))
  )

  return new Transaction().add(claimFundsInstruction)
}
