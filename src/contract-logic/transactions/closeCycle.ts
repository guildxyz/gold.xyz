import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import { serialize } from "borsh"
import { EDITION, EDITION_MARKER_BIT_SIZE, METADATA_PROGRAM_ID, PREFIX, PROGRAM_ID } from "../consts"
import * as Layout from "../layouts"
import { getChildAccounts } from "../queries/childEdition"
import { getTopBidder } from "../queries/getTopBidder"
import { getMasterAccounts } from "../queries/masterEdition"
import { getCurrentCycleStatePubkey, getNextCycleStatePubkey } from "../queries/readCycleState"
import { padTo32Bytes } from "../utils/padTo32Bytes"

// auctionOwnerPubkey from cached state data
// currentEdition from cached state data
export async function closeCycle(
  connection: Connection,
  auctionOwnerPubkey: PublicKey,
  userPubkey: PublicKey,
  auctionId: string,
  nextEdition: number
): Promise<Transaction> {
  let auctionIdBuffer = padTo32Bytes(auctionId)
  const [auctionBankPubkey, _a] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_bank"), auctionIdBuffer, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )
  const [auctionRootStatePubkey, _z] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_root_state"), auctionIdBuffer, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )

  const currentAuctionCycleStatePubkey = await getCurrentCycleStatePubkey(connection, auctionRootStatePubkey)
  const nextAuctionCycleStatePubkey = await getNextCycleStatePubkey(connection, auctionRootStatePubkey)

  const topBidder = await getTopBidder(connection, currentAuctionCycleStatePubkey)

  const masterAccounts = await getMasterAccounts(connection, auctionIdBuffer, auctionOwnerPubkey)
  const childAccounts = await getChildAccounts(auctionIdBuffer, auctionOwnerPubkey, nextEdition)

  const editionStr = Math.trunc(nextEdition / EDITION_MARKER_BIT_SIZE).toString()
  const [editionMarker, _f] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(masterAccounts.mint.toBytes()),
      EDITION,
      Buffer.from(editionStr),
    ],
    METADATA_PROGRAM_ID
  )

  const [programPda, _] = await PublicKey.findProgramAddress([Buffer.from("auction_contract")], PROGRAM_ID)

  const closeCycleArgs = new Layout.CloseAuctionCycleArgs({ auctionId: auctionIdBuffer })
  const auctionData = Buffer.from(serialize(Layout.CLOSE_CYCLE_SCHEMA, closeCycleArgs))

  const closeCycleInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    data: auctionData,
    keys: [
      { pubkey: userPubkey, isSigner: true, isWritable: true },
      { pubkey: auctionBankPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionOwnerPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionRootStatePubkey, isSigner: false, isWritable: true },
      { pubkey: currentAuctionCycleStatePubkey, isSigner: false, isWritable: true },
      { pubkey: nextAuctionCycleStatePubkey, isSigner: false, isWritable: true },
      { pubkey: topBidder, isSigner: false, isWritable: false },

      { pubkey: childAccounts.edition, isSigner: false, isWritable: true },
      { pubkey: editionMarker, isSigner: false, isWritable: true },
      { pubkey: childAccounts.metadata, isSigner: false, isWritable: true },
      { pubkey: childAccounts.mint, isSigner: false, isWritable: true },
      { pubkey: childAccounts.holding, isSigner: false, isWritable: true },

      { pubkey: masterAccounts.edition, isSigner: false, isWritable: true },
      { pubkey: masterAccounts.metadata, isSigner: false, isWritable: false },
      { pubkey: masterAccounts.mint, isSigner: false, isWritable: false },
      { pubkey: masterAccounts.holding, isSigner: false, isWritable: false },

      { pubkey: programPda, isSigner: false, isWritable: false },

      { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
  })

  return new Transaction().add(closeCycleInstruction)
}
