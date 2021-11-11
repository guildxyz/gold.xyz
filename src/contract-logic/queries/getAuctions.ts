import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { CONTRACT_ADMIN_PUBKEY, LAMPORTS, PROGRAM_ID } from "../consts"
import * as Layout from "../layouts/index"
import * as StateLayout from "../layouts/state"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseAuctionId } from "../utils/parseAuctionId"
import { getMasterMetadata } from "./masterEdition"
import { getCurrentCycleState } from "./readCycleState"

export type Bid = {
  bidderPubkey: PublicKey
  amount: number
}

export type AuctionBase = {
  id: string
  name: string
  ownerPubkey: PublicKey
}

export type Auction = AuctionBase & {
  nftData: {
    name: string
    symbol: string
    uri: string
  }
  bids: Bid[]
  cyclePeriod: number
  currentCycle: number
  numberOfCycles: number
  minBid: number
  startTimestamp: number
  endTimestamp: number
  isActive: boolean
  isFrozen: boolean
}

export async function getAuctions(connection: Connection): Promise<Array<AuctionBase>> {
  const [auctionPoolPubkey, _b] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_pool"), Buffer.from(CONTRACT_ADMIN_PUBKEY.toBytes())],
    PROGRAM_ID
  )
  const AuctionPoolAccount = await connection.getAccountInfo(auctionPoolPubkey)
  const AuctionPoolData: Buffer = AuctionPoolAccount!.data
  const AuctionPool = deserializeUnchecked(Layout.AUCTION_POOL_SCHEMA, Layout.AuctionPool, Buffer.from(AuctionPoolData))
  let auctionBaseArray = []
  for (const [key, value] of AuctionPool.pool.entries()) {
    // key is the id, value is a pubkey string
    const auctionRootStatePubkey = new PublicKey(value)
    const auctionRootStateAccountInfo = await connection.getAccountInfo(auctionRootStatePubkey)
    const auctionRootStateData: Buffer = auctionRootStateAccountInfo!.data
    const auctionRootStateDeserialized = deserializeUnchecked(
      StateLayout.AUCTION_ROOT_STATE_SCHEMA,
      StateLayout.AuctionRootState,
      auctionRootStateData
    )
    auctionBaseArray.push({
      id: key,
      name: parseAuctionId(auctionRootStateDeserialized.auctionName),
      ownerPubkey: auctionRootStateDeserialized.auctionOwner,
    })
  }

  return auctionBaseArray
}

export async function getAuction(connection: Connection, id: string): Promise<Auction> {
  // read auction pool
  const [auctionPoolPubkey, _b] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_pool"), Buffer.from(CONTRACT_ADMIN_PUBKEY.toBytes())],
    PROGRAM_ID
  )
  const AuctionPoolAccount = await connection.getAccountInfo(auctionPoolPubkey)
  const AuctionPoolData: Buffer = AuctionPoolAccount!.data
  const AuctionPool = deserializeUnchecked(Layout.AUCTION_POOL_SCHEMA, Layout.AuctionPool, Buffer.from(AuctionPoolData))
  const auctionId = padTo32Bytes(id)
  const pubkeyStr = AuctionPool.pool.get(id)!

  const auctionRootStatePubkey = new PublicKey(pubkeyStr)
  // read state account
  const auctionRootStateAccountInfo = await connection.getAccountInfo(auctionRootStatePubkey)
  const auctionRootStateData: Buffer = auctionRootStateAccountInfo!.data
  const auctionRootStateDeserialized = deserializeUnchecked(
    StateLayout.AUCTION_ROOT_STATE_SCHEMA,
    StateLayout.AuctionRootState,
    auctionRootStateData
  )
  const auctionCycleStateDeserialized = await getCurrentCycleState(connection, auctionRootStatePubkey)
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
  const masterMetadata = await getMasterMetadata(connection, auctionOwnerPubkey, auctionId)
  //const currentCycle = auctionRootStateDeserialized.status.currentAuctionCycle.toNumber()
  //let uri = masterMetadata.uri
  //const regex = /([^\/]+\/*\/)([^/]*)(\.(jpeg|png|svg|gif|jpg))/
  //uri = uri.replace(regex, "$1" + currentCycle + "$3")

  return {
    id: id,
    name: parseAuctionId(auctionRootStateDeserialized.auctionName),
    ownerPubkey: auctionOwnerPubkey,
    nftData: {
      name: masterMetadata.name,
      symbol: masterMetadata.symbol,
      uri: masterMetadata.uri,
    },
    bids: auctionCycleStateDeserialized.bidHistory
      .map((bid) => ({ ...bid, amount: bid.amount.toNumber() / LAMPORTS }))
      .reverse(),
    cyclePeriod: auctionRootStateDeserialized.config.cyclePeriod.toNumber(),
    currentCycle: auctionRootStateDeserialized.status.currentAuctionCycle.toNumber(),
    numberOfCycles: auctionRootStateDeserialized.config.numberOfCycles.toNumber(),
    minBid: auctionRootStateDeserialized.config.minimumBidAmount.toNumber() / LAMPORTS,
    startTimestamp: auctionCycleStateDeserialized.startTime.toNumber() * 1000,
    endTimestamp: auctionCycleStateDeserialized.endTime.toNumber() * 1000,
    isActive: auctionRootStateDeserialized.status.isActive,
    isFrozen: auctionRootStateDeserialized.status.isFrozen,
  }
}
