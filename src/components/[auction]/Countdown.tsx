import { StatGroup, Text } from "@chakra-ui/react"
import { Stat, StatHelpText, StatNumber } from "@chakra-ui/stat"
import { useTimer } from "react-timer-hook"

const Countdown = ({ expiryTimestamp, simple = false }) => {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
  })

  if (simple)
    return (
      <Text as="span">
        {!!days || !!hours || !!minutes || !!seconds
          ? `${days > 0 ? `${days}d ` : ""} ${hours > 0 ? `${hours}h ` : ""} ${
              minutes > 0 ? `${minutes}m ` : ""
            } ${seconds}s left`
          : "Ended!"}
      </Text>
    )

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
