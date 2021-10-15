import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/router"
import useSWR from "swr"
import { Bid } from "types"

type Response = {
  bids: Bid[]
  largestBid: number
}

const tempData = [
  {
    amount: 17,
    userPubKey: "0x78DEdBc6fBAC04bDa1080B4fC69D2385Cf526F77",
  },
  {
    amount: 12,
    userPubKey: "0x9450fE40322A1269e6db6BE4AB5CCF5d4D93761c",
  },
]

const getBids = (_, auctionId: number, cycleNumber: number): Response => ({
  bids: tempData,
  largestBid: Math.max(...tempData.map((bid) => bid.amount)),
})

const useBids = (): Response => {
  const { publicKey } = useWallet()
  const router = useRouter()

  const shouldFetch = !!publicKey

  const { data } = useSWR(
    shouldFetch ? ["bids", router.query.auction, router.query.cycle] : null,
    getBids,
    { fallbackData: { bids: [], largestBid: null } }
  )

  return data
}

export default useBids
