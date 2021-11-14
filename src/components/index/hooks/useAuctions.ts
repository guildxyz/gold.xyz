import { useConnection } from "@solana/wallet-adapter-react"
import { getAuctions } from "contract-logic/queries/getAuctions"
import useSWR from "swr"

const useAuctions = () => {
  const { connection } = useConnection()

  const handleGetAuctions = () => getAuctions(connection)

  const { data, isValidating } = useSWR("auctions", handleGetAuctions)

  return { auctions: data, isLoading: !data && isValidating }
}

export default useAuctions
