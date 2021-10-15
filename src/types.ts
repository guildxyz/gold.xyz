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
}

export type { Icon, Rest, Auction }
