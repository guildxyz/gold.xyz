import { HStack, Progress, Skeleton, Tag, Text, VStack } from "@chakra-ui/react"
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
            <Text as="span" fontWeight="bold">
              {currentTreasuryAmount}
              <Text as="span" fontSize="xs">
                {" SOL"}
              </Text>
            </Text>

            <HStack>
              <Tag size="sm">{bids?.length || 0}</Tag>
              <Text as="span" fontSize="sm">{` bid${
                bids?.length > 1 ? "s" : ""
              }`}</Text>
            </HStack>
          </HStack>

          <Progress
            hasStripe
            colorScheme="orange"
            rounded="md"
            width="full"
            value={percentage}
          />

          <HStack justifyContent="space-between" width="full" fontSize="sm">
            <Text as="span">
              <Text as="span" fontWeight="bold">{`${percentage.toFixed(2)}%`}</Text>
              {` of ${goalTreasuryAmount} SOL goal`}
            </Text>

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
