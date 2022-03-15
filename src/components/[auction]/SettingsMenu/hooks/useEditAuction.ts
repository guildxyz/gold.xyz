import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import useAuction from "components/[auction]/hooks/useAuction"
import modifyAuction from "contract-logic/transactions/modifyAuction"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"

type FormData = {
  encorePeriod: string
  description: string
  socials: string[]
}

const useEditAuction = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { auction, mutate: mutateAuction } = useAuction()
  const toast = useToast()

  const handleEditAuction = async (data_: FormData) => {
    console.log(data_)
    const tx = await modifyAuction(publicKey.toString(), auction?.id, {
      ...data_,
      encorePeriod: +data_.encorePeriod * 60,
    })
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "confirmed")
    console.log("success", "Transaction successful!", signature)
  }

  const { isLoading, onSubmit } = useSubmit(handleEditAuction, {
    onSuccess: () => {
      toast({
        title: "Auction successfully edited!",
        status: "success",
      })
      mutateAuction()
    },
    onError: (e) =>
      toast({
        title: "Error editing auction",
        description: e.toString(),
        status: "error",
      }),
  })

  return { isLoading, onSubmit }
}

export default useEditAuction
