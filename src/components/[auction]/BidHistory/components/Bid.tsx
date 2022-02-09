import { Flex, Text } from "@chakra-ui/react"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import Identicon from "components/common/Identicon"
import { Bid } from "contract-logic/queries/types"
import shortenHex from "utils/shortenHex"

type Props = {
  bid: Bid
}

const Bid = ({ bid }: Props) => (
  <CardMotionWrapper w="full" shouldBounce>
    <Flex bg="#35353B" px="4" py="3" borderRadius="xl" w="full">
      <Identicon address={bid.bidderPubkey.toString()} size={20} />
      <Text ml="2">{shortenHex(bid.bidderPubkey.toString())}</Text>
      <Text ml="auto" fontWeight="semibold">
        {bid.amount} SOL
      </Text>
    </Flex>
  </CardMotionWrapper>
)

export default Bid
