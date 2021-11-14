import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { freeze } from "contract-logic/transactions/freeze"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { Gear, Snowflake } from "phosphor-react"
import { useRef } from "react"
import useAuction from "./hooks/useAuction"

const SettingsMenu = () => {
  const { auction, mutate } = useAuction()
  const { connection } = useConnection()
  const { sendTransaction } = useWallet()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const alertCancelRef = useRef()

  const handleFreezeAuction = async () => {
    const tx = await freeze(connection, auction?.ownerPubkey, auction?.id)
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "processed")
    console.log("success", "Transaction successful!", signature)
  }

  const { onSubmit: onFreeze, isLoading } = useSubmit(handleFreezeAuction, {
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
    <>
      <Menu placement="bottom-end">
        <MenuButton
          as={IconButton}
          aria-label="Auction settings"
          h="10"
          icon={<Icon as={Gear} />}
        />
        <MenuList border="none" shadow="md">
          <MenuItem py="2" icon={<Snowflake />} onClick={onOpen} color="red.300">
            Freeze auction
          </MenuItem>
        </MenuList>
      </Menu>
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
                onClick={onFreeze}
                isLoading={isLoading}
                ml={3}
              >
                Freeze
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default SettingsMenu
