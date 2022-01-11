import {
  FormControl,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { useEffect, useRef } from "react"
import { useFormContext } from "react-hook-form"

const CustomRound = ({ isChecked }) => {
  const { register, setValue } = useFormContext()
  const inputRef = useRef(null)
  const { ref, ...rest } = register("customCyclePeriod")

  useEffect(() => {
    if (isChecked) inputRef.current.focus()
  }, [isChecked])

  const handleClick = () => setValue("cyclePeriod", "CUSTOM")

  return (
    <FormControl>
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
          Days
        </InputRightAddon>
      </InputGroup>
    </FormControl>
  )
}

export default CustomRound
