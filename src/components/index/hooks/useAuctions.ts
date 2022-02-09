import { useConnection } from "@solana/wallet-adapter-react"
import { getAuctions } from "contract-logic/queries/getAuctions"
import useSWR from "swr"

const useAuctions = (secondaryPool?: boolean) => {
  const { connection } = useConnection()

  const handleGetAuctions = () => getAuctions(connection, secondaryPool)

  const { data, isValidating } = useSWR(
    `auctions${secondaryPool ? "_inactive" : ""}`,
    handleGetAuctions
  )

  return { auctions: data, isLoading: !data && isValidating }
}

export default useAuctions
