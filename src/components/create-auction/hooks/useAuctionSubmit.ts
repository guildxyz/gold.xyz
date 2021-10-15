import useSubmit from "hooks/useSubmit"
import { useEffect, useState } from "react"

type ImageResponse = { publicUrl: string } | Response

const fetchImage = (data): Promise<ImageResponse> =>
  fetch("/api/upload-image", {
    method: "POST",
    body: data,
  }).then((response) => response.json())

const useAuctionSubmit = () => {
  const [data, setData] = useState({})

  const { onSubmit, response, error, isLoading } = useSubmit((_) => {
    console.log("submitting", _)
    return Promise.resolve(_)
  })

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
    if (imageResponse) onSubmit({ ...data, ...imageResponse })
  }, [imageResponse])

  return {
    onSubmit: (_data) => {
      setData(_data)
      onSubmitImage(_data.nftImage)
    },
    error: error || imageError,
    isImageLoading,
    isLoading,
    response,
  }
}

export default useAuctionSubmit
