import { IconProps } from "phosphor-react"

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>

type Rest = {
  [x: string]: any
}

type Bid = {
  bidAmount: number
  bidderPubkey: string
}

type AuctionBody = {
  id: string
  name: string
  nftData: {
    name: string
    symbol: string
    uri: string
    supply?: string
    maxSupply?: string
  }
  bids?: Bid[]
  cyclePeriod: number
  numberOfCycles: number
  minBid: number
}

type Auction = AuctionBody & {
  startTimestamp: number
}

export type { Icon, Rest, AuctionBody, Auction, Bid }
