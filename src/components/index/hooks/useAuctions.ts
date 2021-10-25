import { useWallet } from "@solana/wallet-adapter-react"
import getAuctions from "contract-logic/getAuctions"
import useSWR from "swr"
import { Auction } from "types"

const handleGetAuctions = async () => {
  const AuctionMap = await getAuctions()
  return Array.from(AuctionMap.pool.entries()).map((auction: any) => ({
    [auction[0]]: auction[1],
  })) as any
}

const useAuctions = (): Auction[] => {
  const { publicKey } = useWallet()

  const shouldFetch = !!publicKey

  const { data } = useSWR(
    shouldFetch ? ["auctions", publicKey] : null,
    handleGetAuctions,
    {
      refreshInterval: 10000,
    }
  )

  return data?.map((obj) => ({ name: Object.keys(obj)[0] }))
}

export default useAuctions
