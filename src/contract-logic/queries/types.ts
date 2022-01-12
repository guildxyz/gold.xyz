import { PublicKey } from "@solana/web3.js"

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
    availableTreasuryAmount: number
    currentCycle: number
    endTimestamp: number
    isActive: boolean
    isFrozen: boolean
  }

export type Cycle = {
  bids: Bid[]
  endTimestamp: number
}
