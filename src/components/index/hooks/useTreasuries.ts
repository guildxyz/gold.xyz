import { useWallet } from "@solana/wallet-adapter-react"
import useSWR from "swr"
import { Treasury } from "types"

const fetchTreasuries = (_, address: string) => [
  {
    name: "test",
    urlName: "test",
  },
  {
    name: "test2",
    urlName: "test2",
  },
]

const useTreasuries = (): Treasury[] => {
  const { publicKey } = useWallet()

  const shouldFetch = !!publicKey

  const { data } = useSWR(
    shouldFetch ? ["treasuries", publicKey] : null,
    fetchTreasuries,
    {
      refreshInterval: 10000,
    }
  )

  return data
}

export default useTreasuries
