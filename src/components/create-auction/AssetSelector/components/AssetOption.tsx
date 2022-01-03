import { Box, Button, Tooltip, useColorMode, useRadio } from "@chakra-ui/react"
import CustomRound from "components/create-auction/RoundSelector/components/CustomRound"
import { useFormContext } from "react-hook-form"

const AssetOption = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  const { value, icon, title, disabled = false, isChecked } = props

  const {
    register,
    formState: { errors },
  } = useFormContext()

  const { colorMode } = useColorMode()

  if (value === "CUSTOM")
    return (
      <Box as="label" {...checkbox}>
        <input {...input} />
        <CustomRound isChecked={isChecked} />
      </Box>
    )

  if (disabled)
    return (
      <Tooltip label="Coming soon" shouldWrapChildren>
        <Button
          as="label"
          boxShadow="none !important"
          w="full"
          h="12"
          disabled={disabled}
        >
          {title}
        </Button>
      </Tooltip>
    )

  return (
    <Button
      as="label"
      {...checkbox}
      boxShadow="none !important"
      h="12"
      colorScheme={isChecked ? "indigo" : "gray"}
      bgColor={colorMode === "light" && !isChecked ? "white" : undefined}
      _active={isChecked ? { bg: null } : undefined}
      _hover={isChecked ? { bg: null } : undefined}
      cursor="pointer"
      disabled={disabled}
    >
      <input {...input} />
      {title}
    </Button>
  )
}

export default AssetOption
