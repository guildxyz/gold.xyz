// import fetchData from "components/index/utils/fetchData"
import { HStack, Stack, Tag, Text } from "@chakra-ui/react"
import Layout from "components/common/Layout"
import CategorySection from "components/index/CategorySection"
import useTreasuries from "components/index/hooks/useTreasuries"
import SearchBar from "components/index/SearchBar"
import TreasuryCard from "components/index/TreasuryCard"
import { useState } from "react"

const Page = (): JSX.Element => {
  const [searchInput, setSearchInput] = useState("")
  const treasuries = useTreasuries()

  return (
    <Layout title="Treasury">
      <Stack direction="row" spacing={{ base: 2, md: "6" }} mb={16}>
        <SearchBar setSearchInput={setSearchInput} />
        {/* <OrderSelect {...{ guilds, setOrderedGuilds }} /> */}
      </Stack>
      <CategorySection
        title={
          <HStack spacing={2} alignItems="center">
            <Text as="span">All treasuries</Text>
            {treasuries?.length && <Tag size="sm">{treasuries?.length}</Tag>}
          </HStack>
        }
        fallbackText={
          treasuries?.length
            ? `No results for ${searchInput}`
            : "Connect your wallet to view treasuries"
        }
      >
        {treasuries?.length &&
          treasuries.map((treasury) => (
            <TreasuryCard key={treasury.urlName} treasury={treasury} />
          ))}
      </CategorySection>
    </Layout>
  )
}

export default Page
