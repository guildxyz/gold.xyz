import {
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react"
import {
  ArrowSquareOut,
  Code,
  Info,
  TelegramLogo,
  TwitterLogo,
} from "phosphor-react"

const InfoMenu = () => {
  const { toggleColorMode } = useColorMode()

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Agora logo"
        isRound
        variant="ghost"
        h="10"
        icon={<Icon width="1.2em" height="1.2em" as={Info} />}
      />
      {/* have to set zIndex, otherwise the search bar's icon lays over it */}
      <MenuList border="none" shadow="md" zIndex="3">
        <MenuGroup
          title={
            (
              <>
                Powered by
                <Link href="https://agora.xyz" isExternal ml="1" fontWeight={"bold"}>
                  agora.xyz
                  <Icon as={ArrowSquareOut} ml="1" />
                </Link>
              </>
            ) as any
          }
          pb="2"
        >
          <MenuItem
            py="2"
            as="a"
            target="_blank"
            href="https://mirror.xyz/goldxyz.eth/WMjkMsmze4U4D9lkjISYuF4NqZNdIbjqKarjms1Goew"
            rel="noopener"
            icon={<Info />}
          >
            About
          </MenuItem>
          <MenuItem
            py="2"
            as="a"
            target="_blank"
            href="https://t.me/+QQOiku7n-K02Zjc0"
            rel="noopener"
            icon={<TelegramLogo />}
          >
            Telegram
          </MenuItem>
          <MenuItem
            py="2"
            as="a"
            target="_blank"
            href="https://twitter.com/goldxyz_"
            rel="noopener"
            icon={<TwitterLogo />}
          >
            Twitter
          </MenuItem>
          <MenuItem
            py="2"
            as="a"
            target="_blank"
            href="https://github.com/agoraxyz/gold.xyz"
            rel="noopener"
            icon={<Code />}
          >
            Code
          </MenuItem>
          {/* <MenuItem
            py="2"
            icon={<Sun />}
            closeOnSelect={false}
            onClick={toggleColorMode}
          >
            Theme
          </MenuItem> */}
        </MenuGroup>
      </MenuList>
    </Menu>
  )
}

export default InfoMenu
