import { PublicKey } from "@solana/web3.js"
import BN from "bn.js"
import { borshPublicKey } from "./extensions/publicKey"
import { Struct } from "./extensions/struct"
import { Enum } from "./extensions/enum"

borshPublicKey()

export class AuctionDescription extends Struct {
  description: string
  socials: string[]
  goalTreasuryAmount: BN | null
}

export class AuctionConfig extends Struct {
  cyclePeriod: BN
  encorePeriod: BN
  numberOfCycles: BN | null
  minimumBidAmount: BN
}

export class AuctionStatus extends Struct {
  currentAuctionCycle: BN
  isFrozen: boolean
  isActive: boolean
}

export class BidData extends Struct {
  bidderPubkey: PublicKey
  bidAmount: BN
}

export class CreateTokenArgs extends Enum {
  createTokenArgsNft: CreateTokenArgsNft
  createTokenArgsToken: CreateTokenArgsToken
}

export class CreateTokenArgsNft extends Struct {
  unnamed: CreateMetadataAccountArgs
}

export class CreateTokenArgsToken extends Struct {
  decimals: number
  perCycleAmount: BN
}

export class TokenType extends Enum {
  tokenTypeNft: TokenTypeNft
  tokenTypeToken: TokenTypeToken
}

export class TokenTypeNft extends Struct {}

export class TokenTypeToken extends Struct {}

export class NftData extends Struct {
  masterEdition: PublicKey
}

export class TokenData extends Struct {
  mint: PublicKey
  perCycleAmount: BN
}

export class TokenConfig extends Enum {
  tokenConfigNft: TokenConfigNft
  tokenConfigToken: TokenConfigToken
}

export class TokenConfigNft extends Struct {
  unnamed: NftData
}

export class TokenConfigToken extends Struct {
  unnamed: TokenData
}

export class AuctionRootState extends Struct {
  auctionName: [32]
  auctionOwner: PublicKey
  description: AuctionDescription
  auctionConfig: AuctionConfig
  tokenConfig: TokenConfig
  status: AuctionStatus
}

export class AuctionCycleState extends Struct {
  startTime: BN
  endTime: BN
  bidHistory: BidData[]
}

export class AuctionPool extends Struct {
  pool: Map<[32], PublicKey>
}

export class ContractBankState extends Struct {
  contractAdminPubkey: PublicKey
}

export class CloseAuctionCycleArgs extends Struct {
  payerPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  topBidderPubkey: PublicKey | null
  auctionId: [32]
  nextCycleNum: BN
  tokenType: TokenType
}

export class DeleteAuctionArgs extends Struct {
  contractAdminPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  currentAuctionCycle: BN
  numOfCyclesToDelete: BN
}

export class FreezeAuctionArgs extends Struct {
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  topBidderPubkey: PublicKey | null
  cycleNumber: BN
}

export class PlaceBidArgs extends Struct {
  userMainPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  cycleNumber: BN
  topBidderPubkey: PublicKey | null
  amount: BN
}

export class InitializeContractArgs extends Struct {
  contractAdminPubkey: PublicKey
}

export class InitializeAuctionArgs extends Struct {
  contractAdminPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  auctionName: [32]
  auctionConfig: AuctionConfig
  auctionDescription: AuctionDescription
  createTokenArgs: CreateTokenArgs
  auctionStartTimestamp: BN | null
}

export class ClaimFundsArgs extends Struct {
  contractAdminPubkey: PublicKey
  auctionOwnerPubkey: PublicKey
  auctionId: [32]
  cycleNumber: BN
  amount: BN
}

export class Data extends Struct {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  creators: Creator[] | null
}

export class Creator extends Struct {
  address: PublicKey
  verified: boolean
  share: number
}

export class CreateMetadataAccountArgs extends Struct {
  data: Data
  isMutable: boolean
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
      fields: [["unnamed", CreateMetadataAccountArgs]],
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
      fields: [["masterEdition", "publicKey"]],
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
    PlaceBidArgs,
    {
      kind: "struct",
      fields: [
        ["userMainPubkey", "publicKey"],
        ["auctionOwnerPubkey", "publicKey"],
        ["auctionId", [32]],
        ["cycleNumber", "u64"],
        ["topBidderPubkey", { kind: "option", type: "publicKey" }],
        ["amount", "u64"],
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
