import CtaButton from "components/common/CtaButton"
import useToast from "hooks/useToast"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import useStartAuction, { StartAuctionData } from "./hooks/useStartAuction"

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

  /*
  Explanation of why we need 3 loading states:
  isUploading: Indicates if there is a pending upload request (if some progresses haven't completed yet)
  isLoading: Same loading state of the machine, handling the startAuction call
  loading: This loading state if for tracking that time, when the user pressed 
           Summon, but some images are still uploading. (We only want to show loading after click,
           so we can't just use isUploading, since that one is true the whole time the request is pending,
           this one is true just from the point, the user pressed Summon)
  
  The problem with the previous implementation, which caused upload-metadata requests to fail:
    When the user pressed Summon when isUploading is true, the machine was immediately started,
    and the uploadPromise was awaited there. And while true, that the startAuction call happened after
    the upload, the problem was with the data passed by handleSubmit to the machine. It was outdated,
    didn't include the hashes, because when we pressed Summon while images were uploading, we didn't have the hashes.
    So it didn't really matter if we awaited there, since the hashes weren't available anyway (the promise returns them,
    but we don't have the field id-s there, and in the returned th ekeys of the hashes are the field id-s).
  */

  useEffect(() => {
    if (!!uploadPromise) {
      setIsUploading(true)
      uploadPromise.finally(() => setIsUploading(false))
    }
  }, [uploadPromise, setIsUploading])

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      // disabled={isLoading || isImageLoading || isSigning || response}
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
                handleSubmit((data: StartAuctionData) => {
                  onSubmit(data).finally(() => setLoading(false))
                })(event)
              )
          } else {
            handleSubmit((data: StartAuctionData) => {
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
