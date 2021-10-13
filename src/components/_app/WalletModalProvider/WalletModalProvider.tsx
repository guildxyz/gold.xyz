import {
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  Text,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets"
import Link from "components/common/Link"
import Modal from "components/common/Modal"
import { ArrowSquareOut } from "phosphor-react"
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"
import WalletModal from "./components/WalletModal"
import ConnectorButton from "./components/WalletModal/components/ConnectorButton"

const WalletModalContext = createContext({
  isOpen: false,
  onOpen: () => {},
  onClose: () => {},
})

const WalletModalProvider = ({ children }: PropsWithChildren<any>): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <WalletModalContext.Provider
      value={{
        isOpen,
        onOpen,
        onClose,
      }}
    >
      {children}
      <WalletModal
        {...{
          isOpen,
          onClose,
        }}
      />
    </WalletModalContext.Provider>
  )
}

const useWalletModal = () => useContext(WalletModalContext)

export default WalletModalProvider
export { useWalletModal }
