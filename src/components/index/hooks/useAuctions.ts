import { useConnection } from "@solana/wallet-adapter-react"
import { AuctionBase, getAuctions } from "contract-logic/queries/getAuctions"
import useSWR from "swr"

const useAuctions = (): AuctionBase[] => {
  const { connection } = useConnection()

  const handleGetAuctions = () => getAuctions(connection)

  const { data } = useSWR("auctions", handleGetAuctions)

  return data
}

export default useAuctions
