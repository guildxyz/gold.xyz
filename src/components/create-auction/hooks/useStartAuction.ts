import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { AuctionConfig, NFTData } from "contract-logic/queries/types"
import startAuction from "contract-logic/transactions/startAuction"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import { useState } from "react"
import { useSWRConfig } from "swr"
import pinFileToIpfs from "utils/pinataUpload"

const HOUR_IN_SECONDS = 3600

export type FormData = {
  id: string
  name: string
  description?: string
  asset: NFTData
  cyclePeriod: "1" | "24" | "168" | "CUSTOM"
  customCyclePeriod?: number
  numberOfCycles: number
  nfts: {
    traits: { key: string; value: string }[]
    hash: string
    file: File
    preview: string
  }[]
}

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
      preflightCommitment: "confirmed",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "confirmed")
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
    onSubmit: async (_data: FormData) => {
      // Filtering out invalid traits
      _data.nfts.forEach((nft) => {
        nft.traits = nft.traits.filter(
          ({ key, value }) => key.length > 0 && value.length > 0
        )
      })
      const finalData = {
        ..._data,
        minBid: 0.05,
        cyclePeriod:
          (_data.cyclePeriod === "CUSTOM"
            ? _data.customCyclePeriod
            : +_data.cyclePeriod) * HOUR_IN_SECONDS,
        ownerPubkey: publicKey.toString(),
      }

      if (_data.asset.type !== "Nft") return onSubmit(finalData)

      // would be better with react-hook-form's validation but it's tricky with useFieldArray so just doing this for now
      if (!_data.nfts.length)
        return toast({
          title: "No images uploaded",
          description:
            "You have to upload at least one image that'll be minted as an NFT and auctioned",
          status: "error",
        })

      const metaDatas = _data.nfts.map((nft, index) =>
        JSON.stringify({
          // if one image is repeated, there's no #index in the end yet. Todo we'll have to upload a json for every cycle then with the incremented index in the name
          name: `${_data.asset.name} ${
            _data.nfts.length > 1 ? `#${index + 1}` : ""
          }`,
          symbol: _data.asset.symbol,
          description: _data.description,
          // saving gateway uri, because neither Phantom or Solana explorer supports the native ipfs:// uri yet
          image: `https://ipfs.io/ipfs/${nft.hash}`,
          attributes: nft.traits.map(({ key, value }) => ({
            trait_type: key,
            value,
          })),
          properties: {
            category: "image",
            files: [
              {
                uri: `https://ipfs.io/ipfs/${nft.hash}`,
                type: nft.file.type,
              },
            ],
          },
        })
      )

      if (_data.nfts.length > 1)
        metaDatas.unshift(
          JSON.stringify({
            name: `${_data.asset.name} #0`,
            symbol: _data.asset.symbol,
            description: _data.description,
          })
        )

      const { IpfsHash } = await pinFileToIpfs({
        data: metaDatas,
        fileNames: metaDatas.map((_, index) => `${_data.id}/${index}.json`),
      })

      if (!IpfsHash) {
        return toast({
          title: "IPFS upload failed",
          description: "Failed to upload metadata of the images to IPFS",
          status: "error",
        })
      }

      delete finalData.nfts
      delete finalData.customCyclePeriod

      setData(finalData)

      return onSubmit({
        ...finalData,
        asset: { ...finalData.asset, uri: `https://ipfs.io/ipfs/${IpfsHash}` },
      })
    },
    error,
    isLoading,
    response,
  }
}

export default useStartAuction
