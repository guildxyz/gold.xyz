import startAuction from "contract-logic/startAuction"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useEffect, useState } from "react"
import { AuctionBody } from "types"

const DAY_IN_SECONDS = 86400

type ImageResponse = { publicUrl: string }

const uploadImage = (data: FileList): Promise<ImageResponse> => {
  const formData = new FormData()
  formData.append("nftImage", data[0])

  return fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  }).then((response) => response.json())
}

const useAuctionSubmit = () => {
  const [data, setData] = useState<AuctionBody>()
  const toast = useToast()

  const { onSubmit, response, error, isLoading } = useSubmit<AuctionBody, any>(
    startAuction,
    {
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
  } = useSubmit<FileList, ImageResponse>(uploadImage, {
    onError: (e) =>
      toast({
        title: "Error uploading image",
        description: e.toString(),
        status: "error",
      }),
  })

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
      })
      onSubmitImage(_data.nftImage)
    },
    error: error || imageError,
    isImageLoading,
    isLoading,
    response,
  }
}

export default useAuctionSubmit
