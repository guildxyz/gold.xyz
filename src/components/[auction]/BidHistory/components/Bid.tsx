import { Flex, Text } from "@chakra-ui/react"
import Identicon from "components/common/Identicon"
import { Bid } from "contract-logic/queries/types"
import shortenHex from "utils/shortenHex"

type Props = {
  bid: Bid
}

const Bid = ({ bid }: Props) => (
  <Flex bg="blackAlpha.300" px="4" py="3" borderRadius="xl" w="full">
    <Identicon address={bid.bidderPubkey.toString()} size={20} />
    <Text ml="2">{shortenHex(bid.bidderPubkey.toString())}</Text>
    <Text ml="auto" fontWeight="semibold">
      {bid.amount} SOL
    </Text>
  </Flex>
)

export default Bid
