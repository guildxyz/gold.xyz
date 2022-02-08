import { PublicKey } from "@solana/web3.js"
import { getAuctionCycle } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useSWR from "swr"
import useAuction from "./useAuction"

/**
 * Casting auctionPubkey from PublicKey to string to PublicKey again, because the
 * PublicKey object's reference is not stable so SWR can't rely on it
 */

const handleGetCycle = (_, auctionPubkey: string, cycleNumber: number) =>
  getAuctionCycle(new PublicKey(auctionPubkey), cycleNumber)

const useCycle = () => {
  const router = useRouter()
  const { auction } = useAuction()

  const cycleNumber =
    parseInt(router.query.cycleNumber as string) || auction?.currentCycle

  const shouldFetch = auction?.rootStatePubkey && cycleNumber

  const { data, isValidating, error, mutate } = useSWR(
    shouldFetch ? ["cycle", auction.rootStatePubkey.toString(), cycleNumber] : null,
    handleGetCycle,
    {
      refreshInterval: 5000,
    }
  )

  useEffect(() => {
    console.log("cycle", data)
  }, [data])

  return {
    cycle: { cycleNumber, ...data },
    isLoading: isValidating && !data,
    error,
    mutate,
  }
}

export default useCycle
