import { useConnection } from "@solana/wallet-adapter-react"
import { getAuction } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useSWR from "swr"

const useAuction = () => {
  const { connection } = useConnection()
  const router = useRouter()

  const handleGetAuction = async (_, id) => getAuction(connection, id)

  const { data, isValidating, error } = useSWR(
    ["auction", router.query.auction],
    handleGetAuction,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    console.log("data", data)
  }, [data])

  return { auction: data, isLoading: isValidating && !data, error }
}

export default useAuction
