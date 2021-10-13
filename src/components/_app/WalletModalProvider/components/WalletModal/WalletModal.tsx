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
import { useWallet } from "@solana/wallet-adapter-react"
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets"
import Link from "components/common/Link"
import Modal from "components/common/Modal"
import { ArrowSquareOut } from "phosphor-react"
import React, { useEffect, useState } from "react"
import ConnectorButton from "./components/ConnectorButton"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const WalletModal = ({ isOpen, onClose }: Props): JSX.Element => {
  const { wallets, select, connected, connecting, adapter } = useWallet()

  const [activatingConnector, setActivatingConnector] = useState<Wallet>()
  useEffect(() => {
    if (activatingConnector && activatingConnector.adapter() === adapter) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, adapter])

  const handleConnect = (wallet: Wallet) => {
    // setActivatingConnector(wallet)
    select(wallet.name)
    // onClose()
  }

  useEffect(() => {
    if (connected) onClose()
  }, [connected, onClose])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect to a wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Error error={error} processError={processConnectionError} /> */}
            <Stack spacing="4">
              {wallets?.map((wallet) => (
                <ConnectorButton
                  key={wallet.name}
                  wallet={wallet}
                  onClick={() => handleConnect(wallet)}
                  disabled={connecting}
                  isActive={adapter === wallet.adapter()}
                  isLoading={activatingConnector === wallet}
                />
              ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Text textAlign="center">
              New to Ethereum wallets?{" "}
              <Link
                colorScheme="blue"
                href="https://ethereum.org/en/wallets/"
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
