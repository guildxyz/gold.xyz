import { Button } from "@chakra-ui/button"
import { ChakraProps } from "@chakra-ui/system"
import useAuction from "./hooks/useAuction"
import useClaimReward from "./hooks/useClaimReward"
import useCycle from "./hooks/useCycle"

const ClaimRewardButton = (props: ChakraProps) => {
  const { isLoading, onSubmit } = useClaimReward()
  const { auction } = useAuction()
  const { cycle } = useCycle()

  return (
    <Button
      size="sm"
      colorScheme="indigo"
      isLoading={isLoading}
      onClick={() => onSubmit({ auctionId: auction.id, cycle, tokenType: "Nft" })}
      {...props}
    >
      Claim
    </Button>
  )
}

export default ClaimRewardButton
