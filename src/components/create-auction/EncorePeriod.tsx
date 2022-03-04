import {
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react"
import { useMemo } from "react"
import { useController, useFormState, useWatch } from "react-hook-form"

const HOUR_IN_SECONDS = 3600

const EncorePeriod = () => {
  const customCyclePeriod = useWatch({ name: "customCyclePeriod" })
  const cyclePeriod = useWatch({ name: "cyclePeriod" })

  const cyclePeriodSeconds = useMemo(
    () =>
      (cyclePeriod === "CUSTOM" ? customCyclePeriod : +cyclePeriod) *
      HOUR_IN_SECONDS,
    [customCyclePeriod, cyclePeriod]
  )

  const { field } = useController({
    name: "encorePeriod",
    rules: {
      validate: (value: string) => {
        if (value === "") return true
        if (+value <= 0) return "Encore period should be positive"
        if (+value * 60 > cyclePeriodSeconds / 2)
          return `Encore period has to be at most ${cyclePeriodSeconds / 2 / 60}`
        return true
      },
    },
  })

  const { errors } = useFormState()

  return (
    <FormControl isInvalid={!!errors.encorePeriod}>
      <InputGroup size="lg">
        <NumberInput w="full" {...field}>
          <NumberInputField placeholder="Optional, default: 0" min={0} />
        </NumberInput>
        <InputRightElement>
          <Text colorScheme="gray" mr="8">
            minutes
          </Text>
        </InputRightElement>
      </InputGroup>

      <FormErrorMessage>{errors.encorePeriod?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default EncorePeriod