import CtaButton from "components/common/CtaButton"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import useStartAuction, { StartAuctionData } from "./hooks/useStartAuction"

type Props = {
  uploadPromise: Promise<Record<string, string>>
}

const SubmitButton = ({ uploadPromise }: Props) => {
  const { onSubmit, isLoading, response } = useStartAuction()
  const [isUploading, setIsUploading] = useState<boolean>()

  useEffect(() => {
    setIsUploading(true)
    uploadPromise?.finally(() => setIsUploading(false))
  }, [uploadPromise, setIsUploading])

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      // disabled={isLoading || isImageLoading || isSigning || response}
      flexShrink={0}
      size="lg"
      isLoading={isLoading}
      loadingText={isUploading ? "Uploading images" : "Loading"}
      onClick={handleSubmit((data: Omit<StartAuctionData, "uploadPromise">) => {
        onSubmit({ ...data, uploadPromise })
      })}
    >
      {response ? "Success" : "Summon"}
    </CtaButton>
  )
}

export default SubmitButton
