import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { serialize } from "borsh"
import { PROGRAM_ID } from "../consts"
import * as Layout from "../layouts"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleStatePubkey } from "../queries/readCycleState"
import { padTo32Bytes } from "../utils/padTo32Bytes"

export async function freeze(auctionOwnerPubkey: PublicKey, auctionId: string): Promise<Transaction> {
  const auctionIdBuffer = padTo32Bytes(auctionId)
  const [auctionBankPubkey, _a] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_bank"), auctionIdBuffer, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )
  const [auctionRootStatePubkey, _z] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_root_state"), auctionIdBuffer, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )
  const auctionCycleStatePubkey = await getCurrentCycleStatePubkey(auctionRootStatePubkey)

  const topBidder = await getTopBidder(auctionCycleStatePubkey)

  const freezeArgs = new Layout.FreezeArgs({ auctionId: auctionIdBuffer })
  let auctionData = Buffer.from(serialize(Layout.FREEZE_SCHEMA, freezeArgs))

  const freezeInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    data: auctionData,
    keys: [
      { pubkey: auctionOwnerPubkey, isSigner: true, isWritable: false },
      { pubkey: auctionRootStatePubkey, isSigner: false, isWritable: true },
      { pubkey: auctionCycleStatePubkey, isSigner: false, isWritable: true },
      { pubkey: auctionBankPubkey, isSigner: false, isWritable: true },
      { pubkey: topBidder, isSigner: false, isWritable: true },
    ],
  })

  await new Transaction().add(freezeInstruction)
}
