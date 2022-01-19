import CtaButton from "components/common/CtaButton"
import { useFormContext } from "react-hook-form"
import useStartAuction from "./hooks/useStartAuction"

type Props = {
  isUploadLoading: boolean
}

const SubmitButton = ({ isUploadLoading }: Props) => {
  const { onSubmit, isLoading, response } = useStartAuction()

  const { handleSubmit } = useFormContext()

  return (
    <CtaButton
      // disabled={isLoading || isImageLoading || isSigning || response}
      flexShrink={0}
      size="lg"
      isLoading={isLoading || isUploadLoading}
      loadingText={isUploadLoading ? "Uploading images" : "Loading"}
      onClick={handleSubmit(onSubmit)}
    >
      {response ? "Success" : "Summon"}
    </CtaButton>
  )
}

export default SubmitButton
