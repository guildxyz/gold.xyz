import {
  Button,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import useToast from "hooks/useToast"
import { useMemo, useRef } from "react"
import { useController, useForm } from "react-hook-form"
import useAuction from "../hooks/useAuction"
import useCycle from "../hooks/useCycle"
import usePlaceBid from "./hook/usePlaceBid"

const PlaceBid = () => {
  const { auction } = useAuction()
  const { cycle } = useCycle()
  const { publicKey } = useWallet()
  const minBid = useMemo(
    () =>
      cycle?.bids?.[0]?.amount ? cycle?.bids?.[0]?.amount + 0.01 : auction?.minBid,
    [cycle, auction]
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
  const buttonSize = useBreakpointValue({ base: "md", sm: "lg" })

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
      <Stack spacing="3" direction={{ base: "column", sm: "row" }}>
        <InputGroup size="lg">
          <NumberInput w="full" {...field}>
            <NumberInputField
              ref={inputRef}
              placeholder={minBid && `min: ${minBid.toFixed(2)}`}
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
            size={buttonSize}
            w={{ base: "full", md: "unset" }}
            flexShrink={0}
            isLoading={isLoading}
            disabled={!publicKey || auction?.isFrozen}
          >
            Place bid
          </Button>
        </Tooltip>
      </Stack>
    </form>
  )
}

export default PlaceBid
