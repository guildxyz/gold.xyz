import { Tag, TagCloseButton, TagLabel, TagProps } from "@chakra-ui/react"
import Link from "components/common/Link"
import { ReactElement } from "react"
import useSWRImmutable from "swr/immutable"
import parseSocialLink from "utils/parseSocialLink"

type Props = {
  link: string
  id?: string
  colorScheme?: string
  Logo?: () => ReactElement
  onClose?: () => void
} & TagProps

const SocialLinkTag = ({ link, onClose, ...rest }: Props) => {
  const { data } = useSWRImmutable(
    ["socialLink", link],
    (_: string, socialLink: string) => parseSocialLink(socialLink)
  )

  const { link: parsedLink, Logo, colorScheme, id } = data ?? { id: "Loading..." }

  if (link.trim().length <= 0) return null

  return (
    <Tag
      size="lg"
      colorScheme={colorScheme ?? "primary"}
      borderRadius="full"
      {...rest}
    >
      {Logo && <Logo />}
      <TagLabel ml={Logo ? 2 : 0}>
        <Link href={parsedLink ?? ""} target="_blank">
          {id ?? parsedLink}
        </Link>
      </TagLabel>
      {onClose && <TagCloseButton onClick={onClose} />}
    </Tag>
  )
}

export default SocialLinkTag
