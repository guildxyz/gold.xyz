import { getAuctions } from "contract-logic/queries/getAuctions"
import useSWR from "swr"

const useAuctions = (secondaryPool?: boolean) => {
  const handleGetAuctions = () => getAuctions(secondaryPool)

  const { data, isValidating, error } = useSWR(
    `auctions${secondaryPool ? "_inactive" : ""}`,
    handleGetAuctions
  )

  return {
    auctions: data,
    isLoading: !data && isValidating,
    error,
  }
}

export default useAuctions
