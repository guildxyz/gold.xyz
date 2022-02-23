import { Divider, Flex, Stack, VStack } from "@chakra-ui/react"
import { DevTool } from "@hookform/devtools"
import { useWallet } from "@solana/wallet-adapter-react"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import WalletNotConnectedAlert from "components/common/WalletNotConnectedAlert"
import AssetSelector from "components/create-auction/AssetSelector"
import Description from "components/create-auction/Description"
import GoalAmount from "components/create-auction/GoalAmount"
import MinimumBidAmount from "components/create-auction/MinimumBidAmount"
import NameAndIcon from "components/create-auction/NameAndIcon"
import NFTData from "components/create-auction/NFTData"
import NumberOfCycles from "components/create-auction/NumberOfCycles"
import RoundSelector from "components/create-auction/RoundSelector"
import SubmitButton from "components/create-auction/SubmitButton"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

const CreateGuildPage = (): JSX.Element => {
  const { connected } = useWallet()
  const methods = useForm({
    mode: "all",
    defaultValues: {
      name: "",
      asset: {
        type: "NFT",
        name: "",
        symbol: "",
      },
      nfts: [],
      minimumBidAmount: "",
      numberOfCycles: 0,
    },
  })

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  const [uploadPromise, setUploadPromise] = useState<Promise<void | void[]>>(null)

  return (
    <FormProvider {...methods}>
      <Layout title="Start auction" maxWidth="container.lg">
        {connected ? (
          <>
            <VStack spacing={10} alignItems="start">
              <Stack w="full" direction={{ base: "column", md: "row" }} spacing="10">
                <Section title="Choose a name for your auction">
                  <NameAndIcon />
                </Section>
                <Section
                  title="Set goal treasury amount"
                  maxW={{ base: "2xs", lg: "xs" }}
                  flexShrink="0"
                >
                  <GoalAmount />
                </Section>
              </Stack>

              <Section title="Description">
                <Description />
              </Section>

              <Divider />

              <Section title="Asset type">
                <AssetSelector />
              </Section>

              <NFTData setUploadPromise={setUploadPromise} />

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

              <Divider />

              <Section title="Minimum bid amount">
                <MinimumBidAmount />
              </Section>
            </VStack>

            <Flex justifyContent="right" mt="14">
              <SubmitButton uploadPromise={uploadPromise} />
            </Flex>
          </>
        ) : (
          <WalletNotConnectedAlert />
        )}
      </Layout>
      {process.env.NODE_ENV === "development" && (
        <DevTool control={methods.control} />
      )}
    </FormProvider>
  )
}

export default CreateGuildPage
