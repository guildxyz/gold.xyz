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
import { useWallet } from "@solana/wallet-adapter-react"
import Identicon from "components/common/Identicon"
import Layout from "components/common/Layout"
import WalletNotConnectedAlert from "components/common/WalletNotConnectedAlert"
import Bid from "components/[auction]/Bid"
import BidHistory from "components/[auction]/BidHistory"
import useAuction from "components/[auction]/hooks/useAuction"
import useBids from "components/[auction]/hooks/useBids"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const data = useAuction()
  const { bids, largestBid } = useBids()
  const { publicKey } = useWallet()

  if (!publicKey)
    return (
      <Layout title="Auction">
        <WalletNotConnectedAlert />
      </Layout>
    )

  return (
    <Layout title={data?.name}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12" alignItems="center">
        <Image src={data?.nftData.uri} alt="NFT" borderRadius="xl" />
        <VStack alignItems="stretch" spacing="8">
          <Heading as="h3" fontSize="4xl" fontFamily="display">{`${
            data?.nftData?.name
          } #${1}`}</Heading>
          <HStack divider={<Divider orientation="vertical" />} spacing="8">
            <Stat size="lg">
              <StatLabel>Current bid</StatLabel>
              <StatNumber>{largestBid} SOL</StatNumber>
            </Stat>
            <Stat size="lg">
              <StatLabel>Ends in</StatLabel>
              <StatNumber>16:53:24</StatNumber>
            </Stat>
          </HStack>
          <Bid />
          <VStack>
            {bids?.slice(0, 2).map((bid) => (
              <Flex
                key={bid.amount}
                bg="blackAlpha.300"
                px="4"
                py="3"
                borderRadius="xl"
                w="full"
              >
                <Identicon address={bid.userPubKey} size={20} />
                <Text ml="2">{shortenHex(bid.userPubKey)}</Text>
                <Text ml="auto" fontWeight="semibold">
                  {bid.amount} SOL
                </Text>
              </Flex>
            ))}
            <Button variant="ghost" bg="blackAlpha.200" h="48px" w="full">
              Bid history
            </Button>
          </VStack>
        </VStack>
      </SimpleGrid>
    </Layout>
  )
}

export default Page
