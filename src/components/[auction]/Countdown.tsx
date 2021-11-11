import { useTimer } from "react-timer-hook"

const Countdown = ({ expiryTimestamp }) => {
  const { seconds, minutes, hours } = useTimer({
    expiryTimestamp: new Date(expiryTimestamp),
  })

  return <>{`${hours}:${minutes}:${seconds}`}</>
}

export default Countdown
