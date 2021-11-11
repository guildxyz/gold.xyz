import CtaButton from "components/common/CtaButton"
import { useFormContext } from "react-hook-form"
import useStartAuction from "./hooks/useStartAuction"

const SubmitButton = () => {
  const { onSubmit, isLoading, isImageLoading, response } = useStartAuction()

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      // disabled={isLoading || isImageLoading || isSigning || response}
      flexShrink={0}
      size="lg"
      isLoading={isLoading || isImageLoading}
      loadingText={(() => {
        if (isImageLoading) return "Uploading image to IPFS"
        if (isLoading) return "Loading"
      })()}
      onClick={handleSubmit(onSubmit)}
    >
      {response ? "Success" : "Summon"}
    </CtaButton>
  )
}

export default SubmitButton
