import { useConnection } from "@solana/wallet-adapter-react"
import { AuctionBase, getAuctions } from "contract-logic/queries/getAuctions"
import useSWR from "swr"

const handleGetAuctions = (_, connection) => getAuctions(connection)

const useAuctions = (): AuctionBase[] => {
  const { connection } = useConnection()

  const shouldFetch = connection

  const { data } = useSWR(
    shouldFetch ? ["auctions", connection] : null,
    handleGetAuctions,
    {
      refreshInterval: 10000,
    }
  )

  return data
}

export default useAuctions
