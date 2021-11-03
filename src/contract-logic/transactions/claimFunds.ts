import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { serialize } from "borsh"
import { PROGRAM_ID } from "../consts"
import * as Layout from "../layouts"
import { getCurrentCycleStatePubkey } from "../queries/readCycleState"
import { padTo32Bytes } from "../utils/padTo32Bytes"

export async function claimFunds(
  connection: Connection,
  contractAdminPubkey: PublicKey,
  auctionOwnerPubkey: PublicKey,
  auctionId: string,
  amount: number
): Promise<Transaction> {
  let auctionIdBuffer = padTo32Bytes(auctionId)
  const [contractBankPubkey, _c] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_contract_bank")],
    PROGRAM_ID
  )
  const [auctionBankPubkey, _a] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_bank"), auctionIdBuffer, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )
  const [auctionRootStatePubkey, _z] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_root_state"), auctionIdBuffer, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )
  const auctionCycleStatePubkey = await getCurrentCycleStatePubkey(connection, auctionRootStatePubkey)

  const claimFundsArgs = new Layout.ClaimFundsArgs({ auctionId: auctionIdBuffer, amount: amount })
  let auctionData = Buffer.from(serialize(Layout.CLAIM_FUNDS_SCHEMA, claimFundsArgs))

  const claimFundsInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    data: auctionData,
    keys: [
      { pubkey: auctionOwnerPubkey, isSigner: true, isWritable: true },
      { pubkey: auctionBankPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionRootStatePubkey, isSigner: false, isWritable: true },
      { pubkey: auctionCycleStatePubkey, isSigner: false, isWritable: true },
      { pubkey: contractAdminPubkey, isSigner: false, isWritable: true },
      { pubkey: contractBankPubkey, isSigner: false, isWritable: true },
    ],
  })

  return new Transaction().add(claimFundsInstruction)
}
