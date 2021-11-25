import { Divider, Flex, VStack } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import WalletNotConnectedAlert from "components/common/WalletNotConnectedAlert"
import AssetSelector from "components/create-auction/AssetSelector"
import NameAndIcon from "components/create-auction/NameAndIcon"
import NFTData from "components/create-auction/NFTData"
import NumberOfCycles from "components/create-auction/NumberOfCycles"
import RoundSelector from "components/create-auction/RoundSelector"
import SubmitButton from "components/create-auction/SubmitButton"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { FormProvider, useForm } from "react-hook-form"

const CreateGuildPage = (): JSX.Element => {
  const { connected } = useWallet()
  const methods = useForm({
    mode: "all",
    defaultValues: {
      name: "",
      asset: "NFT",
      nftData: {
        name: "",
        symbol: "",
      },
      nfts: {},
      numberOfCycles: 0,
    },
  })

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  return (
    <FormProvider {...methods}>
      <Layout title="Start auction" maxWidth="container.lg">
        {connected ? (
          <>
            <VStack spacing={10} alignItems="start">
              <Section title="Auction name">
                <NameAndIcon />
              </Section>

              <Divider />

              <Section title="Asset type">
                <AssetSelector />
              </Section>

              <NFTData />

              {/* <Section
                title={
                  <>
                    Set the minimum price
                    <Tag ml="2">Coming soon</Tag>
                  </>
                }
              >
                <MinBid />
              </Section> */}

              <Divider />

              <Section title="Round term">
                <RoundSelector />
              </Section>

              <Section title="Number of rounds">
                <NumberOfCycles />
              </Section>
            </VStack>

            <Flex justifyContent="right" mt="14">
              <SubmitButton />
            </Flex>
          </>
        ) : (
          <WalletNotConnectedAlert />
        )}
      </Layout>
    </FormProvider>
  )
}

export default CreateGuildPage
