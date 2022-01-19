import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { Dispatch, SetStateAction, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

type Props = {
  fields: Record<"id", string>[]
  acceptedFiles: File[]
  setHashes: Dispatch<SetStateAction<Record<string, string>>>
  setProgresses: Dispatch<SetStateAction<Record<string, number>>>
}

const uploadImages = async (
  files: File[],
  clientId: string,
  ids: string[]
): Promise<Record<string, string>> => {
  const formData = new FormData()
  files.forEach((file, index) => formData.append(ids[index], file))

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_UPLOADER_API}/upload-file/${clientId}`,
    {
      method: "POST",
      body: formData,
    }
  )

  const body = await response.json()

  if (response.ok) return body
  else throw Error(body.message ?? "Failed to upload images")
}

const useUploadFiles = ({
  setProgresses,
  setHashes,
  acceptedFiles,
  fields,
}: Props) => {
  const toast = useToast()

  const setupEventSource = useCallback(
    (clientId: string) => {
      const source = new EventSource(
        `${process.env.NEXT_PUBLIC_UPLOADER_API}/${clientId}`
      )

      source.addEventListener("progress", (event: Event) => {
        try {
          const progressReport: Record<string, number> = JSON.parse(
            (event as Event & { data: string }).data
          )
          setProgresses((prev: Record<string, number>) => ({
            ...prev,
            ...progressReport,
          }))
        } catch (error) {
          console.error(`Failed to parse SSE "progress" event message`, error)
        }
      })

      return source
    },
    [setProgresses]
  )

  const fetcher = useCallback(async () => {
    if (acceptedFiles.length > 0) {
      const uploadProgressId = uuidv4()
      const progressEventSource = setupEventSource(uploadProgressId)

      return uploadImages(
        acceptedFiles,
        uploadProgressId,
        fields.slice(fields.length - acceptedFiles.length).map((field) => field.id)
      )
        .then((hashReport) => {
          setHashes((prev) => ({ ...prev, ...hashReport }))
          return hashReport
        })
        .finally(() => progressEventSource.close())
    }
  }, [acceptedFiles, fields, setHashes, setupEventSource])

  return useSubmit(fetcher, {
    onError: (e) => {
      toast({
        status: "error",
        title: "Upload failed",
        description: e?.message ?? "Failed to upload images",
      })
    },
  })
}

export default useUploadFiles
