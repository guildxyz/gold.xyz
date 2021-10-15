import {
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

const MinPrice = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <FormControl isInvalid={errors?.minPrice} isRequired>
      <InputGroup size="lg" maxW="sm">
        <NumberInput w="full">
          <NumberInputField
            {...register("minPrice", {
              required: "This field is required.",
            })}
            borderRightRadius="0"
            placeholder="0"
          />
          {/* <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper> */}
        </NumberInput>
        <InputRightAddon>SOL</InputRightAddon>
      </InputGroup>
      <FormErrorMessage>{errors?.minPrice?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default MinPrice
