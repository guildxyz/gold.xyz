import useAuction from "components/[auction]/hooks/useAuction"
import { getAuctionCycle } from "contract-logic/queries/getAuctions"
import useSWR from "swr"

const fetchCanDelete = (
  _: string,
  rootStatePubkey: string,
  auctionId: string,
  endIndex: number
) =>
  Promise.all(
    [...new Array(endIndex)].map((_, cycleNumber) =>
      getAuctionCycle(rootStatePubkey, cycleNumber + 1)
    )
  ).then((responses) => responses.every(({ endTimestamp }) => endTimestamp === 0))

const useCanDelete = () => {
  const { auction } = useAuction()
  const endIndex = auction
    ? auction.isFinished
      ? auction.currentCycle
      : auction.currentCycle - 1
    : undefined

  const shouldFetch =
    !!auction?.id && !!auction?.rootStatePubkey && typeof endIndex === "number"

  const { data, isValidating } = useSWR(
    shouldFetch
      ? ["canDelete", auction?.rootStatePubkey, auction?.id, endIndex]
      : null,
    fetchCanDelete,
    {
      refreshInterval: 5000,
    }
  )

  return {
    canDelete: data,
    isLoading: isValidating,
  }
}

export default useCanDelete
