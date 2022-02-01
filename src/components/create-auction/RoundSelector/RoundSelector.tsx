import {
  FormControl,
  FormErrorMessage,
  SimpleGrid,
  useRadioGroup,
} from "@chakra-ui/react"
import { useController, useFormContext } from "react-hook-form"
import RoundOption from "./components/RoundOption"

const options = [
  {
    value: "1",
    title: "Hourly",
  },
  {
    value: "24",
    title: "Daily",
  },
  {
    value: "168",
    title: "Weekly",
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
    name: "cyclePeriod",
    rules: { required: "You must pick a cyclePeriod" },
    defaultValue: "1",
  })

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "cyclePeriod",
    onChange: field.onChange,
    value: field.value,
    defaultValue: "86400",
  })

  const group = getRootProps()

  return (
    <FormControl isRequired isInvalid={errors?.cyclePeriod}>
      {/* <FormLabel>Round term</FormLabel> */}
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
      <FormErrorMessage>{errors?.cyclePeriod?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default RoundSelector
