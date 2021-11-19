import {
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"
import { WalletError } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"
import { Wallet } from "@solana/wallet-adapter-wallets"
import { Error } from "components/common/Error"
import Link from "components/common/Link"
import Modal from "components/common/Modal"
import { ArrowSquareOut } from "phosphor-react"
import React, { Dispatch, SetStateAction, useEffect } from "react"
import ConnectorButton from "./components/ConnectorButton"
import processWalletError from "./utils/processWalletError"

type Props = {
  isOpen: boolean
  onClose: () => void
  error: WalletError
  removeError: () => void
  activeWallet: Wallet
  setActiveWallet: Dispatch<SetStateAction<Wallet>>
}

const WalletModal = ({
  isOpen,
  onClose,
  error,
  removeError,
  activeWallet,
  setActiveWallet,
}: Props): JSX.Element => {
  const { wallets, select, connected, connecting } = useWallet()

  const handleConnect = (wallet: Wallet) => {
    removeError()
    select(wallet.name)
    setActiveWallet(wallet)
  }

  useEffect(() => {
    if (connected) onClose()
  }, [connected]) // intentionally leaving onClose out

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect to a wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Error error={error} processError={processWalletError} />
            <Stack spacing="4">
              {wallets?.map((wallet) => (
                <ConnectorButton
                  key={wallet.name}
                  wallet={wallet}
                  onClick={() => handleConnect(wallet)}
                  disabled={connecting}
                  isActive={wallet === activeWallet}
                  isLoading={connecting && activeWallet === wallet}
                />
              ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Text textAlign="center">
              New to Solana wallets?{" "}
              <Link
                colorScheme="blue"
                href="https://docs.solana.com/wallet-guide"
                isExternal
              >
                Learn more
                <Icon as={ArrowSquareOut} mx="1" />
              </Link>
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default WalletModal
