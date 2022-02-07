import { StatGroup } from "@chakra-ui/react"
import { Stat, StatHelpText, StatNumber } from "@chakra-ui/stat"
import { useTimer } from "react-timer-hook"
import useAuction from "./hooks/useAuction"

type Props = {
  expiryTimestamp: number
  onExpire?: () => void
  setTimerExpired: (value: boolean) => void
  timerExpired: boolean
}

const Countdown = ({
  expiryTimestamp,
  onExpire,
  setTimerExpired,
  timerExpired,
}: Props): JSX.Element => {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
    onExpire,
  })

  const { mutate: mutateAuction } = useAuction()

  const nextCycleStart = useTimer({
    expiryTimestamp: new Date(expiryTimestamp + 15_000),
    onExpire: () => mutateAuction().finally(() => setTimerExpired(false)),
  })

  return (
    <StatGroup sx={{ gap: "6px" }}>
      {!!days && (
        <Stat>
          <StatNumber>{days}</StatNumber>
          <StatHelpText mb="0">Days</StatHelpText>
        </Stat>
      )}
      <Stat>
        <StatNumber>{hours}</StatNumber>
        <StatHelpText mb="0">Hours</StatHelpText>
      </Stat>
      <Stat>
        <StatNumber>{minutes}</StatNumber>
        <StatHelpText mb="0">Minutes</StatHelpText>
      </Stat>
      {!days && (
        <Stat>
          <StatNumber>{timerExpired ? nextCycleStart.seconds : seconds}</StatNumber>
          <StatHelpText mb="0">Seconds</StatHelpText>
        </Stat>
      )}
    </StatGroup>
  )
}

export default Countdown
