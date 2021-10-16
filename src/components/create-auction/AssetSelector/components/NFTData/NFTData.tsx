import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
} from "@chakra-ui/react"
import UploadFile from "components/create-auction/UploadFile"
import { useFormContext } from "react-hook-form"

const NFTData = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <SimpleGrid px="5" py="4" spacing="6" columns={{ base: 1, md: 2 }}>
      <UploadFile />
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
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{errors?.nftData?.maxSupply?.message}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
    </SimpleGrid>
  )
}

export default NFTData
