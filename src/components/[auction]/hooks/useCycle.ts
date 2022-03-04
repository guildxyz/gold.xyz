import { getAuctionCycle } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import useSWR from "swr"
import useAuction from "./useAuction"

/**
 * Casting auctionPubkey from PublicKey to string to PublicKey again, because the
 * PublicKey object's reference is not stable so SWR can't rely on it
 */

const handleGetCycle = (_, auctionPubkey: string, cycleNumber: number) =>
  getAuctionCycle(auctionPubkey, cycleNumber).then((data) => ({
    ...data,
    endTimestamp: data.endTimestamp * 1000,
  }))

const useCycle = (forceCurrentCycle?: boolean) => {
  const router = useRouter()
  const { auction } = useAuction()

  const cycleNumber = forceCurrentCycle
    ? auction?.currentCycle
    : parseInt(router.query.cycleNumber as string) || auction?.currentCycle

  const shouldFetch = auction?.rootStatePubkey && cycleNumber

  const { data, isValidating, error, mutate } = useSWR(
    shouldFetch ? ["cycle", auction.rootStatePubkey.toString(), cycleNumber] : null,
    handleGetCycle,
    {
      onSuccess: (cycle) => console.log("cycle", { cycleNumber, ...cycle }),
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
