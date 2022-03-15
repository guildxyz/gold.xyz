import { DiscordLogo, GithubLogo, MediumLogo, TwitterLogo } from "phosphor-react"
import fetcher from "./fetcher"

const socials = [
  {
    regEx: /^(https:\/\/)?(www\.)?twitter\.com\/(.*?)\/?$/i,
    type: "TWITTER",
    matchIndex: 3,
    idPrefix: "@",
    Logo: TwitterLogo,
    colorScheme: "twitter",
  },
  {
    regEx: /^(https:\/\/)?(www\.)?discord\.(gg|com\/invite){1}\/(.*?)\/?$/i,
    type: "DISCORD",
    matchIndex: 4,
    idPrefix: "",
    Logo: DiscordLogo,
    colorScheme: "DISCORD",
    fetchId: (inviteCode: string) =>
      fetcher(`https://discord.com/api/v10/invites/${inviteCode}`).then(
        ({ guild }) => guild?.name ?? inviteCode
      ),
  },
  {
    regEx: /^(https:\/\/)?(www\.)?github\.com\/(.*?)\/?$/i,
    type: "GITHUB",
    matchIndex: 3,
    idPrefix: "",
    Logo: GithubLogo,
    colorScheme: "black",
  },
  {
    regEx: /^(https:\/\/)?(www\.)?medium\.com\/@(.*?)\/?$/i,
    type: "MEDIUM",
    matchIndex: 3,
    idPrefix: "@",
    Logo: MediumLogo,
    colorScheme: "gray",
  },
]

const parseSocialLink = async (link: string) => {
  const trimmed = link.trim()
  const matchedSocial = socials.find(({ regEx }) => regEx.test(trimmed))

  if (matchedSocial) {
    const { type, idPrefix, regEx, matchIndex, Logo, colorScheme, fetchId } =
      matchedSocial
    if (fetchId) {
      const idFromRegex = trimmed.match(regEx)[matchIndex]
      const id = await fetchId(idFromRegex)
      return { type, id, link: trimmed, Logo, colorScheme }
    }
    return {
      type,
      id: `${idPrefix}${trimmed.match(regEx)[matchIndex]}`,
      link: trimmed,
      Logo,
      colorScheme,
    }
  }

  return {
    type: "OTHER",
    link: trimmed,
  }
}

export default parseSocialLink
