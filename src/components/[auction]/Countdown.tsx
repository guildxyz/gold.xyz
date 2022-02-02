import { StatGroup } from "@chakra-ui/react"
import { Stat, StatHelpText, StatNumber } from "@chakra-ui/stat"
import { useWallet } from "@solana/wallet-adapter-react"
import { useTimer } from "react-timer-hook"
import { useCoinfettiContext } from "./CoinfettiContext"
import useCycle from "./hooks/useCycle"

type Props = {
  expiryTimestamp: number
}

const Countdown = ({ expiryTimestamp }: Props): JSX.Element => {
  const { cycle, mutate: mutateUseCycle } = useCycle()
  const { bids } = cycle ?? {}
  const { publicKey } = useWallet()
  const { triggerCoinfetti } = useCoinfettiContext()

  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
    onExpire: async () => {
      await mutateUseCycle()
      if (bids?.[0]?.bidderPubkey?.toString() !== publicKey?.toString()) return
      triggerCoinfetti()
    },
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
