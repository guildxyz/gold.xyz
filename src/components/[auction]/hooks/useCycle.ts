import { PublicKey } from "@solana/web3.js"
import { getAuctionCycle } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import useSWR from "swr"
import useAuction from "./useAuction"

const handleGetCycle = (_, auctionPubkey: PublicKey, cycleNumber: number) =>
  getAuctionCycle(auctionPubkey, cycleNumber)

const useCycle = () => {
  const router = useRouter()
  const { auction } = useAuction()

  const cycleNumber =
    parseInt(router.query.cycleNumber as string) || auction?.currentCycle

  const shouldFetch = auction?.rootStatePubkey && cycleNumber

  const { data, isValidating, error, mutate } = useSWR(
    shouldFetch ? ["cycle", auction.rootStatePubkey, cycleNumber] : null,
    handleGetCycle,
    {
      onSuccess: (cycle) => console.log("cycle", cycle),
      refreshInterval: 5000,
    }
  )

  return {
    cycle: { cycleNumber, ...data },
    isLoading: isValidating && !data,
    isValidating,
    error,
    mutate,
  }
}

export default useCycle
