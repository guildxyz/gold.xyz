import { Stat, StatHelpText, StatNumber } from "@chakra-ui/stat"
import { useTimer } from "react-timer-hook"

const Countdown = ({ expiryTimestamp }) => {
  const { seconds, minutes, hours } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
  })

  return (
    <>
      <Stat>
        <StatNumber>{hours}</StatNumber>
        <StatHelpText>Hours</StatHelpText>
      </Stat>
      <Stat>
        <StatNumber>{minutes}</StatNumber>
        <StatHelpText>Minutes</StatHelpText>
      </Stat>
      <Stat>
        <StatNumber>{seconds}</StatNumber>
        <StatHelpText>Seconds</StatHelpText>
      </Stat>
    </>
  )
}

export default Countdown
