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
import { useCallback, useEffect, useMemo, useState } from "react"
import { TimerResult, useTimer } from "react-timer-hook"
import shortenHex from "utils/shortenHex"

const displayTime = (timer: TimerResult) => {
  const displayDays = !!timer.days
  const displayHours = displayDays || !!timer.hours
  const displayMinutes = displayHours || !!timer.minutes

  if (displayDays)
    return `${timer.days} days ${timer.hours} hours ${timer.minutes} minutes ${timer.seconds} seconds`
  if (displayHours)
    return `${timer.hours} hours ${timer.minutes} minutes ${timer.seconds} seconds`
  if (displayMinutes) return `${timer.minutes} minutes ${timer.seconds} seconds`
  return `${timer.seconds} seconds`
}

const Page = (): JSX.Element => {
  const { auction, error: auctionError } = useAuction()
  const { cycle, error: cycleError, mutate: mutateCycle } = useCycle()
  const nftData = useNftData(auction?.asset?.type === "Nft" ? auction?.asset : null)
  const { publicKey } = useWallet()
  const router = useRouter()
  const showCoinfetti = useCoinfetti()
  const statSize = useBreakpointValue({ base: "md", xl: "lg" })
  const [hasStarted, setHasStarted] = useState<boolean>(true)

  useEffect(() => {
    setHasStarted(!auction || !auction.startTime || auction.startTime < Date.now())
  }, [auction])

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

  const celebrate = useCallback(async () => {
    if (cycleState === "inactive") return
    await mutateCycle()
    if (
      publicKey !== undefined &&
      cycle?.bids?.[0]?.bidderPubkey?.toString() === publicKey?.toString()
    )
      showCoinfetti()
  }, [cycle?.bids, cycleState, mutateCycle, publicKey, showCoinfetti])

  // Using usetimer here just to convert seconds to day, hour, minute, second
  const encoreTime = useTimer({
    expiryTimestamp: new Date(Date.now() + (auction?.encorePeriod ?? 0) * 1000),
    autoStart: false,
  })
  useEffect(
    () =>
      encoreTime.restart(
        new Date(Date.now() + (auction?.encorePeriod ?? 0) * 1000),
        false
      ),
    [auction]
  )

  const countdownProps = useMemo(
    () =>
      hasStarted
        ? {
            expiryTimestamp: cycle?.endTimestamp,
            onExpire: celebrate,
          }
        : {
            expiryTimestamp: auction.startTime,
            onExpire: () => setHasStarted(true),
          },
    [auction?.startTime, celebrate, cycle?.endTimestamp, hasStarted]
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
                    <StatLabel>{hasStarted ? "Ends in" : "Starts in"}</StatLabel>
                    <Skeleton
                      isLoaded={
                        hasStarted ? !!cycle?.endTimestamp : !!auction?.startTime
                      }
                    >
                      {!!countdownProps.expiryTimestamp && (
                        <Countdown {...countdownProps} />
                      )}
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
              (!hasStarted ? (
                <Alert status="info" alignItems="center">
                  <AlertIcon mb="3px" />
                  This Auction hasn't started yet
                </Alert>
              ) : cycleState === "active" ? (
                <PlaceBid />
              ) : cycleState === "intermediate" ? (
                <>{!!cycle.endTimestamp && <CycleEndAlert />}</>
              ) : (
                <Box>
                  <Tag size="lg">Auction ended</Tag>
                </Box>
              ))}
            {cycle &&
              auction &&
              cycleState === "active" &&
              cycle.endTimestamp - Date.now() <= auction.encorePeriod * 1000 && (
                <Alert status="info" alignItems="center">
                  <AlertIcon mb="3px" />
                  If you bid now the bidding period will be extended to{" "}
                  {displayTime(encoreTime)}
                </Alert>
              )}
            {hasStarted && <BidHistory cycleState={cycleState} />}
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
