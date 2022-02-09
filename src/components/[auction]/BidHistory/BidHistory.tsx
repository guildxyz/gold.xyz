import { useDisclosure } from "@chakra-ui/hooks"
import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react"
import Modal from "components/common/Modal"
import useCycle from "../hooks/useCycle"
import Bid from "./components/Bid"

const BidHistory = ({ cycleState }) => {
  const { cycle, isLoading } = useCycle()
  const { isOpen, onOpen, onClose } = useDisclosure()

  if (isLoading) return null

  if (!cycle?.bids?.length)
    return (
      <Text colorScheme={"gray"} w="full" fontSize={"sm"}>
        No bids {cycleState === "active" ? "yet" : ""}
      </Text>
    )

  return (
    <>
      <VStack>
        {cycle?.bids?.slice(0, 2).map((bid) => (
          <Bid key={bid.amount.toString()} bid={bid} />
        ))}
        <Button
          variant="ghost"
          bg="blackAlpha.200"
          h="48px"
          w="full"
          onClick={onOpen}
        >
          Bid history
        </Button>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bid history</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              {cycle.bids.map((bid) => (
                <Bid key={bid.amount.toString()} bid={bid} />
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default BidHistory
