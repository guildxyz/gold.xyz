import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import { serialize } from "borsh"
import { PROGRAM_ID } from "../consts"
import * as Layout from "../layouts"
import { getTopBidder } from "../queries/getTopBidder"
import { getCurrentCycleStatePubkey } from "../queries/readCycleState"
import { padTo32Bytes } from "../utils/padTo32Bytes"

export async function placeBid(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey: PublicKey,
  amount: number,
  userPubkey: PublicKey
): Promise<Transaction> {
  const auctionIdBuffer = padTo32Bytes(auctionId)
  const [auctionBankPubkey, _a] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_bank"),
      auctionIdBuffer,
      Buffer.from(auctionOwnerPubkey.toBytes()),
    ],
    PROGRAM_ID
  )
  const [auctionRootStatePubkey, _z] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_root_state"),
      auctionIdBuffer,
      Buffer.from(auctionOwnerPubkey.toBytes()),
    ],
    PROGRAM_ID
  )

  const auctionCycleStatePubkey = await getCurrentCycleStatePubkey(
    connection,
    auctionRootStatePubkey
  )

  const topBidder = await getTopBidder(connection, auctionCycleStatePubkey)

  const bidArgs = new Layout.BidArgs({
    auctionId: auctionIdBuffer,
    amount,
  })

  let auctionData = Buffer.from(serialize(Layout.BID_SCHEMA, bidArgs))

  const bidInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    data: auctionData,
    keys: [
      { pubkey: userPubkey, isSigner: true, isWritable: true },
      { pubkey: auctionOwnerPubkey, isSigner: false, isWritable: false },
      { pubkey: auctionBankPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionRootStatePubkey, isSigner: false, isWritable: false },
      { pubkey: auctionCycleStatePubkey, isSigner: false, isWritable: true },
      { pubkey: topBidder, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  })

  return new Transaction().add(bidInstruction)
}
