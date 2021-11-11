import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import useAuction from "components/[auction]/hooks/useAuction"
import { placeBid } from "contract-logic/transactions/bid"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import { useSWRConfig } from "swr"

type Data = {
  amount: number
}

const usePlaceBid = (setValue) => {
  const toast = useToast()
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { connection } = useConnection()
  const { sendTransaction, publicKey } = useWallet()
  const auction = useAuction()

  const handlePlaceBid = async ({ amount }: Data) => {
    const tx = await placeBid(
      connection,
      auction.id,
      auction.ownerPubkey,
      amount,
      publicKey
    )
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "processed")
    console.log("success", "Transaction successful!", signature)
  }

  return useSubmit<Data, any>(handlePlaceBid, {
    onError: () =>
      toast({
        title: "Error placing bid",
        status: "error",
      }),
    onSuccess: (amount) => {
      toast({
        title: "Bid placed successfully",
        status: "success",
      })
      setValue("amount", "")
      const newBid = {
        amount: parseInt(amount),
        bidderPubkey: publicKey.toBase58(),
      }
      mutate(
        ["auction", router.query.auction],
        async (prevData) => ({
          ...prevData,
          bids: [newBid, ...(prevData?.bids || [])],
          largestBid: parseInt(amount),
        }),
        false
      )
    },
  })
}

export default usePlaceBid
