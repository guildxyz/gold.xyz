import { useWallet } from "@solana/wallet-adapter-react"
import { AuctionBase } from "contract-logic/queries/getAuctions"
import useSWR from "swr"
import useAuctions from "./useAuctions"

const handleGetAuctions = (_, auctions, publicKey) =>
  auctions.filter(
    (auction) => auction.ownerPubkey.toString() === publicKey.toString()
  )

const useUsersAuctions = (): AuctionBase[] => {
  const { auctions } = useAuctions()
  const { publicKey } = useWallet()

  const shouldFetch = auctions?.length && publicKey

  const { data } = useSWR(
    shouldFetch ? ["usersAuctions", auctions, publicKey] : null,
    handleGetAuctions
  )

  return data
}

export default useUsersAuctions
