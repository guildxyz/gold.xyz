import {
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

const NumberOfCycles = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <FormControl isInvalid={errors?.numberOfCycles} isRequired>
      {/* <FormLabel>Number of rounds</FormLabel> */}
      <NumberInput size="lg" maxW="sm">
        <NumberInputField
          {...register("numberOfCycles", {
            required: "This field is required.",
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
