import CtaButton from "components/common/CtaButton"
import usePersonalSign from "hooks/usePersonalSign"
import useSubmit from "hooks/useSubmit"
import { useFormContext } from "react-hook-form"

const SubmitButton = () => {
  const { isSigning, callbackWithSign } = usePersonalSign(true)
  const { onSubmit, isLoading, response } = useSubmit((_) => Promise.resolve(_))

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      disabled={isLoading || isSigning || response}
      flexShrink={0}
      size="lg"
      isLoading={isLoading || isSigning}
      loadingText={(() => {
        if (isSigning) return "Signing"
        if (isLoading) return "Loading"
      })()}
      onClick={handleSubmit(callbackWithSign(onSubmit))}
    >
      {response ? "Success" : "Summon"}
    </CtaButton>
  )
}

export default SubmitButton
