import { PublicKey } from "@solana/web3.js"
import BN from "bn.js"
import { borshPublicKey } from "./extensions/publicKey"

borshPublicKey()

export class AuctionDescription {
  description: string
  socials: string[]
  goalTreasuryAmount: BN | null
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class AuctionConfig {
  cyclePeriod: BN
  encorePeriod: BN
  numberOfCycles: BN | null
  minimumBidAmount: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class AuctionStatus {
  currentAuctionCycle: BN
  isFrozen: boolean
  isActive: boolean
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class BidData {
  bidderPubkey: PublicKey
  bidAmount: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class CreateTokenArgs {
  createTokenArgsNft: CreateTokenArgsNft
  createTokenArgsToken: CreateTokenArgsToken
  enum: string
  constructor(properties) {
    if (Object.keys(properties).length !== 1) {
      throw new Error("Enum can only take single value")
    }
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
      this.enum = key
    })
  }
}

export class CreateTokenArgsNft {
  metadataArgs: CreateMetadataAccountArgs
  isRepeating: boolean
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class CreateTokenArgsToken {
  decimals: number
  perCycleAmount: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class TokenType {
  tokenTypeNft: TokenTypeNft
  tokenTypeToken: TokenTypeToken
  enum: string
  constructor(properties) {
    if (Object.keys(properties).length !== 1) {
      throw new Error("Enum can only take single value")
    }
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
      this.enum = key
    })
  }
}

export class TokenTypeNft {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class TokenTypeToken {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class NftData {
  masterEdition: PublicKey
  isRepeating: boolean
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class TokenData {
  mint: PublicKey
  perCycleAmount: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class TokenConfig {
  tokenConfigNft: TokenConfigNft
  tokenConfigToken: TokenConfigToken
  enum: string
  constructor(properties) {
    if (Object.keys(properties).length !== 1) {
      throw new Error("Enum can only take single value")
    }
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
      this.enum = key
    })
  }
}

export class TokenConfigNft {
  unnamed: NftData
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class TokenConfigToken {
  unnamed: TokenData
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class AuctionRootState {
  auctionName: [32]
  auctionOwner: PublicKey
  description: AuctionDescription
  auctionConfig: AuctionConfig
  tokenConfig: TokenConfig
  status: AuctionStatus
  currentTreasury: BN
  constructor(args) {
    Object.keys(args).map((key) => {
      this[key] = args[key]
    })
  }
}

export class AuctionCycleState {
  startTime: BN
  endTime: BN
  bidHistory: BidData[]
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class AuctionPool {
  pool: Map<Uint8Array, PublicKey>
  constructor(args: { pool: Map<Uint8Array, PublicKey> }) {
    this.pool = args.pool
  }
}

export class ContractBankState {
  contractAdminPubkey: PublicKey
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class CloseAuctionCycleArgs {
  payerPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  topBidderPubkey: PublicKey | null
  auctionId: [32]
  nextCycleNum: BN
  tokenType: TokenType
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class DeleteAuctionArgs {
  contractAdminPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  currentAuctionCycle: BN
  numOfCyclesToDelete: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class FreezeAuctionArgs {
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  topBidderPubkey: PublicKey | null
  cycleNumber: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class PlaceBidArgs {
  userMainPubkey: PublicKey
  auctionId: [32]
  cycleNumber: BN
  topBidderPubkey: PublicKey | null
  amount: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class InitializeContractArgs {
  contractAdminPubkey: PublicKey
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class InitializeAuctionArgs {
  contractAdminPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  auctionName: [32]
  auctionConfig: AuctionConfig
  auctionDescription: AuctionDescription
  createTokenArgs: CreateTokenArgs
  auctionStartTimestamp: BN | null
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class ClaimFundsArgs {
  contractAdminPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  topBidderPubkey: PublicKey | null
  cycleNumber: BN
  amount: BN
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class Data {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  creators: Creator[] | null
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class Creator {
  address: PublicKey
  verified: boolean
  share: number
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export class CreateMetadataAccountArgs {
  data: Data
  isMutable: boolean
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

export const SCHEMA = new Map<any, any>([
  [
    AuctionDescription,
    {
      kind: "struct",
      fields: [
        ["description", "string"],
        ["socials", ["string"]],
        ["goalTreasuryAmount", { kind: "option", type: "u64" }],
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
    BidData,
    {
      kind: "struct",
      fields: [
        ["bidderPubkey", "publicKey"],
        ["bidAmount", "u64"],
      ],
    },
  ],
  [
    CreateTokenArgs,
    {
      kind: "enum",
      field: "enum",
      values: [
        ["createTokenArgsNft", CreateTokenArgsNft],
        ["createTokenArgsToken", CreateTokenArgsToken],
      ],
    },
  ],
  [
    CreateTokenArgsNft,
    {
      kind: "struct",
      fields: [
        ["metadataArgs", CreateMetadataAccountArgs],
        ["isRepeating", "u8"],
      ],
    },
  ],
  [
    CreateTokenArgsToken,
    {
      kind: "struct",
      fields: [
        ["decimals", "u8"],
        ["perCycleAmount", "u64"],
      ],
    },
  ],
  [
    TokenType,
    {
      kind: "enum",
      field: "enum",
      values: [
        ["tokenTypeNft", TokenTypeNft],
        ["tokenTypeToken", TokenTypeToken],
      ],
    },
  ],
  [
    TokenTypeNft,
    {
      kind: "struct",
      fields: [],
    },
  ],
  [
    TokenTypeToken,
    {
      kind: "struct",
      fields: [],
    },
  ],
  [
    NftData,
    {
      kind: "struct",
      fields: [
        ["masterEdition", "publicKey"],
        ["isRepeating", "u8"],
      ],
    },
  ],
  [
    TokenData,
    {
      kind: "struct",
      fields: [
        ["mint", "publicKey"],
        ["perCycleAmount", "u64"],
      ],
    },
  ],
  [
    TokenConfig,
    {
      kind: "enum",
      field: "enum",
      values: [
        ["tokenConfigNft", TokenConfigNft],
        ["tokenConfigToken", TokenConfigToken],
      ],
    },
  ],
  [
    TokenConfigNft,
    {
      kind: "struct",
      fields: [["unnamed", NftData]],
    },
  ],
  [
    TokenConfigToken,
    {
      kind: "struct",
      fields: [["unnamed", TokenData]],
    },
  ],
  [
    AuctionRootState,
    {
      kind: "struct",
      fields: [
        ["auctionName", [32]],
        ["auctionOwner", "publicKey"],
        ["description", AuctionDescription],
        ["auctionConfig", AuctionConfig],
        ["tokenConfig", TokenConfig],
        ["status", AuctionStatus],
        ["currentTreasury", "u64"],
      ],
    },
  ],
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
    AuctionPool,
    {
      kind: "struct",
      fields: [["pool", { kind: "map", key: [32], value: "publicKey" }]],
    },
  ],
  [
    ContractBankState,
    {
      kind: "struct",
      fields: [["contractAdminPubkey", "publicKey"]],
    },
  ],
  [
    CloseAuctionCycleArgs,
    {
      kind: "struct",
      fields: [
        ["payerPubkey", "publicKey"],
        ["auctionOwnerPubkey", "publicKey"],
        ["topBidderPubkey", { kind: "option", type: "publicKey" }],
        ["auctionId", [32]],
        ["nextCycleNum", "u64"],
        ["tokenType", TokenType],
      ],
    },
  ],
  [
    ClaimFundsArgs,
    {
      kind: "struct",
      fields: [
        ["contractAdminPubkey", "publicKey"],
        ["auctionOwnerPubkey", "publicKey"],
        ["auctionId", [32]],
        ["cycleNumber", "u64"],
        ["amount", "u64"],
      ],
    },
  ],
  [
    InitializeAuctionArgs,
    {
      kind: "struct",
      fields: [
        ["contractAdminPubkey", "publicKey"],
        ["auctionOwnerPubkey", "publicKey"],
        ["auctionId", [32]],
        ["auctionName", [32]],
        ["auctionConfig", AuctionConfig],
        ["auctionDescription", AuctionDescription],
        ["createTokenArgs", CreateTokenArgs],
        ["auctionStartTimestamp", { kind: "option", type: "u64" }],
      ],
    },
  ],
  [
    InitializeContractArgs,
    {
      kind: "struct",
      fields: [["contractAdminPubkey", "publicKey"]],
    },
  ],
  [
    PlaceBidArgs,
    {
      kind: "struct",
      fields: [
        ["userMainPubkey", "publicKey"],
        ["auctionId", [32]],
        ["cycleNumber", "u64"],
        ["topBidderPubkey", { kind: "option", type: "publicKey" }],
        ["amount", "u64"],
      ],
    },
  ],
  [
    DeleteAuctionArgs,
    {
      kind: "struct",
      fields: [
        ["contractAdminPubkey", "publicKey"],
        ["auctionOwnerPubkey", "publicKey"],
        ["auctionId", [32]],
        ["currentAuctionCycle", "u64"],
        ["numOfCyclesToDelete", "u64"],
      ],
    },
  ],
  [
    FreezeAuctionArgs,
    {
      kind: "struct",
      fields: [
        ["auctionOwnerPubkey", "publicKey"],
        ["auctionId", [32]],
        ["topBidderPubkey", { kind: "option", type: "publicKey" }],
        ["cycleNumber", "u64"],
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
        ["address", "publicKey"],
        ["verified", "u8"],
        ["share", "u8"],
      ],
    },
  ],
  [
    CreateMetadataAccountArgs,
    {
      kind: "struct",
      fields: [
        ["data", Data],
        ["isMutable", "u8"],
      ],
    },
  ],
])
