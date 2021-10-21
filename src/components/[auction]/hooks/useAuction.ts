import { useWallet } from "@solana/wallet-adapter-react"
import getAuction from "contract-logic/getAuction"
import { useRouter } from "next/router"
import useSWR from "swr"
import { Auction } from "types"

const useAuction = (): Auction & { largestBid: number } => {
  const { publicKey } = useWallet()
  const router = useRouter()

  const { data } = useSWR(["auction", router.query.auction], getAuction, {
    revalidateOnFocus: false,
  })

  return { ...data, largestBid: Math.max(data?.bids?.map((bid) => bid.amount)) }
}

export default useAuction
