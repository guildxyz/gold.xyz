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
  const { handleSubmit, setValue, control } = useForm()
  const { field } = useController({
    name: "amount",
    control,
    rules: { validate: (value) => !!value, min: largestBid + 1 },
  })
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <HStack spacing="3">
        <InputGroup size="lg">
          <NumberInput w="full" {...field}>
            <NumberInputField placeholder={(largestBid + 1).toString()} />
          </NumberInput>
          <InputRightElement>
            <Text colorScheme="gray" mr="4">
              SOL
            </Text>
          </InputRightElement>
        </InputGroup>
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          loadingText="Waiting confirmation"
        >
          Place bid
        </Button>
      </HStack>
    </form>
  )
}

export default Bid
