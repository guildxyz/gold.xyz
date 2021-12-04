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

type TokenData = {
  type: "TOKEN"
  decimals: number
  mintAddress: PublicKey
  perCycleAmount: number
}

export type AuctionBaseConfig = {
  id: string
  name: string
  goalTreasuryAmount: number
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

export async function getAuctions(
  connection: Connection
): Promise<Array<AuctionBase>> {
  //const { getAuctionPoolPubkeyWasm } = await import ("../../../rust/zgsol-fund-client/pkg");
  //const auctionPoolPubkey = new PublicKey(
  //  await getAuctionPoolPubkeyWasm(CONTRACT_ADMIN_PUBKEY.toBytes())
  //)

  //const auctionPoolPubkey = new PublicKey("C9ZF33Rga9fmimugAKNxmaPXid48Pbyfgi9tpyE5nkFJ");
  //const auctionPoolAccount = await connection.getAccountInfo(auctionPoolPubkey)
  //const auctionPoolData: Buffer = auctionPoolAccount!.data
  //const auctionPool = deserializeUnchecked(
  //    SCHEMA,
  //    AuctionPool,
  //    auctionPoolData
  //);

  //const pubkey = new PublicKey("3Xc2FDqN2sRFJcEDpVd8sR92kKjRWAWFtxDR5FU3Rx3g");
  const pubkey = new PublicKey("FiunhfJk6rjX2YA67KiuUdPWmrRqEPkF22uErUxYvUM6");
  const info = await connection.getAccountInfo(pubkey)
  const data: Buffer = info!.data
  const state = deserializeUnchecked(
      SCHEMA,
      AuctionRootState,
      data,
  );
  console.log(state);


  let auctionBaseArray = []

  //let poolIterator = auctionPool.pool.entries()
  //let currentEntry = poolIterator.next()
  //while (!currentEntry.done) {
  //  const [auctionId, auctionRootStatePubkey] = currentEntry.value
  //  const auctionRootStateAccountInfo = await connection.getAccountInfo(
  //    auctionRootStatePubkey
  //  )
  //  const auctionRootStateData: Buffer = auctionRootStateAccountInfo!.data
  //  const auctionRootStateDeserialized = deserializeUnchecked(
  //    SCHEMA,
  //    AuctionRootState,
  //    auctionRootStateData
  //  )
  //  auctionBaseArray.push({
  //    id: auctionId,
  //    name: parseAuctionId(
  //      Uint8Array.from(auctionRootStateDeserialized.auctionName)
  //    ),
  //    ownerPubkey: auctionRootStateDeserialized.auctionOwner,
  //    goalTreasuryAmount:
  //      auctionRootStateDeserialized.description.goalTreasuryAmount,
  //    currentTreasuryAmount: 100, // TODO: insert field from auctionRootState
  //  })

  //  currentEntry = poolIterator.next()
  //}

  return auctionBaseArray
}

export async function getAuction(
  connection: Connection,
  id: string,
  n?: number
): Promise<Auction> {
  // read auction pool
  const { getAuctionPoolPubkeyWasm } = await import ("../../../rust/zgsol-fund-client/pkg");
  const auctionPoolPubkey = new PublicKey(
    await getAuctionPoolPubkeyWasm(CONTRACT_ADMIN_PUBKEY.toBytes())
  )
  const auctionPoolAccount = await connection.getAccountInfo(auctionPoolPubkey)
  const auctionPoolData: Buffer = auctionPoolAccount!.data
  const auctionPool = deserializeUnchecked(
    SCHEMA,
    AuctionPool,
    Buffer.from(auctionPoolData)
  )

  const auctionId = Uint8Array.from(padTo32Bytes(id))

  let auctionRootStatePubkey
  let auctionRootStateDeserialized
  let poolIterator = auctionPool.pool.entries()
  let currentEntry = poolIterator.next()
  while (!currentEntry.done) {
    const [auctionId, rootPubkey] = currentEntry.value
    if (parseAuctionId(auctionId) == id) {
      auctionRootStatePubkey = rootPubkey
      const auctionRootStateAccountInfo = await connection.getAccountInfo(
        auctionRootStatePubkey
      )
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
      new PublicKey(
        auctionRootStateDeserialized.tokenConfig.tokenConfigNft.unnamed.masterEdition
      )
    )
    const masterEditionData: Buffer = masterEditionAccountInfo!.data
    const masterEditionDeserialized = deserializeUnchecked(
      METADATA_SCHEMA,
      MasterEditionV2,
      masterEditionData
    )

    const masterMetadata = await getMasterMetadata(
      connection,
      auctionOwnerPubkey,
      auctionId
    )

    asset = {
      type: "NFT",
      name: masterMetadata.name,
      symbol: masterMetadata.symbol,
      uri: masterMetadata.uri,
      isRepeated: false,
    }
  } else if (auctionRootStateDeserialized.tokenConfig.tokenConfigToken) {
    // TODO: get decimals, probably with web3js/spl-token
    //  or with a wasm generated function with the account data as its parameter
    asset = {
      type: "TOKEN",
      decimals: 1,
      mintAddress: PublicKey.default,
      perCycleAmount:
        auctionRootStateDeserialized.tokenConfig.tokenConfigToken.perCycleAmount,
    }
  }

  let goalTreasuryAmount = null
  if (auctionRootStateDeserialized.description.goalTreasuryAmount != null) {
    goalTreasuryAmount =
      auctionRootStateDeserialized.description.goalTreasuryAmount.toNumber()
  }

  const treasuryFunds = await getTreasuryFunds(CONNECTION, id, auctionOwnerPubkey)
  let currentCycleNumber: number
  if (n) {
    currentCycleNumber = n
  } else {
    currentCycleNumber =
      auctionRootStateDeserialized.status.currentAuctionCycle.toNumber()
  }

  return {
    id: id,
    name: parseAuctionId(Uint8Array.from(auctionRootStateDeserialized.auctionName)),
    description: auctionRootStateDeserialized.description.description,
    socials: auctionRootStateDeserialized.description.socials,
    goalTreasuryAmount: goalTreasuryAmount,
    currentTreasuryAmount: treasuryFunds,
    ownerPubkey: auctionOwnerPubkey,
    asset: asset,
    bids: auctionCycleStateDeserialized.bidHistory
      .map((bid) => ({ ...bid, amount: bid.bidAmount.toNumber() / LAMPORTS }))
      .reverse(),
    cyclePeriod: auctionRootStateDeserialized.auctionConfig.cyclePeriod.toNumber(),
    currentCycle: currentCycleNumber,
    numberOfCycles:
      auctionRootStateDeserialized.auctionConfig.numberOfCycles.toNumber(),
    minBid:
      auctionRootStateDeserialized.auctionConfig.minimumBidAmount.toNumber() /
      LAMPORTS,
    startTimestamp: auctionCycleStateDeserialized.startTime.toNumber() * 1000,
    endTimestamp: auctionCycleStateDeserialized.endTime.toNumber() * 1000,
    isActive: auctionRootStateDeserialized.status.isActive,
    isFrozen: auctionRootStateDeserialized.status.isFrozen,
  }
}
