import {
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

const NumberOfRounds = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <FormControl isInvalid={errors?.numberOfRounds} isRequired>
      {/* <FormLabel>Number of rounds</FormLabel> */}
      <NumberInput size="lg" maxW="sm">
        <NumberInputField
          {...register("numberOfRounds", {
            required: "This field is required.",
          })}
          placeholder="0"
        />
        {/* <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper> */}
      </NumberInput>
      <FormErrorMessage>{errors?.numberOfRounds?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default NumberOfRounds