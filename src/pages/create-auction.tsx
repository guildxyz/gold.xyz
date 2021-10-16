import { Divider, Flex, VStack } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import WalletNotConnectedAlert from "components/common/WalletNotConnectedAlert"
import AssetSelector from "components/create-auction/AssetSelector"
import MinBid from "components/create-auction/MinBid"
import NameAndIcon from "components/create-auction/NameAndIcon"
import NumberOfCycles from "components/create-auction/NumberOfCycles"
import RoundSelector from "components/create-auction/RoundSelector"
import SubmitButton from "components/create-auction/SubmitButton"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { FormProvider, useForm } from "react-hook-form"

const CreateGuildPage = (): JSX.Element => {
  const { connected } = useWallet()
  const methods = useForm({ mode: "all" })

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  return (
    <FormProvider {...methods}>
      <Layout title="Start auction">
        {connected ? (
          <>
            <VStack spacing={10} alignItems="start">
              <Section title="Choose a name for your auction">
                <NameAndIcon />
              </Section>

              <Section title="Set asset">
                <AssetSelector />
              </Section>

              <Section title="Set the minimum price">
                <MinBid />
              </Section>

              <Divider />

              <Section title="Set round term">
                <RoundSelector />
              </Section>

              <Section title="Set the number of rounds">
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
