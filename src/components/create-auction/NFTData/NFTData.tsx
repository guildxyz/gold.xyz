import { FormControl, FormErrorMessage, Grid, HStack, Input } from "@chakra-ui/react"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import Section from "components/common/Section"
import UploadFile from "components/create-auction/UploadFile"
import { AnimatePresence, AnimateSharedLayout } from "framer-motion"
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import NFTCard from "./components/NFTCard"

const NFTData = () => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  const [previews, setPreviews] = useState<Record<string, string>>({})

  const nfts = useWatch({ name: "nfts" })

  const removeNft = (id: string) => {
    const newNfts = Object.fromEntries(
      Object.entries(nfts).filter(([nftId]) => nftId !== id)
    )
    setValue("nfts", newNfts)
  }

  return (
    <>
      <Section title="NFT collection name and symbol">
        <HStack alignItems="start">
          <FormControl isInvalid={errors?.nftData?.name} maxWidth="sm" w="full">
            <Input
              size="lg"
              {...register("nftData.name", {
                required: "This field is required.",
              })}
            />
            <FormErrorMessage>{errors?.nftData?.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors?.nftData?.symbol} w="auto">
            <Input
              size="lg"
              w="24"
              placeholder="SYMBL"
              {...register("nftData.symbol", {
                required: "This field is required.",
              })}
            />
            <FormErrorMessage>{errors?.nftData?.symbol?.message}</FormErrorMessage>
          </FormControl>
        </HStack>
      </Section>
      <Section title="NFTs to mint">
        <Grid
          templateColumns={{ sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
          gap="6"
          w="full"
        >
          <AnimateSharedLayout>
            <AnimatePresence>
              {Object.keys(nfts).map((id, index) => (
                <NFTCard
                  preview={previews[id]}
                  key={id}
                  id={id}
                  index={index}
                  removeNft={() => removeNft(id)}
                />
              ))}
            </AnimatePresence>
            <CardMotionWrapper>
              <UploadFile setPreviews={setPreviews} />
            </CardMotionWrapper>
          </AnimateSharedLayout>
        </Grid>
      </Section>
    </>
  )
}

export default NFTData
