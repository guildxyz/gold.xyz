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

const CycleEndAlert = () => {
  const { mutate: mutateAuction } = useAuction()
  const { cycle, mutate: mutateCycle, isValidating } = useCycle()
  const { bids, endTimestamp } = cycle ?? {}

  const { seconds } = useTimer({
    expiryTimestamp: new Date(endTimestamp + 8_000),
    onExpire: () => mutateAuction(),
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
        {bids?.length === 0
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
            onClick={() => mutateCycle() && mutateAuction()}
          />
        </Tooltip>
      </AlertDescription>
    </Alert>
  )
}

export default CycleEndAlert
