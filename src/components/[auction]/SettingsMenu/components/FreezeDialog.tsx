import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import useAuction from "components/[auction]/hooks/useAuction"
import { freezeAuction } from "contract-logic/transactions/freezeAuction"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRef } from "react"

export default function FreezeDialog({ isOpen, onClose }) {
  const { auction, mutate } = useAuction()
  const { connection } = useConnection()
  const { sendTransaction } = useWallet()
  const toast = useToast()
  const alertCancelRef = useRef()

  const handleFreezeAuction = async () => {
    const tx = await freezeAuction(auction?.id, auction?.ownerPubkey)
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "processed")
    console.log("success", "Transaction successful!", signature)
  }

  const { onSubmit, isLoading } = useSubmit(handleFreezeAuction, {
    onSuccess: () => {
      toast({
        title: `Auction successfully frozen!`,
        status: "success",
      })
      mutate()
      onClose()
    },
    onError: (e) =>
      toast({
        title: "Error freezing auction",
        description: e.toString(),
        status: "error",
      }),
  })

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={alertCancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Freeze auction</AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? Freezing the auction cannot be undone. Funds will be sent
            back to the top bidder and eventually the auction will be deleted.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={alertCancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onSubmit}
              isLoading={isLoading}
              ml={3}
            >
              Freeze
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
