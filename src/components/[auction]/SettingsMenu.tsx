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
import { freezeAuction } from "contract-logic/transactions/freezeAuction"
import { claimFunds } from "contract-logic/transactions/claimFunds"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { Gear, Snowflake, CurrencyDollarSimple } from "phosphor-react"
import { useRef } from "react"
import useAuction from "./hooks/useAuction"

const SettingsMenu = () => {
  const { auction, mutate } = useAuction()
  const { connection } = useConnection()
  const { sendTransaction } = useWallet()
  const toast = useToast()
  const { isOpen: isOpenClaim, onOpen: onOpenClaim, onClose: onCloseClaim } = useDisclosure()
  const { isOpen: isOpenFreeze, onOpen: onOpenFreeze, onClose: onCloseFreeze } = useDisclosure()
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

  const handleClaimFunds = async () => {
    const tx = await claimFunds(auction?.id, auction?.ownerPubkey, auction?.availableTreasuryAmount)
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "processed")
    console.log("success", "Transaction successful!", signature)
  }

  const { onSubmit: onFreeze, isLoading: isLoadingFreeze } = useSubmit(handleFreezeAuction, {
    onSuccess: () => {
      toast({
        title: `Auction successfully frozen!`,
        status: "success",
      })
      mutate()
      onCloseFreeze()
    },
    onError: (e) =>
      toast({
        title: "Error freezing auction",
        description: e.toString(),
        status: "error",
      }),
  })

  const { onSubmit: onClaim, isLoading: isLoadingClaim } = useSubmit(handleClaimFunds, {
    onSuccess: () => {
      toast({
        title: `Funds successfully claimed!`,
        status: "success",
      })
      mutate()
      onCloseClaim()
    },
    onError: (e) =>
      toast({
        title: "Error claiming funds",
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
          <MenuItem py="2" icon={<CurrencyDollarSimple />} onClick={onOpenClaim} color="green.300">
            Claim funds
          </MenuItem>
          <MenuItem py="2" icon={<Snowflake />} onClick={onOpenFreeze} color="red.300">
            Freeze auction
          </MenuItem>
        </MenuList>
      </Menu>
      <AlertDialog
        isOpen={isOpenClaim}
        leastDestructiveRef={alertCancelRef}
        onClose={onCloseClaim}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Claim funds</AlertDialogHeader>

            <AlertDialogBody>
              You have currently {auction?.availableTreasuryAmount.toFixed(2)} SOL in your treasury.
              Would you like to claim this amount?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={alertCancelRef} onClick={onCloseClaim}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={onClaim}
                isLoading={isLoadingClaim}
                ml={3}
              >
                Claim
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <AlertDialog
        isOpen={isOpenFreeze}
        leastDestructiveRef={alertCancelRef}
        onClose={onCloseFreeze}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Freeze auction</AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? Freezing the auction cannot be undone. Funds will be sent
              back to the top bidder and eventually the auction will be deleted.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={alertCancelRef} onClick={onCloseFreeze}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={onFreeze}
                isLoading={isLoadingFreeze}
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
