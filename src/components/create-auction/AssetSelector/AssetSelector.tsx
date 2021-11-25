import {
  FormControl,
  FormErrorMessage,
  SimpleGrid,
  useRadioGroup,
} from "@chakra-ui/react"
import { useController, useFormContext } from "react-hook-form"
import AssetOption from "./components/AssetOption"

const options = [
  {
    value: "NFT",
    title: "NFT",
  },
  {
    value: "TOKEN",
    title: "Token",
    disabled: true,
  },
]

const AssetSelector = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const { field } = useController({
    control,
    name: "asset",
    rules: { required: "You must pick an asset type" },
    defaultValue: "NFT",
  })

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "asset",
    onChange: field.onChange,
    value: field.value,
    defaultValue: "NFT",
  })

  const group = getRootProps()

  return (
    <FormControl isRequired isInvalid={errors?.cyclePeriod}>
      <SimpleGrid
        {...group}
        columns={{ base: 1, sm: 2, md: 4 }}
        gap={{ base: 2, md: 4 }}
      >
        {options.map((option) => {
          const radio = getRadioProps({ value: option.value })
          return <AssetOption key={option.value} {...radio} {...option} />
        })}
      </SimpleGrid>
      <FormErrorMessage>{errors?.cyclePeriod?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default AssetSelector
