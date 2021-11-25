import { FormControl, FormErrorMessage, Input } from "@chakra-ui/react"
import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"

const NumberOfCycles = () => {
  const {
    register,
    setValue,
    formState: { errors, dirtyFields },
  } = useFormContext()

  const nfts = useWatch({ name: "nfts", defaultValue: [] })
  const maxSupply = useMemo(() => nfts?.length ?? 0, [nfts])

  useEffect(() => {
    if (!dirtyFields?.numberOfCycles) setValue("numberOfCycles", maxSupply)
  }, [maxSupply, setValue, dirtyFields])

  return (
    <FormControl isInvalid={errors?.numberOfCycles} isRequired>
      {/* <FormLabel>Number of rounds</FormLabel> */}
      <Input
        {...register("numberOfCycles", {
          required: "This field is required.",
          valueAsNumber: true,
          max: {
            value: maxSupply,
            message: "Can't exceed max NFT supply",
          },
        })}
        size="lg"
        maxW="sm"
        placeholder="0"
        type="number"
      />
      {/* <NumberInput size="lg" maxW="sm">
        <NumberInputField
          {...register("numberOfCycles", {
            required: "This field is required.",
            valueAsNumber: true,
            max: {
              value: maxSupply,
              message: "Can't exceed max NFT supply",
            },
          })}
          placeholder="0"
        /> */}
      {/* <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper> */}
      {/* </NumberInput> */}
      <FormErrorMessage>{errors?.numberOfCycles?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default NumberOfCycles
