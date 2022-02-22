import {
  Checkbox,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Question } from "phosphor-react"
import { useEffect, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"

const NumberOfCycles = () => {
  const {
    register,
    setValue,
    trigger,
    formState: { errors, touchedFields },
  } = useFormContext()
  const [isInfinite, setIsInfinite] = useState()
  const [lastUserInput, setLastUserInput] = useState<number | "">("")

  const nfts = useWatch({ name: "nfts" })
  const maxSupply = useMemo(
    () => (Object.keys(nfts).length <= 1 ? undefined : Object.keys(nfts).length),
    [nfts]
  )
  const numberOfCycles = useWatch({ name: "numberOfCycles", exact: true })

  const handleChange = (e) => {
    const isChecked = e.target.checked
    setIsInfinite(isChecked)
    if (isChecked) {
      setLastUserInput(Number.isNaN(numberOfCycles) ? "" : numberOfCycles)
      setValue("numberOfCycles", undefined)
      setTimeout(() => {
        trigger("numberOfCycles")
      }, 100)
    } else {
      setValue("numberOfCycles", lastUserInput, { shouldValidate: true })
    }
  }

  useEffect(() => {
    if (!maxSupply) return
    if (!touchedFields?.numberOfCycles) setValue("numberOfCycles", maxSupply)
    trigger("numberOfCycles")
  }, [maxSupply, setValue, touchedFields])

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
            min: {
              value: 1,
              message: "There must be at least one round",
            },
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
          <HStack>
            <span>Infinite auction</span>
            <Tooltip
              label="You can upload more NFT images gradually, and delete the auction if you want it to end. If it runs out of set NFTs, it'll auction ones with just the incremented index as their data."
              shouldWrapChildren
            >
              <Question />
            </Tooltip>
          </HStack>
        </Checkbox>
      </Stack>
      <FormErrorMessage>{errors?.numberOfCycles?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default NumberOfCycles
