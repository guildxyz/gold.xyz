import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import {
  CONNECTION,
  CONTRACT_ADMIN_PUBKEY,
  NUM_OF_CYCLES_TO_DELETE,
} from "../consts"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { DeleteAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { deleteAuctionWasm } from "../wasm-factory/instructions"

export async function deleteAuction(
  auctionOwnerPubkey: PublicKey,
  auctionId: string
) {
  const auctionIdArray = padTo32Bytes(auctionId)

  const currentCycleNumber = await getCurrentCycleNumberFromId(
    CONNECTION,
    auctionIdArray,
    auctionOwnerPubkey
  )
  const numOfCyclesToDelete = NUM_OF_CYCLES_TO_DELETE

  const deleteAuctionArgs = new DeleteAuctionArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionIdArray,
    currentAuctionCycle: currentCycleNumber,
    numOfCyclesToDelete: numOfCyclesToDelete,
  })

  const deleteAuctionInstruction = parseInstruction(
    deleteAuctionWasm(serialize(SCHEMA, deleteAuctionArgs))
  )

  return new Transaction().add(deleteAuctionInstruction)
}
