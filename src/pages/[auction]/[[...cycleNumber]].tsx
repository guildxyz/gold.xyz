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
  Spinner,
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
import useNftData from "components/[auction]/hooks/useNftData"
import ProgressBar from "components/[auction]/ProgressBar"
import SettingsMenu from "components/[auction]/SettingsMenu"
import { useCoinfetti } from "components/_app/Coinfetti"
import { useRouter } from "next/router"
import { CaretLeft, CaretRight } from "phosphor-react"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const { auction, error: auctionError } = useAuction()
  const { cycle, error: cycleError, mutate: mutateCycle } = useCycle()
  const nftData = useNftData(auction?.asset?.type === "NFT" ? auction?.asset : null)
  const { publicKey } = useWallet()
  const router = useRouter()
  const showCoinfetti = useCoinfetti()

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
    allTimeTreasuryAmount,
    currentCycle,
    isFinished,
    isFrozen,
    ownerPubkey,
  } = auction ?? {}

  const { cycleNumber, bids, endTimestamp } = cycle ?? {}

  const isCycleActive = !isFinished && !isFrozen && cycleNumber === currentCycle

  const celebrate = async () => {
    if (!isCycleActive) return
    await mutateCycle()
    if (bids?.[0]?.bidderPubkey?.toString() !== publicKey?.toString()) return
    showCoinfetti()
  }

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
        <SimpleGrid templateColumns={{ base: "1fr", lg: "5fr 4fr" }} minH="510px">
          <Center bg="gray.900" pos={"relative"}>
            <Image
              pos={"absolute"}
              src={nftData?.image}
              alt="NFT"
              fallback={
                <VStack spacing={3}>
                  <Spinner />
                  <Text fontSize={"sm"}>Loading image</Text>
                </VStack>
              }
              maxH="full"
              maxW="full"
              objectFit="contain"
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
              <Heading as="h3" fontSize="3xl" fontFamily="display" d="inline-block">
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
                      <Countdown
                        expiryTimestamp={endTimestamp}
                        onExpire={celebrate}
                      />
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
              {isCycleActive && !bids?.length ? (
                <Text colorScheme={"gray"} w="full" fontSize={"sm"}>
                  No bids yet
                </Text>
              ) : (
                bids?.slice(0, 2).map((bid) => (
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
                ))
              )}
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
