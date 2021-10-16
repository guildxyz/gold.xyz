import { useWallet } from "@solana/wallet-adapter-react"
import useSWR from "swr"
import { Auction } from "types"

const getAuctions = (_, address: string): Auction[] => [
  {
    id: "0",
    name: "First auction",
    cyclePeriod: 64800,
    minBid: 300,
    numberOfCycles: 10,
    startTimestamp: 1634262267169,
    nftData: {
      name: "First NFT",
      symbol: "SYMB",
      uri: "storageapi.fleek.co/608ac2f5-df51-4e35-a363-1afacc7db6d3-bucket/dovalid_agora.png",
    },
  },
  // {
  //   id: "9716343487237821",
  //   name: "test2",
  //   cyclePeriod: 1,
  //   minBid: 300,
  //   numberOfCycles: 10,
  //   startTimestamp: 1634262267169,
  //   nftData: {
  //     name: "Dsa NFT",
  //     symbol: "DSA",
  //     uri: "storageapi.fleek.co/608ac2f5-df51-4e35-a363-1afacc7db6d3-bucket/dovalid_agora.png",
  //   },
  // },
]

const useAuctions = (): Auction[] => {
  const { publicKey } = useWallet()

  const shouldFetch = !!publicKey

  const { data } = useSWR(
    shouldFetch ? ["auctions", publicKey] : null,
    getAuctions,
    {
      refreshInterval: 10000,
    }
  )

  return data
}

export default useAuctions
