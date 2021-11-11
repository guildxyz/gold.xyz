import { useConnection } from "@solana/wallet-adapter-react"
import { Auction, getAuction } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useSWR from "swr"

const useAuction = (): Auction => {
  const { connection } = useConnection()
  const router = useRouter()

  const handleGetAuction = async (_, id) => getAuction(connection, id)

  const { data } = useSWR(["auction", router.query.auction], handleGetAuction, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    console.log("data", data)
  }, [data])

  return data
}

export default useAuction
