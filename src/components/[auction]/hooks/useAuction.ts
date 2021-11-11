import { useConnection } from "@solana/wallet-adapter-react"
import { Auction, getAuction } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import useSWR from "swr"

const useAuction = (): Auction => {
  const { connection } = useConnection()
  const router = useRouter()

  const shouldFetch = connection

  const handleGetAuction = async (_, id) => getAuction(connection, id)

  const { data } = useSWR(
    shouldFetch ? ["auction", router.query.auction] : null,
    handleGetAuction,
    {
      revalidateOnFocus: false,
    }
  )

  return data
}

export default useAuction
