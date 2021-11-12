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
import useAuction from "components/[auction]/hooks/useAuction"
import SettingsMenu from "components/[auction]/SettingsMenu"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const { auction, error } = useAuction()
  const { publicKey } = useWallet()

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

  const { name, nftData, bids, currentCycle, endTimestamp, isActive, ownerPubkey } =
    auction ?? {}

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
          />
        </Center>
        <VStack alignItems="stretch" spacing="8">
          <Heading
            as="h3"
            fontSize="4xl"
            fontFamily="display"
          >{`${nftData?.name} #${currentCycle}`}</Heading>
          <HStack divider={<Divider orientation="vertical" />} spacing="8">
            <Stat size="lg">
              <StatLabel>{isActive ? "Current bid" : "Winning bid"}</StatLabel>
              <StatNumber>
                {bids?.[0]?.amount ? `${bids?.[0]?.amount} SOL` : "-"}
              </StatNumber>
            </Stat>
            <Stat size="lg">
              {isActive ? (
                <>
                  <StatLabel>Ends in</StatLabel>
                  <StatNumber>
                    {<Countdown expiryTimestamp={endTimestamp} />}
                  </StatNumber>
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
