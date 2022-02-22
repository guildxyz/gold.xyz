import {
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react"
import { useFormContext, useWatch } from "react-hook-form"

const GoalAmount = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const numberOfCycles = useWatch({ name: "numberOfCycles", exact: true })

  const isInfinite = numberOfCycles === undefined

  return (
    <FormControl isRequired isInvalid={errors?.goalTreasuryAmount}>
      <InputGroup size="lg">
        <NumberInput w="full" isDisabled={isInfinite}>
          <NumberInputField
            {...register("goalTreasuryAmount", {
              required: !isInfinite && "This field is required.",
              valueAsNumber: true,
            })}
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
      <FormErrorMessage>{errors?.goalTreasuryAmount?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default GoalAmount
