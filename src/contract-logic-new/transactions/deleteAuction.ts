import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY, NUM_OF_CYCLES_TO_DELETE } from "../consts"
import { DeleteAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import * as wasmFactory from "../wasm-factory/instructions"

export async function deleteAuction(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array
) {
  // TODO: query
  const topBidder = auctionOwnerPubkey

  // TODO: query
  const currentCycleNumber = 1

  // TODO: query?
  const numOfCyclesToDelete = NUM_OF_CYCLES_TO_DELETE

  const deleteAuctionArgs = new DeleteAuctionArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionId,
    currentAuctionCycle: currentCycleNumber,
    numOfCyclesToDelete: numOfCyclesToDelete,
  })

  const deleteAuctionInstruction = parseInstruction(
    wasmFactory.deleteAuction(serialize(SCHEMA, deleteAuctionArgs))
  )

  return new Transaction().add(deleteAuctionInstruction)
}
