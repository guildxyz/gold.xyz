import { FormControl, FormErrorMessage, HStack, Input } from "@chakra-ui/react"
import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import slugify from "utils/slugify"

const NameAndIcon = () => {
  const {
    register,
    formState: { errors, dirtyFields },
    setValue,
  } = useFormContext()

  const name = useWatch({ name: "name" })

  useEffect(() => {
    if (name) setValue("id", slugify(name))
  }, [name])

  return (
    <FormControl isRequired isInvalid={errors?.name}>
      <HStack spacing={2}>
        {/* <IconSelector /> */}
        <Input
          size="lg"
          {...register("name", {
            required: "This field is required.",
            maxLength: {
              value: 50,
              message: "The maximum possible name length is 50 characters",
            },
            validate: (input) =>
              input?.trim() !== "404" || 'Name "404" is not allowed.',
            onBlur: ({ target: { value } }) => {
              if (!dirtyFields?.asset?.name) {
                setValue("asset.name", value, { shouldValidate: true })
              }
            },
          })}
        />
      </HStack>
      <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
    </FormControl>
  )
}

export default NameAndIcon
