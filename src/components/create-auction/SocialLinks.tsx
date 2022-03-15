import {
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import SocialLinkTag from "components/common/SocialLinkTag"
import { useController, useForm, useWatch } from "react-hook-form"

const SocialLinks = () => {
  const {
    field: { onBlur, onChange, value, ref },
  } = useController({ name: "socials" })
  const socials = useWatch({ name: "socials" })

  const socialLinkForm = useForm({
    mode: "all",
    defaultValues: { socialLinkInput: "" },
  })

  const socialLinkInputValue = useWatch({
    name: "socialLinkInput",
    control: socialLinkForm.control,
  })

  return (
    <>
      <HStack>
        {socials.map((link: string) => (
          <SocialLinkTag
            link={link}
            key={link}
            onClose={() =>
              onChange(
                socials.filter((socialLink) => socialLink.trim() !== link.trim())
              )
            }
          />
        ))}
      </HStack>
      {/*<Textarea
        onBlur={onBlur}
        value={value?.join("\n") || ""}
        onChange={({ target: { value: inputValue } }) =>
          onChange(inputValue.split("\n").map((_) => _.trim()))
        }
        ref={ref}
        placeholder="Optional"
      />*/}
      <form
        onSubmit={socialLinkForm.handleSubmit(() => {
          onChange([...socials, socialLinkInputValue.trim()])
          socialLinkForm.setValue("socialLinkInput", "")
        })}
      >
        <FormControl isInvalid={!!socialLinkForm.formState.errors.socialLinkInput}>
          <InputGroup size="lg" maxW="lg">
            <Input
              {...socialLinkForm.register("socialLinkInput", {
                validate: (v) => {
                  if (socials.includes(v.trim()))
                    return "This social link is already added"
                  return true
                },
              })}
              placeholder="https://twitter.com/goldxyz_"
            />
            <InputRightElement mr={2}>
              <Button size="sm" type="submit">
                Add
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>
            {socialLinkForm.formState.errors.socialLinkInput?.message}
          </FormErrorMessage>
        </FormControl>
      </form>
    </>
  )
}

export default SocialLinks
