import { StatGroup } from "@chakra-ui/react"
import { Stat, StatHelpText, StatNumber } from "@chakra-ui/stat"
import { useTimer } from "react-timer-hook"

type Props = {
  expiryTimestamp: number
  onExpire?: () => void
}

const Countdown = ({ expiryTimestamp, onExpire }: Props): JSX.Element => {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
    onExpire,
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
          <StatNumber>{seconds}</StatNumber>
          <StatHelpText mb="0">Seconds</StatHelpText>
        </Stat>
      )}
    </StatGroup>
  )
}

export default Countdown
