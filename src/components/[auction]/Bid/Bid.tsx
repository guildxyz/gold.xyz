import {
  Button,
  HStack,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import useToast from "hooks/useToast"
import { useMemo, useRef } from "react"
import { useController, useForm } from "react-hook-form"
import useAuction from "../hooks/useAuction"
import useCycle from "../hooks/useCycle"
import usePlaceBid from "./hook/usePlaceBid"

const Bid = () => {
  const { auction } = useAuction()
  const { cycle } = useCycle()
  const { publicKey } = useWallet()
  const minBid = useMemo(
    () =>
      cycle?.bids?.[0]?.amount ? cycle?.bids?.[0]?.amount + 0.01 : auction?.minBid,
    [auction]
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
            <NumberInputField
              ref={inputRef}
              placeholder={minBid && `min: ${minBid}`}
            />
          </NumberInput>
          <InputRightElement>
            <Text colorScheme="gray" mr="4">
              SOL
            </Text>
          </InputRightElement>
        </InputGroup>

        <Tooltip
          label={auction?.isFrozen ? "Auction is frozen" : "Wallet not connected"}
          isDisabled={!!publicKey && !auction?.isFrozen}
          shouldWrapChildren
        >
          <Button
            type="submit"
            size="lg"
            flexShrink={0}
            isLoading={isLoading}
            disabled={!publicKey || auction?.isFrozen}
          >
            Place bid
          </Button>
        </Tooltip>
      </HStack>
    </form>
  )
}

export default Bid
