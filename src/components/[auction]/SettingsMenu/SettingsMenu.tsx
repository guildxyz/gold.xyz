import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { CurrencyDollarSimple, Gear, TrashSimple } from "phosphor-react"
import ClaimDialog from "./components/ClaimDialog"
import DeleteDialog from "./components/DeleteDialog"

const SettingsMenu = () => {
  const {
    isOpen: isOpenClaim,
    onOpen: onOpenClaim,
    onClose: onCloseClaim,
  } = useDisclosure()
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
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
            icon={<TrashSimple />}
            onClick={onOpenDelete}
            color="red.300"
          >
            Delete auction
          </MenuItem>
        </MenuList>
      </Menu>
      <ClaimDialog isOpen={isOpenClaim} onClose={onCloseClaim} />
      <DeleteDialog isOpen={isOpenDelete} onClose={onCloseDelete} />
    </>
  )
}

export default SettingsMenu
