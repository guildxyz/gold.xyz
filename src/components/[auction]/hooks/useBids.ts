import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/router"
import useSWR from "swr/immutable"
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
  {
    amount: 7,
    userPubKey: "0x901E5B96e52ec4504E374b17195F29bf7A22D1Bc",
  },
  {
    amount: 5,
    userPubKey: "0x9450fE40322A1269e6db6BE4AB5CCF5d4D93761c",
  },
]

const getBids = (_): Response => ({
  bids: tempData,
  largestBid: Math.max(...tempData.map((bid) => bid.amount)),
})

const useBids = (): Response => {
  const { publicKey } = useWallet()
  const router = useRouter()

  const shouldFetch = true

  const { data } = useSWR(shouldFetch ? "bids" : null, getBids, {
    fallbackData: { bids: [], largestBid: null },
  })

  return data
}

export default useBids
