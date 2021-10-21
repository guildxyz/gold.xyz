import { Flex, Text, useColorMode, VStack } from "@chakra-ui/react"
import Card from "components/common/Card"
import Link from "components/common/Link"
import { Auction } from "types"

type Props = {
  auction: Auction
}

const AuctionCard = ({ auction }: Props): JSX.Element => {
  const { colorMode } = useColorMode()

  return (
    <Link
      href={`/${auction.name}`}
      _hover={{ textDecor: "none" }}
      borderRadius="2xl"
      w="full"
    >
      <Card
        role="group"
        position="relative"
        px={{ base: 5, sm: 7 }}
        py="7"
        w="full"
        h="full"
        bg={colorMode === "light" ? "white" : "gray.700"}
        justifyContent="center"
        _before={{
          content: `""`,
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          bg: "primary.300",
          opacity: 0,
          transition: "opacity 0.2s",
        }}
        _hover={{
          _before: {
            opacity: 0.1,
          },
        }}
        _active={{
          _before: {
            opacity: 0.17,
          },
        }}
      >
        <Flex alignItems="center">
          <VStack spacing={3} alignItems="start">
            <Text
              fontFamily="display"
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="wide"
            >
              {auction.name}
            </Text>
          </VStack>
        </Flex>
      </Card>
    </Link>
  )
}

export default AuctionCard
