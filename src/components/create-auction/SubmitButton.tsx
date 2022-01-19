import CtaButton from "components/common/CtaButton"
import useToast from "hooks/useToast"
import { useFormContext, useWatch } from "react-hook-form"
import useStartAuction from "./hooks/useStartAuction"

const SubmitButton = () => {
  const { onSubmit, isLoading, response } = useStartAuction()
  const nfts = useWatch({ name: "nfts" })
  const toast = useToast()

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      // disabled={isLoading || isImageLoading || isSigning || response}
      flexShrink={0}
      size="lg"
      isLoading={isLoading}
      loadingText="Loading"
      onClick={(event) => {
        if (
          Object.values(nfts).some(
            (nft) => (nft as { hash?: string }).hash?.length <= 0
          )
        ) {
          // Using handleSubmit just to trigger validations
          handleSubmit(() =>
            toast({
              status: "info",
              title: "Please wait",
              description: "Some images aren't uploaded yet.",
            })
          )(event)
        } else handleSubmit(onSubmit)(event)
      }}
    >
      {response ? "Success" : "Summon"}
    </CtaButton>
  )
}

export default SubmitButton
