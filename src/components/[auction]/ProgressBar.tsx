import { HStack, Progress, Skeleton, Text, VStack } from "@chakra-ui/react"
import { useMemo } from "react"
import { Rest } from "types"
import Countdown from "./Countdown"
import useAuction from "./hooks/useAuction"

const ProgressBar = ({ ...rest }: Rest): JSX.Element => {
  const { auction } = useAuction()
  const { goalTreasuryAmount, currentTreasuryAmount, bids, endTimestamp } =
    auction || {}

  const percentage = useMemo(
    () => (currentTreasuryAmount * 100) / goalTreasuryAmount,
    [goalTreasuryAmount, currentTreasuryAmount]
  )

  return (
    <>
      {goalTreasuryAmount && (
        <VStack spacing={2} {...rest}>
          <HStack justifyContent="space-between" width="full">
            <Text as="span" fontWeight="bold">{`${currentTreasuryAmount} SOL`}</Text>

            <Text as="span">
              {`${bids?.length || 0} bid${bids?.length > 1 ? "s" : ""}`}
            </Text>
          </HStack>

          <Progress
            hasStripe
            colorScheme="orange"
            rounded="md"
            width="full"
            value={percentage}
          />

          <HStack justifyContent="space-between" width="full">
            <Text as="span">{`${percentage.toFixed(
              2
            )}% of ${goalTreasuryAmount} SOL goal`}</Text>

            <Skeleton isLoaded={!!endTimestamp}>
              <Countdown expiryTimestamp={endTimestamp} simple />
            </Skeleton>
          </HStack>
        </VStack>
      )}
    </>
  )
}

export default ProgressBar
