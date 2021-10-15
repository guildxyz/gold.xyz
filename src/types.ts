import { IconProps } from "phosphor-react"

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>

type Rest = {
  [x: string]: any
}

type Auction = {
  id: string
  name: string
  nftData: {
    name: string
    symbol: string
    uri: string
  }
  cyclePeriod: number
  numberOfCycles: number
  minBid: number
  startTimestamp: number
}

type Bid = {
  amount: number
  userPubKey: string
}

export type { Icon, Rest, Auction, Bid }
