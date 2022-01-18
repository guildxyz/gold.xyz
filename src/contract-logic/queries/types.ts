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
// NOTE encore_period: if bid occurs within this period before the auction
// ends, same amount of extra time is added to the auction end
export type AuctionConfig = AuctionBaseConfig & {
  description: string
  socials: string[]
  asset: NFTData | TokenData
  encorePeriod: number
  cyclePeriod: number
  numberOfCycles: number
  startTime?: number
  minBid: number
}

export type AuctionBase = AuctionBaseConfig & {
  allTimeTreasuryAmount: number
  isVerified: bool,
}

export type Auction = AuctionConfig &
  AuctionBase & {
    availableTreasuryAmount: number
    currentCycle: number
    isFinished: boolean
    isFrozen: boolean
    rootStatePubkey: PublicKey
  }

export type Cycle = {
  bids: Bid[]
  endTimestamp: number
}
