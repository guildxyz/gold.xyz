import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import CopyableAddress from "components/common/CopyableAddress"
import GuildAvatar from "components/common/GuildAvatar"
import Modal from "components/common/Modal"
import { useWalletModal } from "components/_app/WalletModalProvider"

const AccountModal = ({ isOpen, onClose }) => {
  const { publicKey, wallet } = useWallet()
  const { onOpen: openWalletModal } = useWalletModal()

  const handleWalletProviderSwitch = () => {
    openWalletModal()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack direction="row" spacing="4" alignItems="center">
            <GuildAvatar address={publicKey} />
            <CopyableAddress
              address={publicKey.toString()}
              decimals={5}
              fontSize="2xl"
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Text colorScheme="gray" fontSize="sm" fontWeight="medium">
              Connected with {wallet.name}
            </Text>
            <Button size="sm" variant="outline" onClick={handleWalletProviderSwitch}>
              Switch
            </Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AccountModal
