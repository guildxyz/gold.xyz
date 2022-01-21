import { HStack, Progress, Skeleton, Tag, Text, VStack } from "@chakra-ui/react"
import { useMemo } from "react"
import { Rest } from "types"
import Countdown from "./Countdown"
import useAuction from "./hooks/useAuction"
import useCycle from "./hooks/useCycle"

const ProgressBar = ({ ...rest }: Rest): JSX.Element => {
  const { auction } = useAuction()
  const { goalTreasuryAmount, allTimeTreasuryAmount } = auction || {}
  const { cycle } = useCycle()
  const { bids, endTimestamp } = cycle ?? {}

  const percentage = useMemo(
    () => (allTimeTreasuryAmount * 100) / goalTreasuryAmount,
    [goalTreasuryAmount, allTimeTreasuryAmount]
  )

  return (
    <>
      {goalTreasuryAmount && (
        <VStack width="full" spacing={2} {...rest}>
          <HStack justifyContent="space-between" width="full">
            <Text as="span" fontWeight="bold">
              {allTimeTreasuryAmount}
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
