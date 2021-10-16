/* eslint-disable */
import BN from "bn.js"
type StringPublicKey = string

export class AuctionConfig {
  cyclePeriod: number
  encorePeriod: number
  numberOfCycles: number | null
  minimumBidAmount: number
  constructor(args: { cyclePeriod: number; numberOfCycles: number | null }) {
    this.cyclePeriod = args.cyclePeriod
    this.encorePeriod = 0 // only in mvp
    this.numberOfCycles = args.numberOfCycles
    this.minimumBidAmount = 10000
  }
}

export class BidData {
  bidderPubkey: StringPublicKey
  bidAmount: number
  constructor(args: { bidderPubkey: StringPublicKey; bidAmount: number }) {
    this.bidderPubkey = args.bidderPubkey
    this.bidAmount = args.bidAmount
  }
}

export class NftData {
  masterEdition: StringPublicKey
  constructor(args: { masterEdition: StringPublicKey }) {
    this.masterEdition = args.masterEdition
  }
}

export class AuctionState {
  auctionOwner: StringPublicKey
  previousAuctionState: number | null = 0
  startTime: number = 0
  endTime: number = 0
  config: AuctionConfig
  bidHistory: BidData[]
  nftData: NftData
  status: AuctionStatus
  constructor(args: {
    auctionOwner: StringPublicKey
    config: AuctionConfig
    bidHistory: BidData[]
    nftData: NftData
    status: AuctionStatus
  }) {
    this.auctionOwner = args.auctionOwner
    this.config = args.config
    this.bidHistory = args.bidHistory
    this.nftData = args.nftData
    this.status = args.status
  }
}

export class AuctionStatus {
  currentAuctionCycle: number = 0
  isFrozen: number = 0
  isActive: number = 1
}

export const AUCTION_STATE_SCHEMA = new Map<any, any>([
  [
    AuctionState,
    {
      kind: "struct",
      fields: [
        ["auctionOwner", "pubkeyAsString"],
        ["previousAuctionState", { kind: "option", type: "pubkeyAsString" }],
        ["startTime", "u64"],
        ["endTime", "u64"],
        ["config", AuctionConfig],
        ["bidHistory", [BidData]],
        ["nftData", NftData],
        ["status", AuctionStatus],
      ],
    },
  ],
  [
    AuctionConfig,
    {
      kind: "struct",
      fields: [
        ["cyclePeriod", "u64"],
        ["encorePeriod", "u64"],
        ["numberOfCycles", { kind: "option", type: "u64" }],
        ["minimumBidAmount", "u64"],
      ],
    },
  ],
  [
    BidData,
    {
      kind: "struct",
      fields: [
        ["bidderPubkey", "pubkeyAsString"],
        ["bidAmount", "u64"],
      ],
    },
  ],
  [
    AuctionStatus,
    {
      kind: "struct",
      fields: [
        ["currentAuctionCycle", "u64"],
        ["isFrozen", "u8"],
        ["isActive", "u8"],
      ],
    },
  ],
  [
    NftData,
    {
      kind: "struct",
      fields: [["masterEdition", "pubkeyAsString"]],
    },
  ],
])

export class MasterEditionV2 {
  key: number = 6
  supply: BN
  maxSupply?: BN
  constructor(args: { supply: BN; maxSupply?: BN }) {
    this.supply = args.supply
    this.maxSupply = args.maxSupply
  }
}

export const METADATA_SCHEMA = new Map<any, any>([
  [
    MasterEditionV2,
    {
      kind: "struct",
      fields: [
        ["key", "u8"],
        ["supply", "u64"],
        ["maxSupply", { kind: "option", type: "u64" }],
      ],
    },
  ],
])

//export class AuctionPool {
//	pool: { BN : StringPublicKey };
//	constructor(args: { BN: StringPublicKey }) {
//	  this.pool = args
//	}
//}
//
//export const AUCTION_POOL_SCHEMA = new Map<any, any>([
//  [
//    AuctionPool,
//    {
//      ['pool', { kind: 'map', key: 'u256', value: 'pubkeyAsString' }],
//    },
//  ],
//]);
