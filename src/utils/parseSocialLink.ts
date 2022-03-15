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
  for (const { regEx, type, matchIndex, idPrefix } of socials) {
    if (regEx.test(trimmed)) {
      return {
        type,
        id: `${idPrefix}${trimmed.match(regEx)[matchIndex]}`,
        link: trimmed,
        Logo: TwitterLogo,
        colorScheme: "twitter",
      }
    }
  }

  return {
    type: "OTHER",
    link: trimmed,
  }
}

export default parseSocialLink
