import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import { serialize } from "borsh"
import { AuctionBody } from "types"
import {
  auctionOwner,
  contractAdmin,
  EDITION,
  METADATA_PROGRAM_ID,
  PREFIX,
  programId,
} from "./config"
import * as Layout from "./config/layout"
import numberToBytes from "./utils/numberToBytes"
import padTo32Bytes from "./utils/padTo32Bytes"

async function startAuction({
  nftData: MasterNftData,
  name: stringAuctionName,
  cyclePeriod,
  numberOfCycles,
  minBid,
}: AuctionBody) {
  const auctionId = padTo32Bytes(stringAuctionName)
  const auctionName = padTo32Bytes(stringAuctionName)
  console.log({
    MasterNftData,
    cyclePeriod,
    numberOfCycles,
    minBid,
    auctionId,
    auctionName,
  })

  const data = new Layout.Data({
    name: MasterNftData.name,
    symbol: MasterNftData.symbol,
    uri: MasterNftData.uri,
    sellerFeeBasisPoints: 10,
    creators: null,
  })
  const metadataArgs = new Layout.CreateMetadataArgs({ data: data, isMutable: true })
  const auctionConfig = new Layout.AuctionConfig({ cyclePeriod, numberOfCycles })
  const initAuctionArgs = new Layout.InitializeAuctionArgs({
    auctionId: auctionId,
    auctionName: auctionName,
    auctionConfig: auctionConfig,
    metadataArgs: metadataArgs,
    auctionStartTimestamp: null,
  })

  const [auctionPoolPubkey, _b] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_pool"), Buffer.from(contractAdmin.publicKey.toBytes())],
    programId
  )

  const [masterMintPubkey, _d] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwner.publicKey.toBytes()),
    ],
    programId
  )
  const [masterHoldingPubkey, _e] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master_holding"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwner.publicKey.toBytes()),
    ],
    programId
  )
  const [masterMetadataPubkey, _f] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(masterMintPubkey.toBytes()),
    ],
    METADATA_PROGRAM_ID
  )
  const [masterEditionPubkey, _g] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(masterMintPubkey.toBytes()),
      EDITION,
    ],
    METADATA_PROGRAM_ID
  )

  const [programPda, _] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_contract")],
    programId
  )
  const [auctionBankPubkey, _a] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_bank"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwner.publicKey.toBytes()),
    ],
    programId
  )
  const [auctionRootStatePubkey, _y] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_root_state"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwner.publicKey.toBytes()),
    ],
    programId
  )
  const [auctionCycleStatePubkey, _z] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_cycle_state"),
      Buffer.from(auctionRootStatePubkey.toBytes()),
      Buffer.from(numberToBytes(1)),
    ],
    programId
  )

  const auctionData = Buffer.from(
    serialize(Layout.INIT_AUCTION_SCHEMA, initAuctionArgs)
  )

  const initializeAuctionInstruction = new TransactionInstruction({
    programId,
    data: auctionData,
    keys: [
      { pubkey: auctionOwner.publicKey, isSigner: true, isWritable: true },
      { pubkey: masterEditionPubkey, isSigner: false, isWritable: true },
      { pubkey: masterHoldingPubkey, isSigner: false, isWritable: true },
      { pubkey: masterMetadataPubkey, isSigner: false, isWritable: true },
      { pubkey: masterMintPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionPoolPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionRootStatePubkey, isSigner: false, isWritable: true },
      { pubkey: auctionCycleStatePubkey, isSigner: false, isWritable: true },
      { pubkey: auctionBankPubkey, isSigner: false, isWritable: true },
      { pubkey: programPda, isSigner: false, isWritable: false },
      { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
  })

  return new Transaction().add(initializeAuctionInstruction)
}

export default startAuction
