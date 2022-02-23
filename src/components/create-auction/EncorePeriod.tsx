import {
  FormControl,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react"
import { useController } from "react-hook-form"

const EncorePeriod = () => {
  const { field } = useController({ name: "encorePeriod" })

  return (
    <FormControl>
      <InputGroup size="lg" maxW={{ base: "2xs", lg: "xs" }}>
        <NumberInput w="full" {...field}>
          <NumberInputField placeholder="Optional, default: 0" />
        </NumberInput>
        <InputRightElement>
          <Text colorScheme="gray" mr="4">
            hours
          </Text>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  )
}

export default EncorePeriod
