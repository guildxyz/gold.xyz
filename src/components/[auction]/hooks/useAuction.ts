import { useConnection } from "@solana/wallet-adapter-react"
import { Auction, getAuction } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import useSWR from "swr"

const useAuction = (): Auction & { largestBid: number } => {
  const { connection } = useConnection()
  const router = useRouter()

  const shouldFetch = connection

  const handleGetAuction = async (_, id) => {
    const auction = await getAuction(connection, id)
    return {
      ...auction,
      largestBid: auction?.bids?.[0]?.amount?.toNumber() ?? 0,
      // ? Math.max(...auction?.bids?.map((bid) => bid.amount))
      // : 0,
    }
  }

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
