import { StatGroup, useBreakpointValue } from "@chakra-ui/react"
import { Stat, StatHelpText, StatNumber } from "@chakra-ui/stat"
import { useEffect } from "react"
import { useTimer } from "react-timer-hook"

type Props = {
  expiryTimestamp: number
  onExpire?: () => void
}

const Countdown = ({ expiryTimestamp, onExpire }: Props): JSX.Element => {
  const { seconds, minutes, hours, days, isRunning, restart } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
    onExpire,
  })
  const statSize = useBreakpointValue({ base: "sm", md: "md", xl: "lg" })

  useEffect(() => {
    if (!isRunning) restart(new Date(expiryTimestamp))
  }, [expiryTimestamp, restart, isRunning])

  return (
    <StatGroup sx={{ gap: "6px" }}>
      {!!days && (
        <Stat size={statSize}>
          <StatNumber>{days}</StatNumber>
          <StatHelpText mb="0">Days</StatHelpText>
        </Stat>
      )}
      <Stat size={statSize}>
        <StatNumber>{hours}</StatNumber>
        <StatHelpText mb="0">Hours</StatHelpText>
      </Stat>
      <Stat size={statSize}>
        <StatNumber>{minutes}</StatNumber>
        <StatHelpText mb="0">Minutes</StatHelpText>
      </Stat>
      {!days && (
        <Stat size={statSize}>
          <StatNumber>{seconds}</StatNumber>
          <StatHelpText mb="0">Seconds</StatHelpText>
        </Stat>
      )}
    </StatGroup>
  )
}

export default Countdown
