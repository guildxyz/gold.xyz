import { HStack, Progress, Text, VStack } from "@chakra-ui/react"
import { useMemo } from "react"
import { Rest } from "types"
import useAuction from "./hooks/useAuction"

const ProgressBar = ({ ...rest }: Rest): JSX.Element => {
  const { auction } = useAuction()
  const { goalTreasuryAmount, allTimeTreasuryAmount } = auction || {}

  const percentage = useMemo(
    () => (allTimeTreasuryAmount * 100) / goalTreasuryAmount,
    [goalTreasuryAmount, allTimeTreasuryAmount]
  )

  return (
    <>
      {goalTreasuryAmount && (
        <VStack spacing={2} w="full">
          <HStack justifyContent="space-between" width="full" px="2px">
            <Text fontSize="xs">
              <Text as="span" fontWeight="extrabold" fontSize="sm">
                {allTimeTreasuryAmount}
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
