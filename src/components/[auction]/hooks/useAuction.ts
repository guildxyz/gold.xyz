import { useConnection } from "@solana/wallet-adapter-react"
import { getAuction } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useSWR from "swr"

const useAuction = () => {
  const router = useRouter()

  const handleGetAuction = async (_, id: string, cycleNumber: string) => {
    if (!cycleNumber) return getAuction(id)
    return getAuction(id, parseInt(cycleNumber))
  }

  const { data, isValidating, error, mutate } = useSWR(
    ["auction", router.query.auction, router.query.cycleNumber?.[0]],
    handleGetAuction,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    console.log("data", data)
  }, [data])

  return {
    auction: data,
    isLoading: isValidating && !data,
    error,
    mutate,
  }
}

export default useAuction
