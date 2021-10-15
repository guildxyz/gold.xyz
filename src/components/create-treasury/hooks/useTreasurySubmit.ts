import useSubmit from "hooks/useSubmit"
import { useEffect, useState } from "react"

const fetchImage = (data) =>
  fetch("/api/upload-image", {
    method: "POST",
    headers: { "content-type": "multipart/form-data" },
    body: data,
  }).then((response) => response)

const useTreasurySubmit = () => {
  const [data, setData] = useState()
  const { onSubmit, response, error, isLoading } = useSubmit((_) => {
    console.log("submitting", _)
    return Promise.resolve(_)
  })
  const {
    onSubmit: onSubmitImage,
    response: imageResponse,
    error: imageError,
    isLoading: isImageLoading,
  } = useSubmit((_: FileList) => {
    console.log("submitting image", _[0])
    const formData = new FormData()
    formData.append("nftImage", _[0])
    return fetchImage(formData)
  })

  useEffect(() => {
    if (imageResponse) onSubmit(data)
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

export default useTreasurySubmit
