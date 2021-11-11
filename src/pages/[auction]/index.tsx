import {
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react"
import Identicon from "components/common/Identicon"
import Layout from "components/common/Layout"
import Bid from "components/[auction]/Bid"
import BidHistory from "components/[auction]/BidHistory"
import Countdown from "components/[auction]/Countdown"
import useAuction from "components/[auction]/hooks/useAuction"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const data = useAuction()

  return (
    <Layout title={data?.name}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12" alignItems="center">
        <Image src={data?.nftData?.uri} alt="NFT" borderRadius="xl" />
        <VStack alignItems="stretch" spacing="8">
          <Heading
            as="h3"
            fontSize="4xl"
            fontFamily="display"
          >{`${data?.nftData?.name} #${data?.currentCycle}`}</Heading>
          <HStack divider={<Divider orientation="vertical" />} spacing="8">
            <Stat size="lg">
              <StatLabel>Current bid</StatLabel>
              <StatNumber>{data?.bids?.[0]?.amount} SOL</StatNumber>
            </Stat>
            <Stat size="lg">
              <StatLabel>Ends in</StatLabel>
              <StatNumber>
                <Countdown expiryTimestamp={data?.endTimestamp} />
              </StatNumber>
            </Stat>
          </HStack>
          <Bid />
          <VStack>
            {data?.bids?.slice(0, 2).map((bid) => (
              <Flex
                key={bid.amount.toString()}
                bg="blackAlpha.300"
                px="4"
                py="3"
                borderRadius="xl"
                w="full"
              >
                <Identicon address={bid.bidderPubkey.toString()} size={20} />
                <Text ml="2">{shortenHex(bid.bidderPubkey.toString())}</Text>
                <Text ml="auto" fontWeight="semibold">
                  {bid.amount} SOL
                </Text>
              </Flex>
            ))}
            <BidHistory />
          </VStack>
        </VStack>
      </SimpleGrid>
    </Layout>
  )
}

export default Page
