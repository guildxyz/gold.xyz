import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY, NUM_OF_CYCLES_TO_DELETE } from "../consts"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { DeleteAuctionArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"

export async function deleteAuction(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey
) {
  const { deleteAuctionWasm, getCurrentCycleWasm } = await import("../../../wasm-factory")

  const currentCycleNumber = await getCurrentCycleWasm(auctionIdArray)

  const auctionIdArray = padTo32Bytes(auctionId)
  const deleteAuctionArgs = new DeleteAuctionArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionIdArray,
    currentAuctionCycle: currentCycleNumber,
    numOfCyclesToDelete: NUM_OF_CYCLES_TO_DELETE,
  })

  try {
    const instruction = parseInstruction(deleteAuctionWasm(serialize(SCHEMA, deleteAuctionArgs)))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
