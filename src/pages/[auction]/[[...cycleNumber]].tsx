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
  Spacer,
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
import Link from "components/common/Link"
import Bid from "components/[auction]/Bid"
import BidHistory from "components/[auction]/BidHistory"
import Countdown from "components/[auction]/Countdown"
import CycleEndAlert from "components/[auction]/CycleEndAlert"
import HighestBid from "components/[auction]/HighestBid"
import useAuction from "components/[auction]/hooks/useAuction"
import useCycle from "components/[auction]/hooks/useCycle"
import useNftData from "components/[auction]/hooks/useNftData"
import SettingsMenu from "components/[auction]/SettingsMenu"
import { useCoinfetti } from "components/_app/Coinfetti"
import { useRouter } from "next/router"
import { CaretLeft, CaretRight } from "phosphor-react"
import { useState } from "react"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const [timerExpired, setTimerExpired] = useState<boolean>(false)
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
    setTimerExpired(true)
    if (!isCycleActive) return
    await mutateCycle()
    if (bids?.[0]?.bidderPubkey?.toString() !== publicKey?.toString()) return
    showCoinfetti()
  }

  return (
    <Layout
      title={name}
      description={description}
      showLayoutDescription
      action={
        <>
          {!!goalTreasuryAmount && (
            <Tag size="lg" mb="-8px !important">
              Current:
              <Text
                as="span"
                fontWeight="bold"
                mx="1"
              >{`${allTimeTreasuryAmount} SOL`}</Text>
              <Text as="span" colorScheme="gray" mr="2" ml="1">
                /
              </Text>
              Goal:
              <Text
                as="span"
                fontWeight="bold"
                mx="1"
              >{`${goalTreasuryAmount} SOL`}</Text>
            </Tag>
          )}
          <Spacer />
          {publicKey &&
            ownerPubkey &&
            publicKey?.toString() === ownerPubkey?.toString() && <SettingsMenu />}
        </>
      }
    >
      <SimpleGrid templateColumns={{ base: "1fr", lg: "5fr 4fr" }} spacing="16">
        <Center>
          <Image
            src={nftData?.image}
            alt="NFT"
            borderRadius="xl"
            maxH="calc(100vh - 400px)"
            shadow="xl"
            fallback={<Skeleton w="350px" h="350px" borderRadius="xl" />}
          />
        </Center>
        <VStack alignItems="stretch" spacing="8">
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
                {isCycleActive && !timerExpired ? "Current bid" : "Winning bid"}
              </StatLabel>
              <Skeleton isLoaded={!!bids}>
                <HighestBid amount={bids?.[0]?.amount} />
              </Skeleton>
            </Stat>
            <Stat size="lg">
              {isCycleActive && !timerExpired ? (
                <>
                  <StatLabel>Ends in</StatLabel>
                  <Skeleton isLoaded={!!endTimestamp}>
                    <Countdown expiryTimestamp={endTimestamp} onExpire={celebrate} />
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
            (isCycleActive && !timerExpired ? (
              <Bid />
            ) : (
              <Box>
                <Tag size="lg">Auction ended</Tag>
              </Box>
            ))}
          <VStack>
            {timerExpired ? (
              <CycleEndAlert
                nextCycleStartTimestamp={endTimestamp + 30_000}
                setTimerExpired={setTimerExpired}
                bidsLength={bids?.length ?? 0}
              />
            ) : (
              <>
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
              </>
            )}
          </VStack>
        </VStack>
      </SimpleGrid>
    </Layout>
  )
}

export default Page
