import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip,
  Wrap,
} from "@chakra-ui/react"
import SocialLinkTag from "components/common/SocialLinkTag"
import { useController, useForm, useWatch } from "react-hook-form"
import parseSocialLink from "utils/parseSocialLink"

type Props = {
  shouldRenderLabel?: boolean
}

const SocialLinks = ({ shouldRenderLabel = false }: Props) => {
  const {
    field: { onChange },
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
        onSubmit={(event) => {
          event.preventDefault()
          socialLinkForm.handleSubmit(() => {
            onChange([...socials, socialLinkInputValue.trim()])
            socialLinkForm.setValue("socialLinkInput", "")
          })(event)
        }}
      >
        <FormControl isInvalid={!!socialLinkForm.formState.errors.socialLinkInput}>
          {shouldRenderLabel && <FormLabel>Social Links</FormLabel>}
          <Wrap mb={4}>
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
            {socialLinkInputValue.length > 0 &&
              !socialLinkForm.formState.errors.socialLinkInput &&
              socials.length < 5 && (
                <SocialLinkTag
                  link={socialLinkInputValue.trim()}
                  opacity={0.2}
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  onClose={() => {}}
                />
              )}
          </Wrap>

          <InputGroup size="lg" maxW="lg">
            <Input
              {...socialLinkForm.register("socialLinkInput", {
                validate: async (v) => {
                  if (socials.length <= 0) return true
                  if (socials.includes(v.trim()))
                    return "This social link is already added"
                  const parsedValue = await parseSocialLink(v)
                  if (!!parsedValue.id) {
                    const found = await Promise.any(
                      socials.map((socialLink) =>
                        parseSocialLink(socialLink).then(
                          ({ id }) => id === parsedValue.id
                        )
                      )
                    )
                    if (found) {
                      return "This social link is already added"
                    }
                  }
                  return true
                },
              })}
              placeholder="https://twitter.com/goldxyz_"
            />
            <InputRightElement mr={2}>
              <Tooltip
                placement="right"
                label="Maximum 5 social links are allowed"
                isDisabled={socials.length < 5}
                shouldWrapChildren
              >
                <Button
                  isDisabled={socials.length >= 5}
                  size="sm"
                  type="submit"
                  onClick={socialLinkForm.handleSubmit(() => {
                    if (socialLinkInputValue.trim().length > 0) {
                      onChange([...socials, socialLinkInputValue.trim()])
                      socialLinkForm.setValue("socialLinkInput", "")
                    }
                  })}
                >
                  Add
                </Button>
              </Tooltip>
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
