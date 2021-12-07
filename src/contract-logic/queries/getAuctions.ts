import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { CONNECTION, CONTRACT_ADMIN_PUBKEY, LAMPORTS } from "../consts"
import { MasterEditionV2, METADATA_SCHEMA } from "../metadata_schema"
import { AuctionPool, AuctionRootState, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseAuctionId } from "../utils/parseAuctionId"
import { getMasterMetadata } from "./getMasterMedata"
import { getTreasuryFunds } from "./getTreasuryFunds"
import { getCurrentCycleState } from "./readCycleState"

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
    currentCycle: number
    endTimestamp: number
    isActive: boolean
    isFrozen: boolean
  }

async function getAuctionPool(connection: Connection): Promise<AuctionPool> {
  const { getAuctionPoolPubkeyWasm } = await import(
    "../../../zgen-solana/zgsol-fund-client/wasm-factory"
  )
  const auctionPoolPubkey = new PublicKey(
    await getAuctionPoolPubkeyWasm(CONTRACT_ADMIN_PUBKEY.toBytes())
  )
  //const auctionPoolPubkey = new PublicKey("C9ZF33Rga9fmimugAKNxmaPXid48Pbyfgi9tpyE5nkFJ");
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
    auctionBaseArray.push({
      id: auctionId,
      name: parseAuctionId(Uint8Array.from(auctionRootStateDeserialized.auctionName)),
      ownerPubkey: auctionRootStateDeserialized.auctionOwner,
      goalTreasuryAmount: auctionRootStateDeserialized.description.goalTreasuryAmount,
      currentTreasuryAmount: 100, // TODO: insert field from auctionRootState
    })

    currentEntry = poolIterator.next()
  }

  return auctionBaseArray
}

export async function getAuction(connection: Connection, id: string, n?: number): Promise<Auction> {
  const { getDecimalsFromMintAccountDataWasm } = await import(
    "../../../zgen-solana/zgsol-fund-client/wasm-factory"
  )
  const auctionPool = await getAuctionPool(connection)

  const auctionId = Uint8Array.from(padTo32Bytes(id))

  let auctionRootStatePubkey
  let auctionRootStateDeserialized
  let poolIterator = auctionPool.pool.entries()
  let currentEntry = poolIterator.next()
  while (!currentEntry.done) {
    const [auctionId, rootPubkey] = currentEntry.value
    if (parseAuctionId(auctionId) == id) {
      auctionRootStatePubkey = rootPubkey
      const auctionRootStateAccountInfo = await connection.getAccountInfo(auctionRootStatePubkey)
      const auctionRootStateData: Buffer = auctionRootStateAccountInfo!.data
      auctionRootStateDeserialized = deserializeUnchecked(
        SCHEMA,
        AuctionRootState,
        auctionRootStateData
      )
      break
    }

    currentEntry = poolIterator.next()
  }

  const auctionCycleStateDeserialized = await getCurrentCycleState(
    connection,
    auctionRootStatePubkey
  )
  const auctionOwnerPubkey = new PublicKey(auctionRootStateDeserialized.auctionOwner)

  let asset: TokenData | NFTData
  if (auctionRootStateDeserialized.tokenConfig.tokenConfigNft) {
    // read master edition account (for current child edition)
    const masterEditionAccountInfo = await connection.getAccountInfo(
      new PublicKey(auctionRootStateDeserialized.tokenConfig.tokenConfigNft.unnamed.masterEdition)
    )
    const masterEditionData: Buffer = masterEditionAccountInfo!.data
    const masterEditionDeserialized = deserializeUnchecked(
      METADATA_SCHEMA,
      MasterEditionV2,
      masterEditionData
    )

    const masterMetadata = await getMasterMetadata(connection, auctionId)

    asset = {
      type: "NFT",
      name: masterMetadata.name,
      symbol: masterMetadata.symbol,
      uri: masterMetadata.uri,
      isRepeated: false,
    }
  } else if (auctionRootStateDeserialized.tokenConfig.tokenConfigToken) {
    const mintPubkey = auctionRootStateDeserialized.tokenConfig.tokenConfigToken.unnamed.mint
    const mintInfo = await connection.getAccountInfo(mintPubkey)
    const mintData: Buffer = mintInfo!.data

    let decimals
    try {
      decimals = await getDecimalsFromMintAccountDataWasm(Uint8Array.from(mintData))
    } catch (e) {
      console.log("wasm error:", e)
    }

    asset = {
      type: "TOKEN",
      decimals: decimals,
      mintAddress: mintPubkey,
      perCycleAmount:
        auctionRootStateDeserialized.tokenConfig.tokenConfigToken.unnamed.perCycleAmount.toNumber(),
    }
  }

  let goalTreasuryAmount = null
  if (auctionRootStateDeserialized.description.goalTreasuryAmount != null) {
    goalTreasuryAmount = auctionRootStateDeserialized.description.goalTreasuryAmount.toNumber()
  }

  const treasuryFunds = await getTreasuryFunds(CONNECTION, id)
  let currentCycleNumber: number
  if (n) {
    currentCycleNumber = n
  } else {
    currentCycleNumber = auctionRootStateDeserialized.status.currentAuctionCycle.toNumber()
  }

  return {
    id: id,
    name: parseAuctionId(Uint8Array.from(auctionRootStateDeserialized.auctionName)),
    description: auctionRootStateDeserialized.description.description,
    socials: auctionRootStateDeserialized.description.socials,
    goalTreasuryAmount: goalTreasuryAmount,
    currentTreasuryAmount: auctionRootStateDeserialized.currentTreasury.toNumber(),
    ownerPubkey: auctionOwnerPubkey,
    asset: asset,
    bids: auctionCycleStateDeserialized.bidHistory
      .map((bid) => ({ ...bid, amount: bid.bidAmount.toNumber() / LAMPORTS }))
      .reverse(),
    cyclePeriod: auctionRootStateDeserialized.auctionConfig.cyclePeriod.toNumber(),
    currentCycle: currentCycleNumber,
    numberOfCycles: auctionRootStateDeserialized.auctionConfig.numberOfCycles.toNumber(),
    minBid: auctionRootStateDeserialized.auctionConfig.minimumBidAmount.toNumber() / LAMPORTS,
    startTimestamp: auctionCycleStateDeserialized.startTime.toNumber() * 1000,
    endTimestamp: auctionCycleStateDeserialized.endTime.toNumber() * 1000,
    isActive: auctionRootStateDeserialized.status.isActive,
    isFrozen: auctionRootStateDeserialized.status.isFrozen,
  }
}
