import {
  Button,
  HStack,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRef } from "react"
import { useController, useForm } from "react-hook-form"
import { useSWRConfig } from "swr"
import useBids from "../hooks/useBids"

type Data = {
  amount: number
}

const placeBid = ({ amount }: Data) => Promise.resolve(console.log(amount))

const Bid = () => {
  const { largestBid } = useBids()
  const { mutate } = useSWRConfig()
  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm()
  const { field } = useController({
    name: "amount",
    control,
    rules: {
      required: "Please set your bid's price",
      min: {
        value: largestBid + 1,
        message: `Minimum bid price is ${largestBid + 1} SOL`,
      },
    },
  })
  const inputRef = useRef(null)
  const toast = useToast()
  const { isLoading, onSubmit } = useSubmit<Data, any>(placeBid, {
    onError: () =>
      toast({
        title: "Error placing bid",
        status: "error",
      }),
    onSuccess: () => {
      toast({
        title: "Bid successfully placed",
        status: "success",
      })
      setValue("amount", "")
      mutate("bids")
    },
  })

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
            <NumberInputField
              ref={inputRef}
              placeholder={(largestBid + 1).toString()}
            />
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
