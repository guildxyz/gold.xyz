import { HStack, Text, useDisclosure } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import Identicon from "components/common/Identicon"
import { useWalletModal } from "components/_app/WalletModalProvider"
import { SignIn } from "phosphor-react"
import shortenHex from "utils/shortenHex"
import AccountButton from "./components/AccountButton"
import AccountModal from "./components/AccountModal"

const Account = (): JSX.Element => {
  const { publicKey } = useWallet()
  const { onOpen: openWalletModal } = useWalletModal()
  const {
    isOpen: isAccountModalOpen,
    onOpen: onAccountModalOpen,
    onClose: onAccountModalClose,
  } = useDisclosure()

  if (typeof window === "undefined") {
    return <AccountButton isLoading>Connect to a wallet</AccountButton>
  }

  if (!publicKey) {
    return (
      <AccountButton leftIcon={<SignIn />} onClick={openWalletModal}>
        Connect to a wallet
      </AccountButton>
    )
  }
  return (
    <>
      <AccountButton onClick={onAccountModalOpen}>
        <HStack spacing={3}>
          <Text as="span" fontSize="md" fontWeight="semibold">
            {shortenHex(publicKey.toBase58(), 3)}
          </Text>
          <Identicon address={publicKey.toBase58()} size={20} />
        </HStack>
      </AccountButton>

      <AccountModal isOpen={isAccountModalOpen} onClose={onAccountModalClose} />
    </>
  )
}

export default Account
