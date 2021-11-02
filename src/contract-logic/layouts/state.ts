import { PublicKey } from "@solana/web3.js"
import BN from "bn.js"

export class AuctionConfig {
  cyclePeriod: BN
  encorePeriod: BN
  numberOfCycles: BN | null
  minimumBidAmount: BN
  constructor(args: { cyclePeriod: BN; encorePeriod: BN; numberOfCycles: BN | null; minimumBidAmount: BN }) {
    this.cyclePeriod = args.cyclePeriod
    this.encorePeriod = args.encorePeriod
    this.numberOfCycles = args.numberOfCycles
    this.minimumBidAmount = args.minimumBidAmount
  }
}

export class Bid {
  bidderPubkey: PublicKey
  amount: BN
  constructor(args: { amount: BN; bidderPubkey: PublicKey }) {
    this.amount = args.amount
    this.bidderPubkey = args.bidderPubkey
  }
}

export class NftData {
  masterEdition: PublicKey
  constructor(args: { masterEdition: PublicKey }) {
    this.masterEdition = args.masterEdition
  }
}

export class AuctionStatus {
  currentAuctionCycle: number
  isFrozen: boolean
  isActive: boolean
  constructor(args: { currentAuctionCycle: number; isFrozen: number; isActive: number }) {
    this.currentAuctionCycle = args.currentAuctionCycle
    this.isFrozen = !!args.isFrozen
    this.isActive = !!args.isActive
  }
}

export class AuctionRootState {
  auctionName: Uint8Array
  auctionOwner: PublicKey
  config: AuctionConfig
  nftData: NftData
  status: AuctionStatus
  constructor(args: {
    auctionName: Uint8Array
    auctionOwner: PublicKey
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
        ["auctionOwner", "borshPubkey"],
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
      fields: [["masterEdition", "borshPubkey"]],
    },
  ],
])

export class AuctionCycleState {
  startTime: BN
  endTime: BN
  bidHistory: Bid[]
  constructor(args: { startTime: BN; endTime: BN; bidHistory: Bid[] }) {
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
        ["bidHistory", [Bid]],
      ],
    },
  ],
  [
    Bid,
    {
      kind: "struct",
      fields: [
        ["bidderPubkey", "borshPubkey"],
        ["amount", "u64"],
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
