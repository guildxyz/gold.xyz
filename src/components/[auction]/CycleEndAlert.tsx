import {
  Alert,
  AlertDescription,
  AlertIcon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react"
import { ArrowClockwise } from "phosphor-react"
import { useTimer } from "react-timer-hook"
import useAuction from "./hooks/useAuction"
import useCycle from "./hooks/useCycle"

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
  const { mutate: mutateCycle, isValidating } = useCycle()
  const { seconds } = useTimer({
    expiryTimestamp: new Date(nextCycleStartTimestamp),
    onExpire: () => mutateAuction().finally(() => setTimerExpired(false)),
  })

  return (
    <Alert status="info" alignItems="center">
      <AlertIcon />
      <AlertDescription
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
      >
        {bidsLength === 0
          ? `Cycle restarts in ${seconds}s`
          : `Next cycle starts in ${seconds}s`}

        {bidsLength !== 0 && (
          <Tooltip label="Refresh winning bid">
            <IconButton
              variant="ghost"
              borderRadius="full"
              isLoading={isValidating}
              icon={<ArrowClockwise />}
              aria-label="Reload bids"
              onClick={() => mutateCycle()}
            />
          </Tooltip>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default CycleEndAlert
