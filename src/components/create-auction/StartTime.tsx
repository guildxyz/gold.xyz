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
        size="lg"
      />
      <FormErrorMessage>{errors?.startTime?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default StartTime
