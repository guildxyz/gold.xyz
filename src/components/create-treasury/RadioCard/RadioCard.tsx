import {
  FormControl,
  FormErrorMessage,
  StackDivider,
  useColorMode,
  useRadioGroup,
  VStack,
} from "@chakra-ui/react"
import { useController, useFormContext } from "react-hook-form"
import RadioOption from "./components/RadioOption"

const RadioCard = ({ options, name }) => {
  const { colorMode } = useColorMode()
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const { field } = useController({
    control,
    name,
    rules: { required: "You must pick a realm for your guild" },
  })

  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    onChange: field.onChange,
    value: field.value,
  })

  const group = getRootProps()

  return (
    <FormControl isRequired isInvalid={errors?.[name]}>
      <VStack
        {...group}
        borderRadius="xl"
        bg={colorMode === "light" ? "white" : "blackAlpha.300"}
        spacing="0"
        border="1px"
        borderColor={colorMode === "light" ? "blackAlpha.300" : "whiteAlpha.300"}
        divider={<StackDivider />}
      >
        {options.map((option) => {
          const radio = getRadioProps({ value: option.value })
          return <RadioOption key={option.value} {...radio} {...option} />
        })}
      </VStack>

      <FormErrorMessage>{errors?.[name]?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default RadioCard
