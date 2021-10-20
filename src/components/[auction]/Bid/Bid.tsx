import {
  Button,
  HStack,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useMemo, useRef } from "react"
import { useController, useForm } from "react-hook-form"
import { useSWRConfig } from "swr"
import useAuction from "../hooks/useAuction"

type Data = {
  amount: number
}

const placeBid = ({ amount }: Data) => Promise.resolve(amount)

const Bid = () => {
  const data = useAuction()
  const minBid = useMemo(
    () => (data?.largestBid ? data?.largestBid + 1 : data?.minBid),
    [data]
  )
  const { mutate } = useSWRConfig()
  const { publicKey } = useWallet()
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
        value: minBid,
        message: `Minimum bid price is ${minBid} SOL`,
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
    onSuccess: (amount) => {
      toast({
        title: "Bid placed successfully",
        status: "success",
      })
      setValue("amount", "")
      const newBid = { amount: parseInt(amount), userPubKey: publicKey.toBase58() }
      mutate(
        "auction",
        async (prevData) => ({
          ...prevData,
          bids: [newBid, ...prevData?.bids],
          largestBid: parseInt(amount),
        }),
        false
      )
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
