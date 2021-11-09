import useSubmit from "./useSubmit"
import useToast from "./useToast"

type ImageData = {
  files: FileList
  folder?: string
}

type ImageResponse = { publicUrl: string }

const uploadImage = ({ files, folder = "" }: ImageData): Promise<ImageResponse> => {
  const formData = new FormData()
  formData.append("nftImage", files[0])
  formData.append("folder", folder)

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
