import { Box, Button, useColorMode, useRadio } from "@chakra-ui/react"
import CustomRound from "components/create-treasury/RoundSelector/components/CustomRound"
import { useFormContext } from "react-hook-form"

const RoundOption = (props) => {
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
    >
      <input {...input} />
      {title}
    </Button>
  )
}

export default RoundOption
