import { useWallet } from "@solana/wallet-adapter-react"
import useSWR from "swr"
import { Treasury } from "types"

const fetchTreasury = (_, address: string) => ({
  name: "test",
  urlName: "test",
})

const useTreasury = (): Treasury => {
  const { publicKey } = useWallet()

  const shouldFetch = !!publicKey

  const { data } = useSWR(
    shouldFetch ? ["treasury", publicKey] : null,
    fetchTreasury
  )

  return data
}

export default useTreasury
