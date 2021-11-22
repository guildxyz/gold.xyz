import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY, EDITION, METADATA_PROGRAM_ID, PREFIX, PROGRAM_ID } from "../consts"
import * as Layout from "../layouts"
import { Auction } from "../queries/getAuctions"
import { numberToBytes } from "../utils/numberToBytes"
import { padTo32Bytes } from "../utils/padTo32Bytes"

export async function startAuction(auction: Auction): Promise<Transaction> {
  const auctionId = padTo32Bytes(auction.id)
  const data = new Layout.Data({
    name: auction.nftData.name,
    symbol: auction.nftData.symbol,
    uri: auction.nftData.uri,
    sellerFeeBasisPoints: 10,
    creators: null,
  })
  const metadataArgs = new Layout.CreateMetadataArgs({ data: data, isMutable: true })
  const auctionConfig = new Layout.AuctionConfig({
    cyclePeriod: auction.cyclePeriod,
    numberOfCycles: auction.numberOfCycles,
  })
  const auctionDescription = new Layout.AuctionDescription({
    description: auction.description.description,
    socials: auction.description.socials,
    goalTreasuryAmount: auction.description.goalTreasuryAmount,
  })

  const initAuctionArgs = new Layout.InitializeAuctionArgs({
    auctionId,
    auctionName: padTo32Bytes(auction.name),
    auctionDescription: auctionDescription,
    auctionConfig: auctionConfig,
    metadataArgs: metadataArgs,
    auctionStartTimestamp: null,
  })

  const auctionOwnerPubkey = auction.ownerPubkey

  const [auctionPoolPubkey, _b] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_pool"), Buffer.from(CONTRACT_ADMIN_PUBKEY.toBytes())],
    PROGRAM_ID
  )

  const [masterMintPubkey, _d] = await PublicKey.findProgramAddress(
    [Buffer.from("master_mint"), auctionId, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )

  const [masterHoldingPubkey, _e] = await PublicKey.findProgramAddress(
    [Buffer.from("master_holding"), auctionId, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )

  const [masterMetadataPubkey, _f] = await PublicKey.findProgramAddress(
    [PREFIX, Buffer.from(METADATA_PROGRAM_ID.toBytes()), Buffer.from(masterMintPubkey.toBytes())],
    METADATA_PROGRAM_ID
  )

  const [masterEditionPubkey, _g] = await PublicKey.findProgramAddress(
    [PREFIX, Buffer.from(METADATA_PROGRAM_ID.toBytes()), Buffer.from(masterMintPubkey.toBytes()), EDITION],
    METADATA_PROGRAM_ID
  )

  const [programPda, _] = await PublicKey.findProgramAddress([Buffer.from("auction_contract")], PROGRAM_ID)

  const [auctionBankPubkey, _a] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_bank"), auctionId, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )

  const [auctionRootStatePubkey, _y] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_root_state"), auctionId, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )

  const [auctionCycleStatePubkey, _z] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_cycle_state"), Buffer.from(auctionRootStatePubkey.toBytes()), Buffer.from(numberToBytes(1))],
    PROGRAM_ID
  )

  console.log(initAuctionArgs)
  let auctionData = Buffer.from(serialize(Layout.INIT_AUCTION_SCHEMA, initAuctionArgs))

  const initializeAuctionInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    data: auctionData,
    keys: [
      { pubkey: auctionOwnerPubkey, isSigner: true, isWritable: true },
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
