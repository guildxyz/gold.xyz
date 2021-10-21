import { PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { connection, METADATA_PROGRAM_ID, PREFIX, programId } from "./config"
import * as MetadataLayout from "./config/metadata_layout"
import * as StateLayout from "./config/state_layout"
import getAuctions from "./getAuctions"

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
    id: auctionId.toString(),
    name: "TODO",
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

function getAuctionId(auctionName: string) {
  const arr = Buffer.from(auctionName)
  const diff = Math.max(32 - arr.length, 0)
  const pad = Buffer.from([...Array(diff)].map(() => "00").join(""), "hex")
  const newBuffer = Buffer.concat([arr, pad]).slice(0, 32)
  return newBuffer
}

async function getAuction(_, auctionName: string) {
  const auctionId = getAuctionId(auctionName)
  // const auctionId = hardAuctionId

  const auctions = await getAuctions()
  const auctionStatePubkey = new PublicKey(auctions.pool.get(auctionId.toString()))

  return readAuctionState(auctionStatePubkey, auctionId)
}

export default getAuction
