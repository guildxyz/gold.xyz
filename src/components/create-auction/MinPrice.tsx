import {
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
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
            // borderRightRadius="0"
            placeholder="0"
          />
          {/* <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper> */}
        </NumberInput>
        <InputRightElement>
          <Text colorScheme="gray" mr="4">
            SOL
          </Text>
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{errors?.minPrice?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default MinPrice
