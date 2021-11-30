import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONNECTION, CONTRACT_ADMIN_PUBKEY, NUM_OF_CYCLES_TO_DELETE } from "../consts"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { DeleteAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { deleteAuctionWasm } from "../wasm-factory/instructions"

export async function deleteAuction(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array
) {
  const currentCycleNumber = await getCurrentCycleNumberFromId(CONNECTION, auctionId, auctionOwnerPubkey);

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
    deleteAuctionWasm(serialize(SCHEMA, deleteAuctionArgs))
  )

  return new Transaction().add(deleteAuctionInstruction)
}
