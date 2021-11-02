import { useConnection } from "@solana/wallet-adapter-react"
import { Auction, getAuction } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import useSWR from "swr"

const handleGetAuction = async (_, connection, id) => {
  const auction = await getAuction(connection, id)
  return {
    ...auction,
    largestBid: auction?.bids?.[0]?.amount?.toNumber() ?? 0,
    // ? Math.max(...auction?.bids?.map((bid) => bid.amount))
    // : 0,
  }
}

const useAuction = (): Auction & { largestBid: number } => {
  const { connection } = useConnection()
  const router = useRouter()

  const shouldFetch = connection

  const { data } = useSWR(
    shouldFetch ? ["auction", connection, router.query.auction] : null,
    handleGetAuction,
    {
      revalidateOnFocus: false,
    }
  )
  // useEffect(() => {
  //   console.log("data", data)
  // }, [data])

  return data
}

export default useAuction
