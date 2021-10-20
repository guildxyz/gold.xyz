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
  auctionId,
  auctionOwner,
  connection,
  contractAdmin,
  EDITION,
  METADATA_PROGRAM_ID,
  PREFIX,
  programId,
} from "./config"
import * as Layout from "./config/layout"

async function startAuction({
  nftData,
  cyclePeriod,
  numberOfCycles,
  minBid,
  name,
}: AuctionBody) {
  console.log({ nftData, cyclePeriod, numberOfCycles, minBid, name })

  const data = new Layout.Data({
    name: nftData.name,
    symbol: nftData.symbol,
    uri: nftData.uri,
    sellerFeeBasisPoints: 10,
    creators: null,
  })
  const metadataArgs = new Layout.CreateMetadataArgs({ data: data, isMutable: true })
  const auctionConfig = new Layout.AuctionConfig({ cyclePeriod, numberOfCycles })
  const initAuctionArgs = new Layout.InitializeAuctionArgs({
    auctionId: auctionId,
    auctionConfig: auctionConfig,
    metadataArgs: metadataArgs,
    auctionStartTimestamp: null,
  })

  const [contractBankPubkey, _c] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_contract_bank"),
      Buffer.from(contractAdmin.publicKey.toBytes()),
    ],
    programId
  )
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
  const [auctionStatePubkey, _z] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_state"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwner.publicKey.toBytes()),
    ],
    programId
  )

  // this works
  const initializeContractInstruction = new TransactionInstruction({
    programId,
    data: Buffer.from(Uint8Array.of(0)),
    keys: [
      { pubkey: contractAdmin.publicKey, isSigner: true, isWritable: true },
      { pubkey: contractBankPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionPoolPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  })

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
      { pubkey: auctionStatePubkey, isSigner: false, isWritable: true },
      { pubkey: auctionBankPubkey, isSigner: false, isWritable: true },
      { pubkey: programPda, isSigner: false, isWritable: false },
      { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
  })

  //// send the transaction via connection
  await connection.confirmTransaction(
    await connection.sendTransaction(
      new Transaction().add(initializeContractInstruction),
      [contractAdmin],
      { skipPreflight: false, preflightCommitment: "singleGossip" }
    )
  )
  await connection.confirmTransaction(
    await connection.sendTransaction(
      new Transaction().add(initializeAuctionInstruction),
      [auctionOwner],
      { skipPreflight: false, preflightCommitment: "singleGossip" }
    )
  )
}

export default startAuction
