import { FormControl, FormErrorMessage, Grid, HStack, Input } from "@chakra-ui/react"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import Section from "components/common/Section"
import UploadFile from "components/create-auction/UploadFile"
import { AnimatePresence, AnimateSharedLayout } from "framer-motion"
import { useFieldArray, useFormContext } from "react-hook-form"
import NFTCard from "./components/NFTCard"

const NFTData = () => {
  const { fields, append, remove } = useFieldArray({ name: "nfts" })
  const {
    register,
    formState: { errors },
  } = useFormContext()

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
              {fields.map((field, index) => (
                <NFTCard
                  key={field.id}
                  index={index}
                  removeNft={() => remove(index)}
                />
              ))}
            </AnimatePresence>
            <CardMotionWrapper>
              <UploadFile addNft={append} />
            </CardMotionWrapper>
          </AnimateSharedLayout>
        </Grid>
      </Section>
    </>
  )
}

export default NFTData
