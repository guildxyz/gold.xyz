import { FormControl, FormErrorMessage, Input } from "@chakra-ui/react"
import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"

const NumberOfCycles = () => {
  const {
    register,
    setValue,
    trigger,
    formState: { errors, dirtyFields },
  } = useFormContext()

  const nfts = useWatch({ name: "nfts" })
  const maxSupply = useMemo(
    () => (Object.keys(nfts).length <= 1 ? undefined : Object.keys(nfts).length),
    [nfts]
  )

  useEffect(() => {
    if (!maxSupply) return
    if (!dirtyFields?.numberOfCycles) setValue("numberOfCycles", maxSupply)
    trigger("numberOfCycles")
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
            message: `Can't exceed max NFT supply (${maxSupply})`,
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
