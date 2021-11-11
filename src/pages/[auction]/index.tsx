import {
  Alert,
  AlertIcon,
  AlertTitle,
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
  const { auction, error } = useAuction()

  if (error)
    return (
      <Layout title="">
        <Alert status="error" pb="5">
          <AlertIcon />
          <AlertTitle position="relative" top="4px">
            Unable to load auction
          </AlertTitle>
        </Alert>
      </Layout>
    )

  return (
    <Layout title={auction?.name}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12" alignItems="center">
        <Image src={auction?.nftData?.uri} alt="NFT" borderRadius="xl" />
        <VStack alignItems="stretch" spacing="8">
          <Heading
            as="h3"
            fontSize="4xl"
            fontFamily="display"
          >{`${auction?.nftData?.name} #${auction?.currentCycle}`}</Heading>
          <HStack divider={<Divider orientation="vertical" />} spacing="8">
            <Stat size="lg">
              <StatLabel>Current bid</StatLabel>
              <StatNumber>{auction?.bids?.[0]?.amount} SOL</StatNumber>
            </Stat>
            <Stat size="lg">
              <StatLabel>Ends in</StatLabel>
              <StatNumber>
                <Countdown expiryTimestamp={auction?.endTimestamp} />
              </StatNumber>
            </Stat>
          </HStack>
          <Bid />
          <VStack>
            {auction?.bids?.slice(0, 2).map((bid) => (
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
