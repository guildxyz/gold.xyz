import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import {
  getLedgerWallet,
  getPhantomWallet,
  Wallet,
} from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { FC, useMemo, useState } from "react"
import WalletModalProvider from "../WalletModalProvider"

const WalletConnectionProvider: FC = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
  // Only the wallets you configure here will be compiled into your application
  const wallets = useMemo(() => [getPhantomWallet(), getLedgerWallet()], [])

  const [error, setError] = useState<WalletError>()
  const [activeWallet, setActiveWallet] = useState<Wallet>()

  const onError = (_error: WalletError) => {
    setError(_error)
    setActiveWallet(null)
  }
  const removeError = () => setError(null)

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider
          {...{ error, removeError, activeWallet, setActiveWallet }}
        >
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletConnectionProvider
