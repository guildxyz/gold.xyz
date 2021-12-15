import {
  Checkbox,
  FormControl,
  FormErrorMessage,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"

const NumberOfCycles = () => {
  const {
    register,
    setValue,
    trigger,
    formState: { errors, dirtyFields },
  } = useFormContext()
  const [isInfinite, setIsInfinite] = useState()

  const nfts = useWatch({ name: "nfts" })
  const maxSupply = useMemo(
    () => (Object.keys(nfts).length <= 1 ? undefined : Object.keys(nfts).length),
    [nfts]
  )

  const handleChange = (e) => {
    const isChecked = e.target.checked
    setIsInfinite(isChecked)
    if (isChecked) setValue("numberOfCycles", undefined)
  }

  useEffect(() => {
    if (!maxSupply) return
    if (!dirtyFields?.numberOfCycles) setValue("numberOfCycles", maxSupply)
    trigger("numberOfCycles")
  }, [maxSupply, setValue, dirtyFields])

  return (
    <FormControl
      isInvalid={errors?.numberOfCycles}
      isRequired={!isInfinite}
      isDisabled={isInfinite}
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={{ base: 4, md: 8 }}
        alignItems={{ md: "center" }}
      >
        <Input
          {...register("numberOfCycles", {
            required: !isInfinite && "This field is required.",
            valueAsNumber: true,
            max: {
              value: maxSupply,
              message: `Can't exceed max NFT supply (${maxSupply})`,
            },
          })}
          placeholder="0"
          size="lg"
          maxW={{ base: "2xs", lg: "xs" }}
        />
        <Text colorScheme="gray" fontWeight={"bold"}>
          OR
        </Text>

        <Checkbox checked={isInfinite} onChange={handleChange}>
          Infinite auction
        </Checkbox>
      </Stack>
      <FormErrorMessage>{errors?.numberOfCycles?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default NumberOfCycles
