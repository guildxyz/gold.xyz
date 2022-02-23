import { FormControl, FormErrorMessage, Input } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

const StartTime = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <FormControl isInvalid={errors?.startTime}>
      <Input
        {...register("startTime", { valueAsDate: true })}
        type="datetime-local"
        placeholder="0"
        size="lg"
        maxW={{ base: "2xs", lg: "xs" }}
      />
      <FormErrorMessage>{errors?.startTime?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default StartTime
