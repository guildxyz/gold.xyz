import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { LAMPORTS } from "../consts"
import { AuctionPool, AuctionRootState, FrontendAuction, SCHEMA } from "../schema"
import { parseAuctionId } from "../utils/parseAuctionId"
import { getAvailableFunds } from "./getAvailableFunds"
import { Auction, AuctionBase, NFTData, TokenData } from "./types"

async function getAuctionPool(connection: Connection): Promise<AuctionPool> {
  const { getAuctionPoolPubkeyWasm } = await import("../wasm-factory")
  const auctionPoolPubkey = new PublicKey(await getAuctionPoolPubkeyWasm())
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

    let goalTreasuryAmount = null
    if (auctionRootStateDeserialized.description.goalTreasuryAmount != null) {
      goalTreasuryAmount =
        auctionRootStateDeserialized.description.goalTreasuryAmount.toNumber() / LAMPORTS
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

export async function getAuction(auction_id: string, n?: number): Promise<Auction> {
  const { getAuctionWasm } = await import("../wasm-factory")
  let cycle
  if (n) {
    cycle = BigInt(n)
  } else {
    cycle = null
  }

  let auction
  let availableLamports
  try {
    const auctionData: Uint8Array = await getAuctionWasm(auction_id, cycle)
    auction = deserializeUnchecked(SCHEMA, FrontendAuction, Buffer.from(auctionData))
  } catch (error) {
    console.log("wasm error: ", error)
  }

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
      perCycleAmount: Number(auction.tokenConfig.frontendTokenConfigToken.perCycleAmount),
    }
  }

  const goalTreasuryAmount = Number(auction.rootState.description.goalTreasuryAmount) / LAMPORTS
  const numberOfCycles = Number(auction.rootState.auctionConfig.numberOfCycles)
  const currentCycle = Number(auction.rootState.status.currentAuctionCycle)
  let thisCycle
  if (n) {
    thisCycle = n
  } else {
    thisCycle = currentCycle
  }

  let bids = auction.cycleState.bidHistory
    .map((bid) => ({ bidderPubkey: bid.bidderPubkey, amount: bid.bidAmount.toNumber() / LAMPORTS }))
    .reverse()

  let availableTreasuryAmount
  try {
    availableTreasuryAmount = await getAvailableFunds(auction_id, bids[0])
  } catch (error) {
    console.log("wasm error: ", error)
  }

  return {
    id: auction_id,
    name: parseAuctionId(Uint8Array.from(auction.rootState.auctionName)),
    description: auction.rootState.description.description,
    socials: auction.rootState.description.socials,
    goalTreasuryAmount,
    availableTreasuryAmount,
    currentTreasuryAmount: auction.rootState.currentTreasury.toNumber() / LAMPORTS,
    ownerPubkey: auction.rootState.auctionOwner,
    asset: asset,
    bids,
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
