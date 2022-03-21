import { useDisclosure } from "@chakra-ui/react"
import { WalletError } from "@solana/wallet-adapter-base"
import React, { createContext, PropsWithChildren, useContext } from "react"
import WalletModal from "./components/WalletModal"

type Props = {
  error: WalletError
  removeError: () => void
}

const WalletModalContext = createContext({
  isOpen: false,
  onOpen: null,
  onClose: null,
})

const WalletModalProvider = ({
  removeError,
  error,
  children,
}: PropsWithChildren<Props>): JSX.Element => {
  const { isOpen, onOpen, onClose: onCloseInitial } = useDisclosure()

  const onClose = () => {
    removeError()
    onCloseInitial()
  }

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
          error,
          removeError,
        }}
      />
    </WalletModalContext.Provider>
  )
}

const useWalletModal = () => useContext(WalletModalContext)

export default WalletModalProvider
export { useWalletModal }
