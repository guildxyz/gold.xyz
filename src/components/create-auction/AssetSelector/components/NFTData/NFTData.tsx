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
        <FormControl isInvalid={errors?.nftName}>
          <FormLabel>Name</FormLabel>
          <Input
            {...register("nftName", {
              required: "This field is required.",
            })}
          />
          <FormErrorMessage>{errors?.nftName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors?.nftSymbol}>
          <FormLabel>Symbol</FormLabel>
          <Input
            {...register("nftSymbol", {
              required: "This field is required.",
            })}
          />
          <FormErrorMessage>{errors?.nftSymbol?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors?.nftMaxSupply}>
          <FormLabel>Max supply</FormLabel>
          <NumberInput>
            <NumberInputField
              {...register("nftMaxSupply", {
                required: "This field is required.",
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{errors?.nftMaxSupply?.message}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
    </SimpleGrid>
  )
}

export default NFTData
