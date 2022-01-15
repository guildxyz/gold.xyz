import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { LAMPORTS } from "../consts"
import { AuctionPool, AuctionCycleState, AuctionRootState, FrontendAuction, SCHEMA } from "../schema"
import { parseAuctionId } from "../utils/parseAuctionId"
import { Auction, AuctionBase, NFTData, TokenData, Cycle} from "./types"

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
    const auctionRootState = deserializeUnchecked(
      SCHEMA,
      AuctionRootState,
      auctionRootStateData
    )

    let goalTreasuryAmount = null
    if (auctionRootState.description.goalTreasuryAmount != null) {
      goalTreasuryAmount =
        auctionRootState.description.goalTreasuryAmount.toNumber() / LAMPORTS
    }

    auctionBaseArray.push({
      id: parseAuctionId(auctionId),
      name: parseAuctionId(Uint8Array.from(auctionRootState.auctionName)),
      ownerPubkey: auctionRootState.auctionOwner,
      goalTreasuryAmount,
      allTimeTreasuryAmount: auctionRootState.allTimeTreasury.toNumber() / LAMPORTS,
      isVerified: auctionRootState.isVerified,
    })

    currentEntry = poolIterator.next()
  }

  return auctionBaseArray
}

export async function getAuction(auction_id: string): Promise<Auction> {
  const { getAuctionWasm } = await import("../wasm-factory")

  let auction
  try {
    const auctionData: Uint8Array = await getAuctionWasm(auction_id)
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

  return {
    // AuctionBaseConfig
    id: auction_id,
    name: parseAuctionId(Uint8Array.from(auction.rootState.auctionName)),
    goalTreasuryAmount,
    ownerPubkey: auction.rootState.auctionOwner,
    // AuctionBase
    allTimeTreasuryAmount: auction.rootState.allTimeTreasury.toNumber() / LAMPORTS,
    isVerified: auction.rootState.isVerified,
    // AuctionConfig
    description: auction.rootState.description.description,
    socials: auction.rootState.description.socials,
    asset: asset,
    encorePeriod: auction.rootState.auctionConfig.encorePeriod.toNumber(),
    cyclePeriod: auction.rootState.auctionConfig.cyclePeriod.toNumber(),
    numberOfCycles,
    minBid: auction.rootState.auctionConfig.minimumBidAmount.toNumber() / LAMPORTS,
    // Auction
    startTime: auction.rootState.startTime.toNumber() * 1000,
    availableTreasuryAmount: auction.availableFunds.toNumber() / LAMPORTS,
    currentCycle,
    isActive: auction.rootState.status.isActive,
    isFrozen: auction.rootState.status.isFrozen,
    rootStatePubkey: new PublicKey(auction.rootStatePubkey.toBytes()),
  }
}

export async function getAuctionCycle(
  rootStatePubkey: PublicKey,
  cycleNum: number
): Promise<Cycle> {
  const { getAuctionCycleStateWasm, Pubkey } = await import("../wasm-factory")

  let cycleState;
  try {
    const pubkey = new Pubkey(rootStatePubkey.toBytes());
    const cycleData: Uint8Array = await getAuctionCycleStateWasm(pubkey, BigInt(cycleNum))
    cycleState = deserializeUnchecked(SCHEMA, AuctionCycleState, Buffer.from(cycleData))
  } catch (error) {
    console.log("wasm error: ", error)
  }

  let bids = cycleState.bidHistory
    .map((bid) => ({ bidderPubkey: bid.bidderPubkey, amount: bid.bidAmount.toNumber() / LAMPORTS }))
    .reverse()

    return {
      bids,
      endTimestamp: cycleState.endTime.toNumber() * 1000,
    }
}
