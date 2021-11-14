import { SimpleGrid, Text, useColorMode } from "@chakra-ui/react"
import Card from "components/common/Card"
import Link from "components/common/Link"
import { AuctionBase } from "contract-logic/queries/getAuctions"

type Props = {
  auction: AuctionBase
}

const AuctionCard = ({ auction }: Props): JSX.Element => {
  const { colorMode } = useColorMode()

  return (
    <Link
      href={`/${auction.id}`}
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
        <SimpleGrid gap={3} templateColumns="1fr">
          <Text
            as="span"
            fontFamily="display"
            fontSize="xl"
            fontWeight="bold"
            letterSpacing="wide"
            maxW="full"
            isTruncated
          >
            {auction.name}
          </Text>
        </SimpleGrid>
      </Card>
    </Link>
  )
}

export default AuctionCard
