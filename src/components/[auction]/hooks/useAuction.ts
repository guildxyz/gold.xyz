import { getAuction } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useSWR from "swr"

const handleGetAuction = (_, id: string) => getAuction(id)

const useAuction = () => {
  const router = useRouter()

  const { data, isValidating, error, mutate } = useSWR(
    ["auction", router.query.auction],
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
