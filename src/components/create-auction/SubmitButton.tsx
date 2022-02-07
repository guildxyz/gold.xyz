import CtaButton from "components/common/CtaButton"
import useToast from "hooks/useToast"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import useStartAuction, { FormData } from "./hooks/useStartAuction"

type Props = {
  uploadPromise: Promise<Record<string, string>>
}

const SubmitButton = ({ uploadPromise }: Props) => {
  const toast = useToast()
  const { onSubmit, isLoading, response } = useStartAuction()
  // Indicates if there is a pending upload request (if some progresses haven't completed yet)
  const [isUploading, setIsUploading] = useState<boolean>()
  // This loading state if for tracking that time, when the user pressed Summon, but some images are still uploading.
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!!uploadPromise) {
      setIsUploading(true)
      uploadPromise.finally(() => setIsUploading(false))
    }
  }, [uploadPromise, setIsUploading])

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      flexShrink={0}
      size="lg"
      isLoading={isLoading || loading}
      loadingText={isUploading ? "Uploading images" : "Loading"}
      onClick={(event) => {
        // handleSubmit just for validation here, so we don't go in "uploading images" state, and focus invalid fields after the loading
        handleSubmit(() => {
          setLoading(true)
          if (isUploading) {
            uploadPromise
              .catch(() => {
                toast({ status: "error", title: "TODO" })
                setLoading(false)
              })
              .then(() =>
                handleSubmit((data: FormData) => {
                  onSubmit(data).finally(() => setLoading(false))
                })(event)
              )
          } else {
            handleSubmit((data: FormData) => {
              onSubmit(data).finally(() => setLoading(false))
            })(event)
          }
        })(event)
      }}
    >
      {response ? "Success" : "Summon"}
    </CtaButton>
  )
}

export default SubmitButton
