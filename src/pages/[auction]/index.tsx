import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import Identicon from "components/common/Identicon"
import Layout from "components/common/Layout"
import Bid from "components/[auction]/Bid"
import BidHistory from "components/[auction]/BidHistory"
import Countdown from "components/[auction]/Countdown"
import HighestBid from "components/[auction]/HighestBid"
import useAuction from "components/[auction]/hooks/useAuction"
import SettingsMenu from "components/[auction]/SettingsMenu"
import { useRouter } from "next/router"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const { auction, error } = useAuction()
  const { publicKey } = useWallet()
  const router = useRouter()

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

  const {
    name = router.query.auction as string,
    nftData,
    bids,
    currentCycle = 0,
    endTimestamp,
    isActive = true,
    ownerPubkey,
  } = auction ?? {}

  return (
    <Layout
      title={name}
      action={publicKey?.toString() === ownerPubkey?.toString() && <SettingsMenu />}
    >
      <SimpleGrid
        templateColumns={{ base: "1fr", md: "5fr 4fr" }}
        spacing="16"
        alignItems="center"
      >
        <Center>
          <Image
            src={nftData?.uri}
            alt="NFT"
            borderRadius="xl"
            maxH="calc(100vh - 400px)"
            shadow="xl"
            fallback={<Skeleton w="350px" h="350px" borderRadius="xl" />}
          />
        </Center>
        <VStack alignItems="stretch" spacing="8">
          <Skeleton isLoaded={!!nftData} w="fit-content">
            <Heading
              as="h3"
              fontSize="4xl"
              fontFamily="display"
              d="inline-block"
            >{`${nftData?.name} #${currentCycle}`}</Heading>
          </Skeleton>
          <HStack
            divider={<Divider orientation="vertical" />}
            spacing="8"
            alignItems="flex-start"
          >
            <Stat size="lg">
              <StatLabel>{isActive ? "Current bid" : "Winning bid"}</StatLabel>
              <Skeleton isLoaded={!!bids}>
                <HighestBid amount={bids?.[0]?.amount} />
              </Skeleton>
            </Stat>
            <Stat size="lg">
              {isActive ? (
                <>
                  <StatLabel>Ends in</StatLabel>
                  <Skeleton isLoaded={!!endTimestamp}>
                    <Countdown expiryTimestamp={endTimestamp} />
                  </Skeleton>
                </>
              ) : (
                <>
                  <StatLabel>Winner</StatLabel>
                  <StatNumber>
                    {bids?.[0]?.bidderPubkey
                      ? shortenHex(bids?.[0]?.bidderPubkey.toString())
                      : "-"}
                  </StatNumber>
                </>
              )}
            </Stat>
          </HStack>
          {isActive ? (
            <Bid />
          ) : (
            <Box>
              <Tag size="lg">Auction ended</Tag>
            </Box>
          )}
          <VStack>
            {bids?.slice(0, 2).map((bid) => (
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
