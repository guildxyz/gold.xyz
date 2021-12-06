import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
} from "@chakra-ui/react"
import UploadFile from "components/create-auction/UploadFile"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

const NFTData = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  useEffect(() => {
    register("asset.type", { value: "NFT" })
  }, [])

  return (
    <SimpleGrid px="5" py="4" spacing="6" columns={{ base: 1, md: 2 }}>
      <UploadFile />
      <SimpleGrid columns={{ base: 1 }} spacing="8" w="full">
        <FormControl isInvalid={errors?.asset?.name}>
          <FormLabel>Name</FormLabel>
          <Input
            {...register("asset.name", {
              required: "This field is required.",
            })}
          />
          <FormErrorMessage>{errors?.asset?.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors?.asset?.symbol}>
          <FormLabel>Symbol</FormLabel>
          <Input
            {...register("asset.symbol", {
              required: "This field is required.",
            })}
          />
          <FormErrorMessage>{errors?.asset?.symbol?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors?.asset?.maxSupply}>
          <FormLabel>Max supply</FormLabel>
          <NumberInput>
            <NumberInputField
              {...register("asset.maxSupply", {
                required: "This field is required.",
              })}
            />
            {/* <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper> */}
          </NumberInput>
          <FormErrorMessage>{errors?.asset?.maxSupply?.message}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
    </SimpleGrid>
  )
}

export default NFTData
