import { PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import {
  auctionId as hardAuctionId,
  connection,
  contractAdmin,
  METADATA_PROGRAM_ID,
  PREFIX,
  programId,
} from "./config"
import * as Layout from "./config/layout"
import * as MetadataLayout from "./config/metadata_layout"
import * as StateLayout from "./config/state_layout"

// Number to little endian bytes
function numberToBytes(num: number) {
  // we want to represent the input as a 8-bytes array
  const byteArray = [0, 0, 0, 0, 0, 0, 0, 0]

  for (let index = 0; index < byteArray.length; index++) {
    const byte = num & 0xff
    byteArray[index] = byte
    num = (num - byte) / 256
  }

  return byteArray
}

async function getAuctions() {
  const [auctionPoolPubkey, _b] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_pool"), Buffer.from(contractAdmin.publicKey.toBytes())],
    programId
  )
  const AuctionPoolAccount = await connection.getAccountInfo(auctionPoolPubkey)
  const AuctionPoolData: Buffer = AuctionPoolAccount!.data
  return deserializeUnchecked(
    Layout.AUCTION_POOL_SCHEMA,
    Layout.AuctionPool,
    Buffer.from(AuctionPoolData)
  )
}

async function getMasterMetadata(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array
) {
  const [masterMint, _a] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
    ],
    programId
  )
  const [masterMetadataPubkey, _b] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(masterMint.toBytes()),
    ],
    METADATA_PROGRAM_ID
  )

  const metadataAccount = await connection.getAccountInfo(masterMetadataPubkey)
  const metadataAccountData: Buffer = metadataAccount!.data
  const metadata = deserializeUnchecked(
    MetadataLayout.METADATA_SCHEMA,
    MetadataLayout.Metadata,
    metadataAccountData
  )

  const METADATA_REPLACE = new RegExp("\u0000", "g")

  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, "")
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, "")
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, "")

  return metadata.data
}

async function getChildMetadata(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array,
  nextEdition: number
) {
  const [childMintPubkey, _d] = await PublicKey.findProgramAddress(
    [
      Buffer.from("child_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
      Buffer.from(numberToBytes(nextEdition)),
    ],
    programId
  )
  const [childMetadataPubkey, _f] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(childMintPubkey.toBytes()),
    ],
    METADATA_PROGRAM_ID
  )

  const metadataAccount = await connection.getAccountInfo(childMetadataPubkey)
  const metadataAccountData: Buffer = metadataAccount!.data
  const metadata = deserializeUnchecked(
    MetadataLayout.METADATA_SCHEMA,
    MetadataLayout.Metadata,
    metadataAccountData
  )

  const METADATA_REPLACE = new RegExp("\u0000", "g")

  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, "")
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, "")
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, "")

  return metadata.data
}

async function readAuctionState(
  auctionStatePubkey: PublicKey,
  auctionId: Uint8Array
) {
  // read state account (for auction owner, bid history, etc)
  const auctionStateAccountInfo = await connection.getAccountInfo(auctionStatePubkey)
  const auctionStateData: Buffer = auctionStateAccountInfo!.data
  const auctionStateDeserialized = deserializeUnchecked<any>(
    StateLayout.AUCTION_STATE_SCHEMA,
    StateLayout.AuctionState,
    auctionStateData
  )

  // read master edition account (for current child edition)
  const masterEditionAccountInfo = await connection.getAccountInfo(
    new PublicKey(auctionStateDeserialized.nftData.masterEdition)
  )
  const masterEditionData: Buffer = masterEditionAccountInfo!.data
  const masterEditionDeserialized = deserializeUnchecked(
    StateLayout.METADATA_SCHEMA,
    StateLayout.MasterEditionV2,
    masterEditionData
  )

  const currentChildEdition = masterEditionDeserialized.supply.toNumber()
  const auctionOwnerPubkey = new PublicKey(auctionStateDeserialized.auctionOwner)
  let metadata = await getMasterMetadata(auctionOwnerPubkey, auctionId)
  if (currentChildEdition != 0) {
    // we have minted a child nft so return with master's data
    metadata = await getChildMetadata(
      auctionOwnerPubkey,
      auctionId,
      currentChildEdition
    )
  }
  return {
    nftData: {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    },
    bids: auctionStateDeserialized.bidHistory,
    cyclePeriod: auctionStateDeserialized.config.cyclePeriod.toNumber(),
    numberOfCycles: auctionStateDeserialized.config.numberOfCycles.toNumber(),
    minBid: auctionStateDeserialized.config.minimumBidAmount,
    startTimestamp: auctionStateDeserialized.startTime.toNumber(),
  }
}

async function getAuction() {
  // temporary dummy data until the function doesn't work correctly
  // return {
  //   id: "0",
  //   name: "First auction",
  //   cyclePeriod: 64800,
  //   minBid: 300,
  //   numberOfCycles: 10,
  //   startTimestamp: 1634262267169,
  //   nftData: {
  //     name: "First NFT",
  //     symbol: "SYMB",
  //     uri: "https://storageapi.fleek.co/608ac2f5-df51-4e35-a363-1afacc7db6d3-bucket/dovalid_agora.png",
  //   },
  // }

  const auctions = await getAuctions()
  const auctionStatePubkey = new PublicKey(
    auctions.pool.get(hardAuctionId.toString())
  )
  return readAuctionState(auctionStatePubkey, hardAuctionId)
}

export default getAuction
