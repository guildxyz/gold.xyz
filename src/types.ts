import { IconProps } from "phosphor-react"

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>

type Rest = {
  [x: string]: any
}

type Bid = {
  amount: number
  userPubKey: string
}

type AuctionBody = {
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
  id: string
  startTimestamp: number
}

export type { Icon, Rest, AuctionBody, Auction, Bid }
