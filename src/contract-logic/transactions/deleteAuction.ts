import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY, NUM_OF_CYCLES_TO_DELETE } from "../consts"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { DeleteAuctionArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils/parseInstruction"
import { padTo32Bytes } from "../utils/padTo32Bytes"
//import { deleteAuctionWasm } from "../wasm-factory/instructions"

export async function deleteAuction(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey
) {
  const { deleteAuctionWasm } = async import("../../../zgen-solana/zgsol-fund-client/wasm-factory");
  const auctionIdArray = padTo32Bytes(auctionId)

  const currentCycleNumber = await getCurrentCycleNumberFromId(
    connection,
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
