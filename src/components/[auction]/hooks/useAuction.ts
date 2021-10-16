import { useWallet } from "@solana/wallet-adapter-react"
import getAuction from "contract-logic/getAuction"
import { useRouter } from "next/router"
import useSWR from "swr"
import { Auction } from "types"

const useAuction = (): Auction => {
  const { publicKey } = useWallet()
  const router = useRouter()

  const shouldFetch = !!publicKey

  const { data } = useSWR(shouldFetch ? ["auction"] : null, getAuction)

  return data
}

export default useAuction
