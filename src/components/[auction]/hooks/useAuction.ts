import { useWallet } from "@solana/wallet-adapter-react"
import useSWR from "swr"
import { Auction } from "types"

const fetchAuction = (_, address: string) => ({
  name: "test",
  id: "test",
})

const useAuction = (): Auction => {
  const { publicKey } = useWallet()

  const shouldFetch = !!publicKey

  const { data } = useSWR(shouldFetch ? ["auction", publicKey] : null, fetchAuction)

  return data
}

export default useAuction
