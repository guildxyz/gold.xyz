export type Bid = {
  bidderPubkey: string
  amount: number
}

export type NFTData = {
  type: "Nft"
  name: string
  symbol: string
  uri: string
  isRepeating: boolean
}

export type TokenData = {
  type: "Token"
  decimals: number
  mintAddress?: string
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
  description?: string
  socials?: string[]
  asset: NFTData | TokenData
  encorePeriod?: number
  cyclePeriod: number
  numberOfCycles: number
  startTime?: number
  minBid?: number
}

export type AuctionBase = AuctionBaseConfig & {
  allTimeTreasuryAmount: number
  isVerified: boolean
}

export type Auction = AuctionConfig &
  AuctionBase & {
    availableTreasuryAmount: number
    currentCycle: number
    isFinished: boolean
    isFrozen: boolean
    isFiltered: boolean
    rootStatePubkey: string
  }

export type Cycle = {
  bids: Bid[]
  endTimestamp: number
}
