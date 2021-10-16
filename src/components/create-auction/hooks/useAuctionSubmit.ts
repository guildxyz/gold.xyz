import startAuction from "contract-logic/startAuction"
import useSubmit from "hooks/useSubmit"
import { useEffect, useState } from "react"
import { AuctionBody } from "types"

const DAY_IN_SECONDS = 86400

type ImageResponse = { publicUrl: string }

const fetchImage = (data): Promise<ImageResponse> =>
  fetch("/api/upload-image", {
    method: "POST",
    body: data,
  }).then((response) => response.json())

const useAuctionSubmit = () => {
  const [data, setData] = useState<AuctionBody>()

  const { onSubmit, response, error, isLoading } = useSubmit<AuctionBody, any>(
    startAuction
  )

  const {
    onSubmit: onSubmitImage,
    response: imageResponse,
    error: imageError,
    isLoading: isImageLoading,
  } = useSubmit<FileList, ImageResponse>((_: FileList) => {
    const formData = new FormData()
    formData.append("nftImage", _[0])
    return fetchImage(formData)
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
