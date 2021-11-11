import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Auction } from "contract-logic/queries/getAuctions"
import { startAuction } from "contract-logic/transactions/startAuction"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import useUploadImage from "hooks/useUploadImage"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"

const DAY_IN_SECONDS = 86400

const useStartAuction = () => {
  const [data, setData] = useState<Auction>()
  const toast = useToast()
  const { connection } = useConnection()
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const { sendTransaction, publicKey } = useWallet()

  const handleStartAuction = async (data_: Auction) => {
    console.log(data_)
    const tx = await startAuction(data_)
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "processed")
    console.log("success", "Transaction successful!", signature)
  }

  const { onSubmit, response, error, isLoading } = useSubmit<Auction, any>(
    handleStartAuction,
    {
      onSuccess: () => {
        toast({
          title: `Auction successfully started!`,
          description: "You're being redirected to it's page",
          status: "success",
        })
        mutate("auctions")
        router.push(`/${data.id}`)
      },
      onError: (e) =>
        toast({
          title: "Error creating auction",
          description: e.toString(),
          status: "error",
        }),
    }
  )

  const {
    onSubmit: onSubmitImage,
    response: imageResponse,
    error: imageError,
    isLoading: isImageLoading,
  } = useUploadImage()

  useEffect(() => {
    if (imageResponse?.publicUrl)
      onSubmit({
        ...data,
        nftData: { ...data.nftData, uri: imageResponse.publicUrl },
      })
  }, [imageResponse])

  return {
    onSubmit: (_data) => {
      setData({
        ..._data,
        cyclePeriod: (_data.customCyclePeriod ?? _data.cyclePeriod) * DAY_IN_SECONDS,
        ownerPubkey: publicKey,
      })
      onSubmitImage({ files: _data.nftImage, folder: _data.id })
    },
    error: error || imageError,
    isImageLoading,
    isLoading,
    response,
  }
}

export default useStartAuction
