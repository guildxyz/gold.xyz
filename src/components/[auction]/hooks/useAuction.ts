import { useWallet } from "@solana/wallet-adapter-react"
import getAuction from "contract-logic/getAuction"
import { useRouter } from "next/router"
import useSWR from "swr"
import { Auction } from "types"

const handleGetAuction = async (_, name) => {
  const auction = await getAuction(name)
  return {
    ...auction,
    largestBid: auction?.bids?.length
      ? Math.max(...auction?.bids?.map((bid) => bid.bidAmount))
      : 0,
  }
}

const useAuction = (): Auction & { largestBid: number } => {
  const { publicKey } = useWallet()
  const router = useRouter()

  const { data } = useSWR(["auction", router.query.auction], handleGetAuction, {
    revalidateOnFocus: false,
  })

  return data
}

export default useAuction
