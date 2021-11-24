import { FormControl, Textarea } from "@chakra-ui/react"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

const Description = (): JSX.Element => {
  const { register, setValue } = useFormContext()

  useEffect(() => {
    // These are unused fields for now, but we need to set default values for them.
    setValue("description.socials", [])
    setValue("description.goalTreasuryAmount", null)
  }, [])

  return (
    <FormControl>
      <Textarea
        {...register("description.description")}
        size="lg"
        placeholder="Optional"
      />
    </FormControl>
  )
}

export default Description
