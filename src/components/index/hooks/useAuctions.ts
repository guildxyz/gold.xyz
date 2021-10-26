import { useWallet } from "@solana/wallet-adapter-react"
import getAuctions from "contract-logic/getAuctions"
import useSWR from "swr"
import { Auction } from "types"

const useAuctions = (): Auction[] => {
  const { publicKey } = useWallet()

  const shouldFetch = !!publicKey

  const { data } = useSWR(
    shouldFetch ? ["auctions", publicKey] : null,
    getAuctions,
    {
      refreshInterval: 10000,
    }
  )

  return data
}

export default useAuctions
