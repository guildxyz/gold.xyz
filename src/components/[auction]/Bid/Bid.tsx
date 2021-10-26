import {
  Button,
  HStack,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react"
import useToast from "hooks/useToast"
import { useMemo, useRef } from "react"
import { useController, useForm } from "react-hook-form"
import useAuction from "../hooks/useAuction"
import usePlaceBid from "./hook/usePlaceBid"

const Bid = () => {
  const data = useAuction()
  const minBid = useMemo(
    () => (data?.largestBid ? data?.largestBid + 1 : data?.minBid),
    [data]
  )
  const toast = useToast()
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm()
  const { field } = useController({
    name: "amount",
    control,
    rules: {
      required: "Please set your bid's price",
      min: {
        value: minBid,
        message: `Minimum bid price is ${minBid} SOL`,
      },
    },
  })
  const inputRef = useRef(null)
  const { onSubmit, isLoading } = usePlaceBid(setValue)

  const onError = () => {
    if (errors?.amount?.message)
      toast({
        title: errors?.amount?.message,
        status: "error",
      })
    // needed because react-hook-form would focus NumberInput but we should NumberInputField
    inputRef?.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <HStack spacing="3">
        <InputGroup size="lg">
          <NumberInput w="full" {...field}>
            <NumberInputField ref={inputRef} placeholder={`min: ${minBid}`} />
          </NumberInput>
          <InputRightElement>
            <Text colorScheme="gray" mr="4">
              SOL
            </Text>
          </InputRightElement>
        </InputGroup>

        <Button type="submit" size="lg" flexShrink={0} isLoading={isLoading}>
          Place bid
        </Button>
      </HStack>
    </form>
  )
}

export default Bid
