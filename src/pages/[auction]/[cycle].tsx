import {
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react"
import Identicon from "components/common/Identicon"
import Layout from "components/common/Layout"
import useAuction from "components/[auction]/hooks/useAuction"
import useBids from "components/[auction]/hooks/useBids"
import { useRouter } from "next/router"
import shortenHex from "utils/shortenHex"

const Page = (): JSX.Element => {
  const data = useAuction()
  const { bids, largestBid } = useBids()
  const router = useRouter()

  return (
    <Layout title={data?.name}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12">
        <Image src={data?.nftData.uri} alt="NFT" borderRadius="xl" />
        <VStack alignItems="stretch" spacing="8">
          <Heading
            as="h3"
            fontSize="4xl"
            fontFamily="display"
          >{`${data?.nftData?.name} #${router.query.cycle}`}</Heading>
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
          <HStack spacing="3">
            <InputGroup size="lg">
              <NumberInput w="full">
                <NumberInputField
                  placeholder={(largestBid + 1).toString()}
                  min={largestBid + 1}
                  name="bid"
                />
              </NumberInput>
              <InputRightElement>
                <Text colorScheme="gray" mr="4">
                  SOL
                </Text>
              </InputRightElement>
            </InputGroup>
            <Button size="lg">Place bid</Button>
          </HStack>
          <VStack>
            {bids?.slice(0, 2).map((bid) => (
              <Flex
                key={bid.userPubKey}
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
