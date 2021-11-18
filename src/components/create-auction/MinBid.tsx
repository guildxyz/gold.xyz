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

const MinBid = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <FormControl isInvalid={errors?.minBid} isDisabled>
      <InputGroup size="lg" maxW="sm">
        <NumberInput w="full">
          <NumberInputField
            {...register("minBid", {
              // required: "This field is required.",
            })}
            // borderRightRadius="0"
            placeholder="0.00001"
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
      <FormErrorMessage>{errors?.minBid?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default MinBid
