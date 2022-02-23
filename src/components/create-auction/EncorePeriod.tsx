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
      <InputGroup size="lg">
        <NumberInput w="full" {...field}>
          <NumberInputField placeholder="Optional, default: 0" />
        </NumberInput>
        <InputRightElement>
          <Text colorScheme="gray" mr="8">
            minutes
          </Text>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  )
}

export default EncorePeriod
