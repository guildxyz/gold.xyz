import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/router"
import useSWR from "swr"
import { Auction } from "types"

const getAuction = (_, id: number): Auction => ({
  id: "871632352348723",
  name: "test",
  cyclePeriod: 1,
  minBid: 300,
  numberOfCycles: 10,
  startTimestamp: 1634262267169,
  nftData: {
    name: "Asd NFT",
    symbol: "ASD",
    uri: "https://storageapi.fleek.co/608ac2f5-df51-4e35-a363-1afacc7db6d3-bucket/dovalid_agora.png",
  },
})

const useAuction = (): Auction => {
  const { publicKey } = useWallet()
  const router = useRouter()

  const shouldFetch = !!publicKey

  const { data } = useSWR(
    shouldFetch ? ["auction", router.query.auction] : null,
    getAuction
  )

  return data
}

export default useAuction
