// import fetchData from "components/index/utils/fetchData"
import { HStack, Stack, Tag, Text } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import AddCard from "components/common/AddCard"
import Layout from "components/common/Layout"
import AuctionCard from "components/index/AuctionCard"
import CategorySection from "components/index/CategorySection"
import useAuctions from "components/index/hooks/useAuctions"
import SearchBar from "components/index/SearchBar"
import { useMemo, useState } from "react"

const filterByName = (name: string, searchInput: string) =>
  name.toLowerCase().includes(searchInput.toLowerCase())

const Page = (): JSX.Element => {
  const [searchInput, setSearchInput] = useState("")
  const auctions = useAuctions()
  const usersAuctions = []
  const { publicKey } = useWallet()

  const filteredAuctions = useMemo(
    () => auctions.filter(({ name }) => filterByName(name, searchInput)),
    [auctions, searchInput]
  )

  return (
    <Layout title="Gold.xyz">
      <Stack direction="row" spacing={{ base: 2, md: "6" }} mb={16} maxW="md">
        <SearchBar setSearchInput={setSearchInput} />
      </Stack>
      <Stack spacing={12}>
        <CategorySection
          title={
            !usersAuctions.length && publicKey
              ? "You don't have any auctions yet"
              : "Your auctions"
          }
          fallbackText={
            !publicKey
              ? "Connect your wallet to view auctions"
              : `No results for ${searchInput}`
          }
        >
          {usersAuctions.length
            ? usersAuctions
                .map((auction) => <AuctionCard key={auction.id} auction={auction} />)
                .concat(
                  <AddCard
                    key="create-auction"
                    text="Open auction"
                    link="/create-auction"
                  />
                )
            : publicKey && <AddCard text="Create auction" link="/create-auction" />}
        </CategorySection>
        <CategorySection
          title={
            <HStack spacing={2} alignItems="center">
              <Text as="span">All auctions</Text>
              {auctions?.length && <Tag size="sm">{auctions?.length}</Tag>}
            </HStack>
          }
          fallbackText={
            auctions?.length
              ? `No results for ${searchInput}`
              : "Connect your wallet to view auctions"
          }
        >
          {filteredAuctions?.length &&
            filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
        </CategorySection>
      </Stack>
    </Layout>
  )
}

export default Page
