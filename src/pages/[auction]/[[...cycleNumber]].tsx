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
  Icon,
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
import Card from "components/common/Card"
import Identicon from "components/common/Identicon"
import Layout from "components/common/Layout"
import Link from "components/common/Link"
import Section from "components/common/Section"
import Bid from "components/[auction]/Bid"
import BidHistory from "components/[auction]/BidHistory"
import Countdown from "components/[auction]/Countdown"
import HighestBid from "components/[auction]/HighestBid"
import useAuction from "components/[auction]/hooks/useAuction"
import useCycle from "components/[auction]/hooks/useCycle"
import ProgressBar from "components/[auction]/ProgressBar"
import SettingsMenu from "components/[auction]/SettingsMenu"
import { useRouter } from "next/router"
import { CaretLeft, CaretRight } from "phosphor-react"
import useSWRImmutable from "swr/immutable"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const { auction, error: auctionError } = useAuction()
  const { cycle, error: cycleError } = useCycle()
  const { publicKey } = useWallet()
  const router = useRouter()
  const { data: nftData } = useSWRImmutable(
    auction?.asset?.type === "NFT" ? auction.asset.uri : null
  )

  if (auctionError || cycleError)
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
    description,
    goalTreasuryAmount,
    availableTreasuryAmount,
    allTimeTreasuryAmount,
    currentCycle,
    isFinished,
    isFrozen,
    ownerPubkey,
    numberOfCycles,
  } = auction ?? {}

  const { cycleNumber, bids, endTimestamp } = cycle ?? {}

  const isCycleActive = !isFinished && cycleNumber === currentCycle

  return (
    <Layout
      title={name}
      description={description}
      action={
        <HStack w="full" spacing={4}>
          <ProgressBar />
          {publicKey &&
            ownerPubkey &&
            publicKey?.toString() === ownerPubkey?.toString() &&
            !!isCycleActive && <SettingsMenu />}
        </HStack>
      }
    >
      <Card mb={12}>
        <SimpleGrid templateColumns={{ base: "1fr", lg: "5fr 4fr" }}>
          <Center bg="gray.900" p={12}>
            <Image
              src={nftData?.image}
              alt="NFT"
              borderRadius="xl"
              maxH="calc(100vh - 400px)"
              shadow="xl"
              fallback={<Skeleton w="350px" h="350px" borderRadius="xl" />}
            />
          </Center>
          <VStack p={12} alignItems="stretch" spacing="8">
            <HStack justifyContent="space-between" mb="-3" w="full" minH="1.3em">
              {cycleNumber > 1 && (
                <Link
                  fontSize="sm"
                  opacity="0.6"
                  href={`/${router.query.auction}/${cycleNumber - 1}`}
                >
                  <Icon as={CaretLeft} mr="2" />
                  Prev cycle
                </Link>
              )}
              {cycleNumber < currentCycle && (
                <Link
                  fontSize="sm"
                  opacity="0.6"
                  href={`/${router.query.auction}/${cycleNumber + 1}`}
                  ml="auto"
                >
                  Next cycle
                  <Icon as={CaretRight} ml="2" />
                </Link>
              )}
            </HStack>
            <Skeleton isLoaded={!!nftData} w="fit-content">
              <Heading as="h3" fontSize="4xl" fontFamily="display" d="inline-block">
                {nftData?.name}
              </Heading>
            </Skeleton>
            <HStack
              divider={<Divider orientation="vertical" />}
              spacing="8"
              alignItems="flex-start"
            >
              <Stat size="lg">
                <StatLabel>
                  {isCycleActive ? "Current bid" : "Winning bid"}
                </StatLabel>
                <Skeleton isLoaded={!!bids}>
                  <HighestBid amount={bids?.[0]?.amount} />
                </Skeleton>
              </Stat>
              <Stat size="lg">
                {isCycleActive ? (
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
            {isCycleActive !== undefined &&
              (isCycleActive ? (
                <Bid />
              ) : (
                <Box>
                  <Tag size="lg">Auction ended</Tag>
                </Box>
              ))}
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
      </Card>

      {description && (
        <Section title="Description">
          <Text>{description}</Text>
        </Section>
      )}
    </Layout>
  )
}

export default Page
