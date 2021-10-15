import CtaButton from "components/common/CtaButton"
import usePersonalSign from "hooks/usePersonalSign"
import { useFormContext } from "react-hook-form"
import useTreasurySubmit from "./hooks/useTreasurySubmit"

const SubmitButton = () => {
  const { isSigning, callbackWithSign } = usePersonalSign(true)
  const { onSubmit, isLoading, isImageLoading, response } = useTreasurySubmit()

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      // disabled={isLoading || isImageLoading || isSigning || response}
      flexShrink={0}
      size="lg"
      isLoading={isLoading || isImageLoading || isSigning}
      loadingText={(() => {
        if (isSigning) return "Signing"
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
