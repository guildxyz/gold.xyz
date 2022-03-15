import { TwitterLogo } from "phosphor-react"

const socials = [
  {
    regEx: /^https:\/\/twitter.com\/(.*?)\/?$/i,
    type: "TWITTER",
    matchIndex: 1,
    idPrefix: "@",
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
