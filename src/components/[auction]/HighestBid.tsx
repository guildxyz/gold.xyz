import { StatHelpText, StatNumber } from "@chakra-ui/stat"
import useSWR from "swr"

type Props = {
  amount: number
}

const HighestBid = ({ amount }: Props) => {
  const { data: solPrice } = useSWR("api/sol-price")

  if (!amount)
    return (
      <>
        <StatNumber>-</StatNumber>
        <StatHelpText opacity="0">-</StatHelpText>
      </>
    )

  return (
    <>
      <StatNumber>{`${amount} SOL`}</StatNumber>
      <StatHelpText>{`$ ${solPrice * amount}`}</StatHelpText>
    </>
  )
}

export default HighestBid
