import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  SimpleGrid,
  useRadioGroup,
} from "@chakra-ui/react"
import { useController, useFormContext } from "react-hook-form"
import RoundOption from "./components/RoundOption"

const options = [
  {
    value: "1",
    title: "Daily",
  },
  {
    value: "7",
    title: "Weekly",
  },
  {
    value: "30",
    title: "Monthly",
  },
  {
    value: "CUSTOM",
    title: "Custom",
  },
]

const RoundSelector = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const { field } = useController({
    control,
    name: "roundTerm",
    rules: { required: "You must pick a roundTerm for your guild requirements" },
    defaultValue: "1",
  })

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "roundTerm",
    onChange: field.onChange,
    value: field.value,
    defaultValue: "1",
  })

  const group = getRootProps()

  return (
    <FormControl isRequired isInvalid={errors?.roundTerm}>
      <FormLabel>Round term</FormLabel>
      <SimpleGrid
        {...group}
        columns={{ base: 1, sm: 2, md: 4 }}
        gap={{ base: 2, md: 4 }}
      >
        {options.map((option) => {
          const radio = getRadioProps({ value: option.value })
          return <RoundOption key={option.value} {...radio} {...option} />
        })}
        {/* <CustomRound /> */}
      </SimpleGrid>
      <FormErrorMessage>{errors?.roundTerm?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default RoundSelector
