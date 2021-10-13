import { IconProps } from "phosphor-react"

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>

type Rest = {
  [x: string]: any
}

type Treasury = {
  name: string
  urlName: string
}

export type { Icon, Rest, Treasury }
