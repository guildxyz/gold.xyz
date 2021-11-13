import { StatGroup } from "@chakra-ui/react"
import { Stat, StatHelpText, StatNumber } from "@chakra-ui/stat"
import { useTimer } from "react-timer-hook"

const Countdown = ({ expiryTimestamp }) => {
  const { seconds, minutes, hours } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
  })

  return (
    <StatGroup>
      <Stat>
        <StatNumber>{hours}</StatNumber>
        <StatHelpText mb="0">Hours</StatHelpText>
      </Stat>
      <Stat>
        <StatNumber>{minutes}</StatNumber>
        <StatHelpText mb="0">Minutes</StatHelpText>
      </Stat>
      <Stat>
        <StatNumber>{seconds}</StatNumber>
        <StatHelpText mb="0">Seconds</StatHelpText>
      </Stat>
    </StatGroup>
  )
}

export default Countdown
