import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { LAMPORTS } from "../consts"
import { AuctionPool, AuctionRootState, FrontendAuction, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseAuctionId } from "../utils/parseAuctionId"

export type Bid = {
  bidderPubkey: PublicKey
  amount: number
}

export type NFTData = {
  type: "NFT"
  name: string
  symbol: string
  uri: string
  isRepeated: boolean
}

export type TokenData = {
  type: "TOKEN"
  decimals: number
  mintAddress: PublicKey
  perCycleAmount: number
}

export type AuctionBaseConfig = {
  id: string
  name: string
  goalTreasuryAmount?: number
  ownerPubkey: PublicKey
}

// TODO: customizable encore period? (The amount of time the highest bidder must be uncontested to win the cycle)
export type AuctionConfig = AuctionBaseConfig & {
  description: string
  socials: string[]
  asset: NFTData | TokenData
  cyclePeriod: number
  numberOfCycles: number
  minBid: number
  startTimestamp?: number
}

export type AuctionBase = AuctionBaseConfig & {
  currentTreasuryAmount: number
}

export type Auction = AuctionConfig &
  AuctionBase & {
    bids: Bid[]
    thisCycle: number
    currentCycle: number
    endTimestamp: number
    isActive: boolean
    isFrozen: boolean
  }

async function getAuctionPool(connection: Connection): Promise<AuctionPool> {
  const { getAuctionPoolPubkeyWasm } = await import("../../../wasm-factory")
  const auctionPoolPubkey = new PublicKey(
    await getAuctionPoolPubkeyWasm()
  )
  const auctionPoolAccount = await connection.getAccountInfo(auctionPoolPubkey)
  const auctionPoolData: Buffer = auctionPoolAccount!.data
  return deserializeUnchecked(SCHEMA, AuctionPool, auctionPoolData)
}

export async function getAuctions(connection: Connection): Promise<Array<AuctionBase>> {
  const auctionPool = await getAuctionPool(connection)
  let auctionBaseArray = []

  let poolIterator = auctionPool.pool.entries()
  let currentEntry = poolIterator.next()
  while (!currentEntry.done) {
    const [auctionId, auctionRootStatePubkey] = currentEntry.value
    const auctionRootStateAccountInfo = await connection.getAccountInfo(auctionRootStatePubkey)
    const auctionRootStateData: Buffer = auctionRootStateAccountInfo!.data
    const auctionRootStateDeserialized = deserializeUnchecked(
      SCHEMA,
      AuctionRootState,
      auctionRootStateData
    )

    let goalTreasuryAmount = null;
    if (auctionRootStateDeserialized.description.goalTreasuryAmount != null) {
      goalTreasuryAmount = auctionRootStateDeserialized.description.goalTreasuryAmount.toNumber() / LAMPORTS;
    }

    auctionBaseArray.push({
      id: parseAuctionId(auctionId),
      name: parseAuctionId(Uint8Array.from(auctionRootStateDeserialized.auctionName)),
      ownerPubkey: auctionRootStateDeserialized.auctionOwner,
      goalTreasuryAmount,
      currentTreasuryAmount: auctionRootStateDeserialized.currentTreasury.toNumber() / LAMPORTS,
    })

    currentEntry = poolIterator.next()
  }

  return auctionBaseArray
}

export async function getAuction(id: string, n?: number): Promise<Auction> {
  const { getAuctionWasm } = await import("../../../wasm-factory")
  let cycle;
  if (n) {
    cycle = BigInt(n);
  } else {
    cycle = null;
  }
  const auctionData: Uint8Array = await getAuctionWasm(id, cycle);
  const auction = deserializeUnchecked(
    SCHEMA,
    FrontendAuction,
    Buffer.from(auctionData),
  );

  let asset: TokenData | NFTData
  if (auction.tokenConfig.frontendTokenConfigNft) {
    asset = {
      type: "NFT",
      name: auction.tokenConfig.frontendTokenConfigNft.name,
      symbol: auction.tokenConfig.frontendTokenConfigNft.symbol,
      uri: auction.tokenConfig.frontendTokenConfigNft.uri,
      isRepeated: auction.tokenConfig.frontendTokenConfigNft.isRepeating,
    }
  } else if (auction.tokenConfig.frontendTokenConfigToken) {
    asset = {
      type: "TOKEN",
      decimals: auction.tokenConfig.frontendTokenConfigToken.decimals,
      mintAddress: auction.tokenConfig.frontendTokenConfigToken.mint,
      perCycleAmount: Number(auction.tokenConfig.frontendTokenConfigToken.perCycleAmount)
    }
  }

  const goalTreasuryAmount = Number(auction.rootState.description.goalTreasuryAmount) / LAMPORTS;
  const numberOfCycles = Number(auction.rootState.auctionConfig.numberOfCycles);
  const currentCycle = Number(auction.rootState.status.currentAuctionCycle);
  let thisCycle;
  if (n) {
    thisCycle = n;
  } else {
    thisCycle = currentCycle;
  }

  return {
    id: id,
    name: parseAuctionId(Uint8Array.from(auction.rootState.auctionName)),
    description: auction.rootState.description.description,
    socials: auction.rootState.description.socials,
    goalTreasuryAmount,
    currentTreasuryAmount: auction.rootState.currentTreasury.toNumber() / LAMPORTS,
    ownerPubkey: auction.rootState.auctionOwner,
    asset: asset,
    bids: auction.cycleState.bidHistory
      .map((bid) => ({ bidderPubkey: bid.bidderPubkey, amount: bid.bidAmount.toNumber() / LAMPORTS }))
      .reverse(),
    cyclePeriod: auction.rootState.auctionConfig.cyclePeriod.toNumber(),
    thisCycle,
    currentCycle,
    numberOfCycles,
    minBid: auction.rootState.auctionConfig.minimumBidAmount.toNumber() / LAMPORTS,
    startTimestamp: auction.cycleState.startTime.toNumber() * 1000,
    endTimestamp: auction.cycleState.endTime.toNumber() * 1000,
    isActive: auction.rootState.status.isActive,
    isFrozen: auction.rootState.status.isFrozen,
  }
}
