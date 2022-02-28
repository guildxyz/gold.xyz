import {
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { useEffect, useRef } from "react"
import { useFormContext, useFormState } from "react-hook-form"

const CustomRound = ({ isChecked }) => {
  const { register, setValue, clearErrors } = useFormContext()
  const { errors } = useFormState()
  const inputRef = useRef(null)
  const { ref, ...rest } = register("customCyclePeriod", {
    required: isChecked && "This field is required",
  })

  useEffect(() => {
    if (isChecked) inputRef.current.focus()
    if (!isChecked) clearErrors("customCyclePeriod")
  }, [isChecked])

  const handleClick = () => setValue("cyclePeriod", "CUSTOM")

  return (
    <FormControl isInvalid={!!errors.customCyclePeriod?.message}>
      <InputGroup>
        <NumberInput w="full">
          <NumberInputField
            {...rest}
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
            onClick={handleClick}
            h="12"
            borderRadius="xl"
            borderRightRadius="0"
            placeholder="Custom"
            borderColor={isChecked ? "indigo.500" : undefined}
            _hover={isChecked ? { borderColor: "indigo.400" } : undefined}
            tabIndex={-1}
          />
        </NumberInput>
        <InputRightAddon
          borderRightRadius="xl"
          h="12"
          bg={isChecked ? "indigo.500" : "var(--chakra-colors-whiteAlpha-200)"}
        >
          Hours
        </InputRightAddon>
      </InputGroup>
      <FormErrorMessage>{errors.customCyclePeriod?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default CustomRound
