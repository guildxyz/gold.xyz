import { useWallet } from "@solana/wallet-adapter-react"
import useSWR from "swr"
import { Auction } from "types"

const getAuctions = (_, address: string) => [
  {
    id: "871632352348723",
    name: "test",
  },
  {
    id: "9716343487237821",
    name: "test2",
  },
]

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
