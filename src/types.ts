import { IconProps } from "phosphor-react"

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>

type Rest = {
  [x: string]: any
}

type AuctionBody = {
  name: string
  nftData: {
    name: string
    symbol: string
    uri: string
    maxSupply: number
  }
  cyclePeriod: number
  numberOfCycles: number
  minBid: number
}

type Auction = AuctionBody & {
  id: string
  startTimestamp: number
}

type Bid = {
  amount: number
  userPubKey: string
}

export type { Icon, Rest, AuctionBody, Auction, Bid }
