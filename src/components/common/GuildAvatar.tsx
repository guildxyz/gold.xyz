import { Icon } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import dynamic from "next/dynamic"
import addressAvatarPairs from "static/avatars/addressAvatarPairs"

type Props = {
  size?: number
  address: PublicKey
}

const GuildAvatar = ({ size = 8, address }: Props): JSX.Element => {
  const Avatar = dynamic(
    () =>
      import(
        `static/avatars/${addressAvatarPairs[address.toString().slice(-2)]}.svg`
      )
  )

  return <Icon as={Avatar} boxSize={size} />
}

export default GuildAvatar
