import { useDisclosure } from "@chakra-ui/react"
import { WalletError } from "@solana/wallet-adapter-base"
import { Wallet } from "@solana/wallet-adapter-wallets"
import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
} from "react"
import WalletModal from "./components/WalletModal"

type Props = {
  error: WalletError
  removeError: () => void
  activeWallet: Wallet
  setActiveWallet: Dispatch<SetStateAction<Wallet>>
}

const WalletModalContext = createContext({
  isOpen: false,
  onOpen: null,
  onClose: null,
})

const WalletModalProvider = ({
  removeError,
  error,
  activeWallet,
  setActiveWallet,
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
          activeWallet,
          setActiveWallet,
        }}
      />
    </WalletModalContext.Provider>
  )
}

const useWalletModal = () => useContext(WalletModalContext)

export default WalletModalProvider
export { useWalletModal }
