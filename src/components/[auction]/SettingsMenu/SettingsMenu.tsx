import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { CurrencyDollarSimple, Gear, Snowflake } from "phosphor-react"
import ClaimDialog from "./components/ClaimDialog"
import FreezeDialog from "./components/FreezeDialog"

const SettingsMenu = () => {
  const {
    isOpen: isOpenClaim,
    onOpen: onOpenClaim,
    onClose: onCloseClaim,
  } = useDisclosure()
  const {
    isOpen: isOpenFreeze,
    onOpen: onOpenFreeze,
    onClose: onCloseFreeze,
  } = useDisclosure()

  return (
    <>
      <Menu placement="bottom-end">
        <MenuButton
          as={IconButton}
          aria-label="Auction settings"
          h="10"
          icon={<Icon as={Gear} />}
        />
        <MenuList border="none" shadow="md">
          <MenuItem
            py="2"
            icon={<CurrencyDollarSimple />}
            onClick={onOpenClaim}
            color="green.300"
          >
            Claim funds
          </MenuItem>
          <MenuItem
            py="2"
            icon={<Snowflake />}
            onClick={onOpenFreeze}
            color="red.300"
          >
            Freeze auction
          </MenuItem>
        </MenuList>
      </Menu>
      <ClaimDialog isOpen={isOpenClaim} onClose={onCloseClaim} />
      <FreezeDialog isOpen={isOpenFreeze} onClose={onCloseFreeze} />
    </>
  )
}

export default SettingsMenu
