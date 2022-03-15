import { GithubLogo, MediumLogo, TwitterLogo } from "phosphor-react"

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

const parseSocialLink = (link: string) => {
  const trimmed = link.trim()
  const matchedSocial = socials.find(({ regEx }) => regEx.test(trimmed))

  if (matchedSocial) {
    const { type, idPrefix, regEx, matchIndex, Logo, colorScheme } = matchedSocial
    return {
      type: type,
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
