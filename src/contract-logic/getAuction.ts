import { PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { connection, METADATA_PROGRAM_ID, PREFIX, programId } from "./config"
import * as MetadataLayout from "./config/metadata_layout"
import * as StateLayout from "./config/state_layout"
import getAuctions from "./getAuctions"
import numberToBytes from "./utils/numberToBytes"

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

async function getCurrentCycleStatePubkey(auctionRootStatePubkey: PublicKey) {
  const auctionRootStateAccount = await connection.getAccountInfo(
    auctionRootStatePubkey
  )
  const auctionRootStateAccountData: Buffer = auctionRootStateAccount!.data
  const auctionRootState = deserializeUnchecked(
    StateLayout.AUCTION_ROOT_STATE_SCHEMA,
    StateLayout.AuctionRootState,
    auctionRootStateAccountData
  )

  const cycle_number = auctionRootState.status.currentAuctionCycle
  const [auctionCycleStatePubkey, _z] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_cycle_state"),
      Buffer.from(auctionRootStatePubkey.toBytes()),
      Buffer.from(numberToBytes(cycle_number)),
    ],
    programId
  )

  return auctionCycleStatePubkey
}

async function getCurrentCycleState(auctionRootStatePubkey: PublicKey) {
  const auctionCycleStatePubkey = await getCurrentCycleStatePubkey(
    auctionRootStatePubkey
  )

  const auctionCycleStateAccount = await connection.getAccountInfo(
    auctionCycleStatePubkey
  )
  const auctionCycleStateAccountData: Buffer = auctionCycleStateAccount!.data
  const auctionCycleState = deserializeUnchecked(
    StateLayout.AUCTION_CYCLE_STATE_SCHEMA,
    StateLayout.AuctionCycleState,
    auctionCycleStateAccountData
  )
  return auctionCycleState
}

async function readAuctionState(
  auctionRootStatePubkey: PublicKey,
  auctionId: Uint8Array
) {
  // read state account (for auction owner, bid history, etc)
  const auctionRootStateAccountInfo = await connection.getAccountInfo(
    auctionRootStatePubkey
  )
  const auctionRootStateData: Buffer = auctionRootStateAccountInfo!.data
  const auctionRootStateDeserialized = deserializeUnchecked<any>(
    StateLayout.AUCTION_ROOT_STATE_SCHEMA,
    StateLayout.AuctionRootState,
    auctionRootStateData
  )
  const auctionCycleStateDeserialized = await getCurrentCycleState(
    auctionRootStatePubkey
  )

  // read master edition account (for current child edition)
  const masterEditionAccountInfo = await connection.getAccountInfo(
    new PublicKey(auctionRootStateDeserialized.nftData.masterEdition)
  )
  const masterEditionData: Buffer = masterEditionAccountInfo!.data
  const masterEditionDeserialized = deserializeUnchecked(
    StateLayout.METADATA_SCHEMA,
    StateLayout.MasterEditionV2,
    masterEditionData
  )

  const currentChildEdition = masterEditionDeserialized.supply.toNumber()
  const auctionOwnerPubkey = new PublicKey(auctionRootStateDeserialized.auctionOwner)
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
    id: auctionRootStateDeserialized.auctionName.toString(),
    name: auctionRootStateDeserialized.auctionName.toString(),
    nftData: {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    },
    bids: auctionCycleStateDeserialized.bidHistory,
    cyclePeriod: auctionRootStateDeserialized.config.cyclePeriod.toNumber(),
    numberOfCycles: auctionRootStateDeserialized.config.numberOfCycles.toNumber(),
    minBid: auctionRootStateDeserialized.config.minimumBidAmount,
    startTimestamp: auctionCycleStateDeserialized.startTime.toNumber(),
    endTimestamp: auctionCycleStateDeserialized.endTime,
  }
}

async function getAuction(auctionName: string) {
  // const auctionId = getAuctionId(auctionName)
  const auctionId = new Uint8Array(auctionName.split(",").map((_) => parseInt(_)))
  // const auctionId = hardAuctionId

  const auctions = await getAuctions()
  const auctionStatePubkey = new PublicKey(auctions.pool.get(auctionName))

  return readAuctionState(auctionStatePubkey, auctionId)
}

export default getAuction
