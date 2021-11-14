import {
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

const NumberOfCycles = () => {
  const {
    register,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext()

  const maxSupply = watch("nftData.maxSupply")

  useEffect(() => {
    if (maxSupply) trigger("numberOfCycles")
  }, [maxSupply])

  return (
    <FormControl isInvalid={errors?.numberOfCycles} isRequired>
      {/* <FormLabel>Number of rounds</FormLabel> */}
      <NumberInput size="lg" maxW="sm">
        <NumberInputField
          {...register("numberOfCycles", {
            required: "This field is required.",
            max: {
              value: maxSupply,
              message: "Can't exceed max NFT supply",
            },
          })}
          placeholder="0"
        />
        {/* <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper> */}
      </NumberInput>
      <FormErrorMessage>{errors?.numberOfCycles?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default NumberOfCycles
