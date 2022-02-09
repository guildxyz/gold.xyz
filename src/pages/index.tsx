import { Stack, Tag } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import AddCard from "components/common/AddCard"
import Layout from "components/common/Layout"
import AuctionCard from "components/index/AuctionCard"
import CategorySection from "components/index/CategorySection"
import ExplorerCardMotionWrapper from "components/index/ExplorerCardMotionWrapper"
import useAuctions from "components/index/hooks/useAuctions"
import useUsersAuctions from "components/index/hooks/useUsersAuctions"
import SearchBar from "components/index/SearchBar"
import { useMemo, useState } from "react"

const filterByName = (name: string, searchInput: string) =>
  name.toLowerCase().includes(searchInput.toLowerCase())

const Page = (): JSX.Element => {
  const [searchInput, setSearchInput] = useState("")
  const { auctions, isLoading } = useAuctions()
  const usersAuctions = useUsersAuctions()
  const { publicKey } = useWallet()

  const filteredAuctions = useMemo(
    () => auctions?.filter(({ name }) => filterByName(name, searchInput)),
    [auctions, searchInput]
  )
  const filteredUsersAuctions = useMemo(
    () => usersAuctions?.filter(({ name }) => filterByName(name, searchInput)),
    [usersAuctions, searchInput]
  )

  return (
    <Layout title="Gold.xyz" imageUrl="/logo.svg">
      <Stack direction="row" spacing={{ base: 2, md: "6" }} mb={16} maxW="md">
        <SearchBar setSearchInput={setSearchInput} />
      </Stack>
      <Stack spacing={12}>
        <CategorySection
          title={
            publicKey && !usersAuctions?.length && !isLoading
              ? "You don't have any auctions yet"
              : "Your auctions"
          }
          isLoading={isLoading}
          fallbackText={
            !publicKey
              ? "Connect your wallet to view your auctions"
              : `No results for ${searchInput}`
          }
        >
          {usersAuctions?.length
            ? filteredUsersAuctions
                .map((auction) => (
                  <ExplorerCardMotionWrapper key={auction.id}>
                    <AuctionCard key={auction.id} auction={auction} />
                  </ExplorerCardMotionWrapper>
                ))
                .concat(
                  <ExplorerCardMotionWrapper key="create-auction">
                    <AddCard text="Open auction" link="/create-auction" />
                  </ExplorerCardMotionWrapper>
                )
            : publicKey && (
                <ExplorerCardMotionWrapper key="create-auction">
                  <AddCard text="Create auction" link="/create-auction" />
                </ExplorerCardMotionWrapper>
              )}
        </CategorySection>
        <CategorySection
          title="All auctions"
          titleRightElement={
            auctions?.length && <Tag size="sm">{auctions?.length}</Tag>
          }
          isLoading={isLoading}
          fallbackText={
            auctions?.length
              ? `No results for ${searchInput}`
              : "Unable to load auctions"
          }
        >
          {filteredAuctions?.length &&
            filteredAuctions.map((auction) => (
              <ExplorerCardMotionWrapper key={auction.id}>
                <AuctionCard auction={auction} />
              </ExplorerCardMotionWrapper>
            ))}
        </CategorySection>
      </Stack>
    </Layout>
  )
}

export default Page
