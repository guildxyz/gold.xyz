import { PublicKey } from "@solana/web3.js"
import { getAuctionCycle } from "contract-logic/queries/getAuctions"
import { useRouter } from "next/router"
import { useEffect } from "react"
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
    shouldFetch ? ["auction", auction.rootStatePubkey, cycleNumber] : null,
    handleGetCycle
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
