import { HStack, Progress, Text, VStack } from "@chakra-ui/react"
import { useMemo } from "react"
import { Rest } from "types"
import useAuction from "./hooks/useAuction"
import useCycle from "./hooks/useCycle"

const ProgressBar = ({ ...rest }: Rest): JSX.Element => {
  const { auction } = useAuction()
  const { cycle } = useCycle(true)
  const { goalTreasuryAmount, allTimeTreasuryAmount, isFinished, isFrozen } =
    auction || {}
  const { bids } = cycle || {}
  const highestBid = bids?.[0]?.amount ?? 0
  const treasuryAmount =
    isFinished || isFrozen
      ? allTimeTreasuryAmount
      : allTimeTreasuryAmount + highestBid

  const percentage = useMemo(
    () => (treasuryAmount * 100) / goalTreasuryAmount,
    [goalTreasuryAmount, treasuryAmount]
  )

  return (
    <>
      {goalTreasuryAmount && (
        <VStack spacing={2} w="full">
          <HStack justifyContent="space-between" width="full" px="2px">
            <Text fontSize="xs">
              <Text as="span" fontWeight="extrabold" fontSize="sm">
                {treasuryAmount.toFixed(2)}
              </Text>
              {" SOL raised"}
            </Text>
            <Text fontSize="xs">
              <Text as="span" fontWeight="bold" fontSize="sm">
                {`${percentage.toFixed(0)}%`}
              </Text>
              {` of ${goalTreasuryAmount} SOL goal`}
            </Text>
          </HStack>
          <Progress
            colorScheme="orange"
            rounded="md"
            width="full"
            value={percentage}
          />
        </VStack>
      )}
    </>
  )
}

export default ProgressBar
