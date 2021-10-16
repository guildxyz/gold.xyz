/* eslint-disable */
import { PublicKey } from "@solana/web3.js"
import { BigNumber } from "bignumber.js"
import { BinaryReader, BinaryWriter } from "borsh"
import base58 from "bs58"

type StringPublicKey = string

export class Creator {
  address: StringPublicKey
  verified: number
  share: number

  constructor(args: { address: StringPublicKey; verified: number; share: number }) {
    this.address = args.address
    this.verified = args.verified
    this.share = args.share
  }
}

export class Data {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  creators: Creator[] | null
  constructor(args: {
    name: string
    symbol: string
    uri: string
    sellerFeeBasisPoints: number
    creators: Creator[] | null
  }) {
    this.name = args.name
    this.symbol = args.symbol
    this.uri = args.uri
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints
    this.creators = args.creators
  }
}

export class CreateMetadataArgs {
  instruction: number = 0
  data: Data
  isMutable: boolean

  constructor(args: { data: Data; isMutable: boolean }) {
    this.data = args.data
    this.isMutable = args.isMutable
  }
}

export class CreateMasterEditionArgs {
  instruction: number = 10
  maxSupply: BigNumber | null
  constructor(args: { maxSupply: BigNumber | null }) {
    this.maxSupply = args.maxSupply
  }
}

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

export class InitializeAuctionArgs {
  instruction: number = 1
  auctionId: Uint8Array // 32 bytes long
  auctionConfig: AuctionConfig
  metadataArgs: CreateMetadataArgs
  auctionStartTimestamp: number | null
  constructor(args: {
    auctionId: Uint8Array
    auctionConfig: AuctionConfig
    metadataArgs: CreateMetadataArgs
    auctionStartTimestamp: number | null
  }) {
    this.auctionId = args.auctionId
    this.auctionConfig = args.auctionConfig
    this.metadataArgs = args.metadataArgs
    this.auctionStartTimestamp = args.auctionStartTimestamp
  }
}

export const INIT_AUCTION_SCHEMA = new Map<any, any>([
  [
    InitializeAuctionArgs,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["auctionId", [32]],
        ["auctionConfig", AuctionConfig],
        ["metadataArgs", CreateMetadataArgs],
        ["auctionStartTimestamp", { kind: "option", type: "u64" }],
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
    CreateMetadataArgs,
    {
      kind: "struct",
      fields: [
        ["data", Data],
        ["isMutable", "u8"], // bool
      ],
    },
  ],
  [
    Data,
    {
      kind: "struct",
      fields: [
        ["name", "string"],
        ["symbol", "string"],
        ["uri", "string"],
        ["sellerFeeBasisPoints", "u16"],
        ["creators", { kind: "option", type: [Creator] }],
      ],
    },
  ],
  [
    Creator,
    {
      kind: "struct",
      fields: [
        ["address", "pubkeyAsString"],
        ["verified", "u8"],
        ["share", "u8"],
      ],
    },
  ],
])

export class CloseAuctionCycleArgs {
  instruction: number = 3
  auctionId: Uint8Array // 32 bytes long
  constructor(args: { auctionId: Uint8Array }) {
    this.auctionId = args.auctionId
  }
}

export const CLOSE_AUCTION_SCHEMA = new Map<any, any>([
  [
    CloseAuctionCycleArgs,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["auctionId", [32]],
      ],
    },
  ],
])

export class BidArgs {
  instruction: number = 4
  auctionId: Uint8Array // 32 bytes long
  amount: number
  constructor(args: { auctionId: Uint8Array; amount: number }) {
    this.auctionId = args.auctionId
    this.amount = args.amount
  }
}

export const BID_SCHEMA = new Map<any, any>([
  [
    BidArgs,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["auctionId", [32]],
        ["amount", "u64"],
      ],
    },
  ],
])

export const extendBorsh = () => {
  ;(BinaryReader.prototype as any).readPubkey = function () {
    const reader = this as unknown as BinaryReader
    const array = reader.readFixedArray(32)
    return new PublicKey(array)
  }
  ;(BinaryWriter.prototype as any).writePubkey = function (value: PublicKey) {
    const writer = this as unknown as BinaryWriter
    writer.writeFixedArray(value.toBuffer())
  }
  ;(BinaryReader.prototype as any).readPubkeyAsString = function () {
    const reader = this as unknown as BinaryReader
    const array = reader.readFixedArray(32)
    return base58.encode(array) as StringPublicKey
  }
  ;(BinaryWriter.prototype as any).writePubkeyAsString = function (
    value: StringPublicKey
  ) {
    const writer = this as unknown as BinaryWriter
    writer.writeFixedArray(base58.decode(value))
  }
}

extendBorsh()