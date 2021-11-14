import { StatHelpText, StatNumber } from "@chakra-ui/stat"
import useSWR from "swr"
import fetcher from "utils/fetcher"

type Props = {
  amount: number
}

const fetchPrice = (endpoint) => fetcher(endpoint).then((res) => res?.solana?.usd)

const HighestBid = ({ amount }: Props) => {
  const { data: solPrice } = useSWR(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    fetchPrice,
    { dedupingInterval: 10000 }
  )

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
      <StatHelpText>{`$ ${(solPrice * amount).toFixed(1)}`}</StatHelpText>
    </>
  )
}

export default HighestBid
