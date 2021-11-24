import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
} from "@chakra-ui/react"
import UploadFile from "components/create-auction/UploadFile"
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
      <SimpleGrid px="5" py="4" spacing="6" columns={{ base: 1, md: 2 }}>
        <UploadFile addNft={append} />
        <SimpleGrid columns={{ base: 1 }} spacing="8" w="full">
          <FormControl isInvalid={errors?.nftData?.name}>
            <FormLabel>Name</FormLabel>
            <Input
              {...register("nftData.name", {
                required: "This field is required.",
              })}
            />
            <FormErrorMessage>{errors?.nftData?.name?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors?.nftData?.symbol}>
            <FormLabel>Symbol</FormLabel>
            <Input
              {...register("nftData.symbol", {
                required: "This field is required.",
              })}
            />
            <FormErrorMessage>{errors?.nftData?.symbol?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors?.nftData?.maxSupply}>
            <FormLabel>Max supply</FormLabel>
            <NumberInput>
              <NumberInputField
                {...register("nftData.maxSupply", {
                  required: "This field is required.",
                })}
              />
              {/* <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper> */}
            </NumberInput>
            <FormErrorMessage>
              {errors?.nftData?.maxSupply?.message}
            </FormErrorMessage>
          </FormControl>
        </SimpleGrid>
      </SimpleGrid>
      <Grid templateColumns="repeat(3, 1fr)">
        {fields.map((field, index) => (
          <NFTCard key={field.id} index={index} removeNft={() => remove(index)} />
        ))}
      </Grid>
    </>
  )
}

export default NFTData
