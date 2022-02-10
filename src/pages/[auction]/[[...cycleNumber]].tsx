import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  Divider,
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
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import Card from "components/common/Card"
import Layout from "components/common/Layout"
import Link from "components/common/Link"
import Section from "components/common/Section"
import BidHistory from "components/[auction]/BidHistory"
import Countdown from "components/[auction]/Countdown"
import CycleEndAlert from "components/[auction]/CycleEndAlert"
import HighestBid from "components/[auction]/HighestBid"
import useAuction from "components/[auction]/hooks/useAuction"
import useCycle from "components/[auction]/hooks/useCycle"
import useNftData from "components/[auction]/hooks/useNftData"
import PlaceBid from "components/[auction]/PlaceBid"
import ProgressBar from "components/[auction]/ProgressBar"
import SettingsMenu from "components/[auction]/SettingsMenu"
import { useCoinfetti } from "components/_app/Coinfetti"
import { useRouter } from "next/router"
import { CaretLeft, CaretRight } from "phosphor-react"
import { useMemo } from "react"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const { auction, error: auctionError } = useAuction()
  const { cycle, error: cycleError, mutate: mutateCycle } = useCycle()
  const nftData = useNftData(auction?.asset?.type === "NFT" ? auction?.asset : null)
  const { publicKey } = useWallet()
  const router = useRouter()
  const showCoinfetti = useCoinfetti()
  const statSize = useBreakpointValue({ base: "md", xl: "lg" })

  const cycleState = useMemo(() => {
    if (!auction || !cycle) return undefined
    if (
      auction?.isFinished ||
      auction?.isFrozen ||
      cycle?.cycleNumber !== auction?.currentCycle
    )
      return "inactive"
    if (Date.now() < cycle?.endTimestamp) return "active"
    if (auction?.currentCycle < auction?.numberOfCycles || cycle?.bids?.length === 0)
      return "intermediate"
    return "inactive"
  }, [auction, cycle])

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

  const celebrate = async () => {
    if (cycleState === "inactive") return
    await mutateCycle()
    if (cycle?.bids?.[0]?.bidderPubkey?.toString() !== publicKey?.toString()) return
    showCoinfetti()
  }

  return (
    <Layout
      title={auction?.name ?? (router.query.auction as string)}
      description={auction?.description}
      action={
        <HStack w="full" spacing={4}>
          <ProgressBar />
          {publicKey &&
            auction?.ownerPubkey &&
            publicKey?.toString() === auction?.ownerPubkey?.toString() && (
              <SettingsMenu />
            )}
        </HStack>
      }
    >
      <Card mb={12}>
        <SimpleGrid templateColumns={{ base: "1fr", lg: "5fr 4fr" }} minH="510px">
          <Center bg="gray.900" pos={"relative"} minH="300px">
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
          <VStack p={{ base: 6, md: 12 }} alignItems="stretch" spacing="8">
            <HStack justifyContent="space-between" mb="-3" w="full" minH="1.3em">
              {cycle?.cycleNumber > 1 && (
                <Link
                  fontSize="sm"
                  opacity="0.6"
                  href={`/${router.query.auction}/${cycle?.cycleNumber - 1}`}
                >
                  <Icon as={CaretLeft} mr="2" />
                  Prev cycle
                </Link>
              )}
              {cycle?.cycleNumber < auction?.currentCycle && (
                <Link
                  fontSize="sm"
                  opacity="0.6"
                  href={`/${router.query.auction}/${cycle?.cycleNumber + 1}`}
                  ml="auto"
                >
                  Next cycle
                  <Icon as={CaretRight} ml="2" />
                </Link>
              )}
            </HStack>
            <Skeleton isLoaded={!!nftData} w="fit-content" minW="180px" minH="2em">
              <Heading
                as="h3"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontFamily="display"
                d="inline-block"
              >
                {nftData?.name}
              </Heading>
            </Skeleton>
            <HStack
              divider={<Divider orientation="vertical" />}
              spacing="8"
              alignItems="flex-start"
            >
              <Stat size={statSize}>
                <StatLabel>
                  {cycleState === "active" ? "Current bid" : "Winning bid"}
                </StatLabel>
                <Skeleton isLoaded={!!cycle?.bids}>
                  <HighestBid amount={cycle?.bids?.[0]?.amount} />
                </Skeleton>
              </Stat>
              <Stat size={statSize}>
                {cycleState === "active" ? (
                  <>
                    <StatLabel>Ends in</StatLabel>
                    <Skeleton isLoaded={!!cycle?.endTimestamp}>
                      <Countdown
                        expiryTimestamp={cycle?.endTimestamp}
                        onExpire={celebrate}
                      />
                    </Skeleton>
                  </>
                ) : (
                  <>
                    <StatLabel>Winner</StatLabel>
                    <StatNumber>
                      {cycle?.bids?.[0]?.bidderPubkey
                        ? shortenHex(cycle?.bids?.[0]?.bidderPubkey.toString())
                        : "-"}
                    </StatNumber>
                  </>
                )}
              </Stat>
            </HStack>
            {cycleState !== undefined &&
              (cycleState === "active" ? (
                <PlaceBid />
              ) : cycleState === "intermediate" ? (
                <CycleEndAlert />
              ) : (
                <Box>
                  <Tag size="lg">Auction ended</Tag>
                </Box>
              ))}
            <BidHistory cycleState={cycleState} />
          </VStack>
        </SimpleGrid>
      </Card>

      {auction?.description && (
        <Section title="Description">
          <Text>{auction?.description}</Text>
        </Section>
      )}
    </Layout>
  )
}

export default Page
