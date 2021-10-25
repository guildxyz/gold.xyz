/* eslint-disable */
import BN from "bn.js"
type StringPublicKey = string

export class AuctionConfig {
  cyclePeriod: number
  encorePeriod: number
  numberOfCycles: number | null
  minimumBidAmount: number
  constructor(args: {
    cyclePeriod: number
    encorePeriod: number
    numberOfCycles: number | null
    minimumBidAmount: number
  }) {
    this.cyclePeriod = args.cyclePeriod
    this.encorePeriod = args.encorePeriod
    this.numberOfCycles = args.numberOfCycles
    this.minimumBidAmount = args.minimumBidAmount
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

export class AuctionStatus {
  currentAuctionCycle: number
  isFrozen: boolean
  isActive: boolean
  constructor(args: {
    currentAuctionCycle: number
    isFrozen: number
    isActive: number
  }) {
    this.currentAuctionCycle = args.currentAuctionCycle
    this.isFrozen = !!args.isFrozen
    this.isActive = !!args.isActive
  }
}

export class AuctionRootState {
  auctionName: Uint8Array
  auctionOwner: StringPublicKey
  config: AuctionConfig
  nftData: NftData
  status: AuctionStatus
  constructor(args: {
    auctionName: Uint8Array
    auctionOwner: StringPublicKey
    config: AuctionConfig
    nftData: NftData
    status: AuctionStatus
  }) {
    this.auctionName = args.auctionName
    this.auctionOwner = args.auctionOwner
    this.config = args.config
    this.nftData = args.nftData
    this.status = args.status
  }
}

export const AUCTION_ROOT_STATE_SCHEMA = new Map<any, any>([
  [
    AuctionRootState,
    {
      kind: "struct",
      fields: [
        ["auctionName", [32]],
        ["auctionOwner", "pubkeyAsString"],
        ["config", AuctionConfig],
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

export class AuctionCycleState {
  startTime: BN
  endTime: BN
  bidHistory: BidData[]
  constructor(args: { startTime: BN; endTime: BN; bidHistory: BidData[] }) {
    this.startTime = args.startTime
    this.endTime = args.endTime
    this.bidHistory = args.bidHistory
  }
}
export const AUCTION_CYCLE_STATE_SCHEMA = new Map<any, any>([
  [
    AuctionCycleState,
    {
      kind: "struct",
      fields: [
        ["startTime", "u64"],
        ["endTime", "u64"],
        ["bidHistory", [BidData]],
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
