import { FormControl, NumberInput, NumberInputField } from "@chakra-ui/react"
import { useController } from "react-hook-form"

const MinimumBidAmount = () => {
  const { field } = useController({ name: "minBid" })

  return (
    <FormControl>
      <NumberInput w="full" size="lg" {...field}>
        <NumberInputField placeholder="Optional, default: 0.05" />
      </NumberInput>
    </FormControl>
  )
}

export default MinimumBidAmount