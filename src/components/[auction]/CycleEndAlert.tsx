import {
  Alert,
  AlertDescription,
  AlertIcon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { ArrowClockwise } from "phosphor-react"
import { useTimer } from "react-timer-hook"
import useAuction from "./hooks/useAuction"
import useCycle from "./hooks/useCycle"

const CycleEndAlert = () => {
  const { mutate: mutateAuction } = useAuction()
  const router = useRouter()
  const { cycle, mutate: mutateCycle, isValidating } = useCycle()
  const { bids, endTimestamp } = cycle ?? {}
  const willRestart = bids?.length === 0

  const fetchNextCycle = async () => {
    const { currentCycle } = await mutateAuction()
    if (!router.query.cycleNumber || willRestart) return
    if (currentCycle == (router.query.cycleNumber as any)) return
    router.push(`/${router.query.auction}/${cycle?.cycleNumber + 1}`)
  }

  const { seconds } = useTimer({
    expiryTimestamp: new Date(endTimestamp + 12_000),
    onExpire: fetchNextCycle,
  })

  return (
    <Alert status="info" alignItems="center">
      <AlertIcon mb="3px" />
      <AlertDescription
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
      >
        {willRestart
          ? `Cycle restarts in ${seconds}s`
          : `Next cycle starts in ${seconds}s`}

        <Tooltip label="Refresh">
          <IconButton
            variant="ghost"
            h="10"
            borderRadius="full"
            isLoading={isValidating}
            icon={<ArrowClockwise />}
            aria-label="Refresh"
            onClick={() => {
              // fetch bids if the cycle is still in intermediate state
              mutateCycle()
              fetchNextCycle()
            }}
          />
        </Tooltip>
      </AlertDescription>
    </Alert>
  )
}

export default CycleEndAlert
