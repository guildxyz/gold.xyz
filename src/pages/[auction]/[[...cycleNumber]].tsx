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
import ClaimRewardButton from "components/[auction]/ClaimRewardButton"
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
import {
  getAuction,
  getAuctionCycle,
  getAuctions,
} from "contract-logic/queries/getAuctions"
import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { CaretLeft, CaretRight } from "phosphor-react"
import { useEffect, useMemo } from "react"
import { SWRConfig, unstable_serialize } from "swr"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const { auction, error: auctionError } = useAuction()
  const { cycle, error: cycleError, mutate: mutateCycle } = useCycle()
  const nftData = useNftData(auction?.asset?.type === "Nft" ? auction?.asset : null)
  const { publicKey } = useWallet()
  const router = useRouter()
  const showCoinfetti = useCoinfetti()
  const statSize = useBreakpointValue({ base: "md", xl: "lg" })

  const cycleState = useMemo(() => {
    if (!auction || !cycle) return undefined
    if (
      auction.isFinished ||
      auction.isFrozen ||
      cycle.cycleNumber !== auction?.currentCycle
    )
      return "inactive"
    if (
      Date.now() < cycle.endTimestamp ||
      (!auction.isFinished &&
        cycle.cycleNumber === auction.currentCycle &&
        cycle.endTimestamp + 12_000 < Date.now())
    )
      return "active"
    if (auction.currentCycle < auction.numberOfCycles || cycle.bids?.length === 0)
      return "intermediate"
    return "inactive"
  }, [auction, cycle])

  const canClaim = useMemo(
    () =>
      !!cycle &&
      !!publicKey &&
      !!auction &&
      cycle.endTimestamp !== 0 &&
      cycle.bids?.[0]?.bidderPubkey === publicKey.toString() &&
      (auction.currentCycle > cycle.cycleNumber || auction.isFinished),
    [cycle, publicKey, auction]
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
            <HStack justifyContent="space-between" alignItems="center" w="full">
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
              {canClaim && <ClaimRewardButton />}
            </HStack>
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

const WrappedPage = ({ fallback }) => {
  useEffect(() => console.log(fallback), [fallback])

  return (
    <SWRConfig value={{ fallback }}>
      <Page />
    </SWRConfig>
  )
}

const getStaticProps: GetStaticProps = async ({ params }) => {
  /* if (params.cycleNumber) return { props: { fallback: {} } }

  const auctionIds = await getAuctions(false).then((auctions) =>
    auctions.map((auction) => auction.id)
  )

  if (!auctionIds.includes(params.auction as string))
    return { props: { fallback: {} } } */

  const auction = await getAuction(params.auction as string)
  const gatewayUri =
    auction.asset.type === "Nft"
      ? auction.asset.uri.replace?.("ipfs://", "https://ipfs.io/ipfs/") ?? ""
      : ""

  const uriPath =
    auction.asset.type === "Nft"
      ? `${gatewayUri}${
          auction.asset.uri.endsWith(".json")
            ? ""
            : `/${
                auction.asset.isRepeating
                  ? "0"
                  : params.cycleNumber ?? auction.currentCycle
              }.json`
        }`
      : null

  const nftData = uriPath
    ? await fetch(uriPath)
        .then((response) => response.json().catch(() => null))
        .catch(() => null)
    : null

  const image =
    nftData && nftData?.image?.length > 0
      ? await fetch(
          `${nftData?.image?.replace?.("ipfs://", "https://ipfs.io/ipfs/")}`
        )
          .then((response) =>
            response
              .arrayBuffer()
              .then(
                (buffer) =>
                  `data:${response.headers.get("content-type")};base64,${btoa(
                    String.fromCharCode(...new Uint8Array(buffer))
                  )}`
              )
          )
          .catch(() => null)
      : null

  console.log({ image })

  const cycle = await getAuctionCycle(
    auction.rootStatePubkey.toString(),
    auction.currentCycle
  )
    .then((data) => ({
      ...data,
      endTimestamp: data.endTimestamp * 1000,
    }))
    .catch(() => null)

  return {
    props: {
      fallback: {
        [unstable_serialize(["auction", params.auction as string])]: auction,
        ...(uriPath && nftData
          ? {
              [uriPath]: image ? { ...nftData, image } : nftData,
            }
          : {}),
        ...(cycle
          ? {
              [unstable_serialize([
                "cycle",
                auction.rootStatePubkey.toString(),
                auction.currentCycle,
              ])]: cycle,
            }
          : {}),
      },
    },
    revalidate: 30_000,
  }
}

const getStaticPaths: GetStaticPaths = async () => {
  const auctionIds = await Promise.all([getAuctions(false), getAuctions(true)]).then(
    ([activeAuctions, inactiveAuctions]) =>
      [activeAuctions, inactiveAuctions].flatMap((auctions) =>
        auctions.map((auction) => auction.id)
      )
  )
  /* const auctionIds = await getAuctions(false).then((auctions) =>
    auctions.map((auction) => auction.id)
  ) */

  return {
    paths: auctionIds.map((auction) => ({
      params: {
        auction,
        cycleNumber: undefined, // Only prerendering the current cycle
      },
    })),
    fallback: true,
  }
}

export { getStaticProps, getStaticPaths }
export default WrappedPage
