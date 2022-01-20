import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { AuctionConfig, NFTData } from "contract-logic/queries/types"
import { startAuction } from "contract-logic/transactions/startAuction"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import useUploadImage from "hooks/useUploadImage"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"

const DAY_IN_SECONDS = 86400

const useStartAuction = () => {
  const [data, setData] = useState<AuctionConfig>()
  const toast = useToast()
  const { connection } = useConnection()
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const { sendTransaction, publicKey } = useWallet()

  const handleStartAuction = async (data_: AuctionConfig) => {
    console.log(data_)
    const tx = await startAuction(data_)
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "finalized")
    console.log("success", "Transaction successful!", signature)
  }

  const { onSubmit, response, error, isLoading } = useSubmit<AuctionConfig, any>(
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
        asset: { ...data.asset, uri: imageResponse.publicUrl } as NFTData,
      })
  }, [imageResponse])

  return {
    onSubmit: (_data) => {
      // Filtering out invalid traits
      _data.nfts.forEach((nft) => {
        nft.traits = nft.traits.filter(
          ({ key, value }) => key.length > 0 && value.length > 0
        )
      })
      const finalData = {
        ..._data,
        minimumBidAmount: 0.05,
        cyclePeriod:
          (_data.cyclePeriod === "CUSTOM"
            ? _data.customCyclePeriod
            : _data.cyclePeriod) * DAY_IN_SECONDS,
        ownerPubkey: publicKey,
      }
      if (_data.asset.type === "NFT") {
        setData(finalData)
        onSubmitImage({
          folder: _data.id,
          name: _data.asset.name,
          symbol: _data.asset.symbol,
          description: "",
          nfts: _data.nfts,
        })
      } else onSubmit(finalData)
    },
    error: error || imageError,
    isImageLoading,
    isLoading,
    response,
  }
}

export default useStartAuction
