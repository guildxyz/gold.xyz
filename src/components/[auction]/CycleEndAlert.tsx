import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@chakra-ui/react"
import { useTimer } from "react-timer-hook"
import useAuction from "./hooks/useAuction"

type Props = {
  nextCycleStartTimestamp: number
  setTimerExpired: (value: boolean) => void
  bidsLength: number
}

const CycleEndAlert = ({
  nextCycleStartTimestamp,
  setTimerExpired,
  bidsLength,
}: Props) => {
  const { mutate: mutateAuction } = useAuction()
  const { seconds } = useTimer({
    expiryTimestamp: new Date(nextCycleStartTimestamp),
    onExpire: () => mutateAuction().finally(() => setTimerExpired(false)),
  })

  return (
    <Alert status="info">
      <AlertIcon />
      <AlertTitle fontSize="lg">Auction cycle ended</AlertTitle>
      <AlertDescription maxWidth="sm">
        {bidsLength === 0
          ? `Cycle restarts in ${seconds}s`
          : `Next cycle starts in ${seconds}s`}
      </AlertDescription>
    </Alert>
  )
}

export default CycleEndAlert
