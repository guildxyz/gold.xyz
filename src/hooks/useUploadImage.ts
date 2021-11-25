import useSubmit from "./useSubmit"
import useToast from "./useToast"

type ImageData = {
  name: string
  symbol: string
  description: string
  nfts: Array<{
    preview: string
    traits: Array<{ key: string; value: string }>
    file: File
    name: string
  }>
  folder?: string
}

type ImageResponse = { publicUrl: string }

const uploadImage = ({
  symbol,
  description,
  nfts,
  name,
  folder = "",
}: ImageData): Promise<ImageResponse> => {
  const files = nfts.map(({ file }) => file)
  const attributes = nfts.map(({ traits }) =>
    traits.map(({ key, value }) => ({ trait_type: key, value }))
  )

  const formData = new FormData()
  files.forEach((file, i) => formData.append(i.toString(), file))
  formData.append("folder", folder)
  formData.append("name", name)
  formData.append("symbol", symbol)
  formData.append("description", description)
  formData.append("attributes", JSON.stringify(attributes))

  return fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  }).then((response) =>
    response.ok ? response.json() : Promise.reject(response.json())
  )
}

const useUploadImage = () => {
  const toast = useToast()

  return useSubmit<ImageData, ImageResponse>(uploadImage, {
    onError: (e) =>
      toast({
        title: "Error uploading image",
        description: e?.error,
        status: "error",
      }),
  })
}

export default useUploadImage
