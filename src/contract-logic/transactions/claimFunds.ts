import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY } from "../consts"
import { getCurrentCycleNumberFromId } from "../queries/readCycleState"
import { ClaimFundsArgs, SCHEMA } from "../schema"
import { parseInstruction } from "../utils"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { claimFundsWasm } from "../wasm-factory/instructions"

export async function claimFunds(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey,
  amount: number
) {
  const auctionIdArray = padTo32Bytes(auctionId)

  const currentCycleNumber = await getCurrentCycleNumberFromId(
    connection,
    auctionIdArray,
    auctionOwnerPubkey
  )

  const claimFundsArgs = new ClaimFundsArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: auctionIdArray,
    cycleNumber: currentCycleNumber,
    amount: amount,
  })

  const claimFundsInstruction = parseInstruction(
    claimFundsWasm(serialize(SCHEMA, claimFundsArgs))
  )

  return new Transaction().add(claimFundsInstruction)
}
