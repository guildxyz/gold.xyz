import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { AuctionConfig } from "contract-logic/queries/getAuctions"
import { startAuction } from "contract-logic/transactions/startAuction"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import { useState } from "react"
import { useSWRConfig } from "swr"
import { ipfsUploadAll } from "utils/ipfsUpload"

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

    await connection.confirmTransaction(signature, "processed")
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

  return {
    onSubmit: async (_data) => {
      // Filtering out invalid traits
      _data.nfts.forEach((nft) => {
        nft.traits = nft.traits.filter(
          ({ key, value }) => key.length > 0 && value.length > 0
        )
      })
      const finalData = {
        ..._data,
        cyclePeriod: (_data.customCyclePeriod ?? _data.cyclePeriod) * DAY_IN_SECONDS,
        ownerPubkey: publicKey,
      }

      const metaDatas = _data.nfts.map((nft, index) =>
        JSON.stringify({
          // if one image is repeated, index is 0, otherwise it starts from 1
          name: `${_data.asset.name} #${
            _data.nfts.length === 1 ? index : index + 1
          }`,
          symbol: _data.asset.symbol,
          description: _data.description,
          image: `ipfs://${nft.hash}`,
          attributes: nft.traits.map(({ key, value }) => ({
            trait_type: key,
            value,
          })),
          properties: {
            category: "image",
            files: [
              {
                uri: `ipfs://${nft.hash}`,
                type: nft.file.type,
              },
            ],
          },
        })
      )

      const dir = await ipfsUploadAll({ data: metaDatas })

      console.log(dir.cid.toString())

      setData(finalData)

      if (_data.asset.type === "NFT")
        onSubmit({
          ...finalData,
          asset: { ...finalData.asset, uri: `ipfs://${dir.cid.toString()}/0.json` },
        })
      else onSubmit(finalData)
    },
    error,
    isLoading,
    response,
  }
}

export default useStartAuction
