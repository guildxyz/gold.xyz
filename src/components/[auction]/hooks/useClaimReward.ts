import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import useCycle from "components/[auction]/hooks/useCycle"
import { Cycle } from "contract-logic/queries/types"
import claimRewards from "contract-logic/transactions/claimRewards"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"

type Data = {
  cycle: Cycle & { cycleNumber: number }
  auctionId: string
  tokenType: "Nft" | "Token"
}

const useClaimReward = () => {
  const toast = useToast()
  const { connection } = useConnection()
  const { sendTransaction, publicKey } = useWallet()
  const { mutate: mutateCycle } = useCycle()

  const handleClaimReward = async ({ cycle, auctionId, tokenType }: Data) => {
    const tx = await claimRewards(
      publicKey.toString(),
      cycle.bids[0].bidderPubkey.toString(),
      auctionId,
      cycle.cycleNumber,
      tokenType
    )
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "processed",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "confirmed")
    console.log("success", "Transaction successful!", signature)
  }

  return useSubmit<Data, any>(handleClaimReward, {
    onError: () =>
      toast({
        title: "Error claiming reward",
        status: "error",
      }),
    onSuccess: () => {
      toast({
        title: "Reward claimed successfully",
        status: "success",
      })
      mutateCycle()
    },
  })
}

export default useClaimReward
