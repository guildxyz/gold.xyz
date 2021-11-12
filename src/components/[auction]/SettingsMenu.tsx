import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { freeze } from "contract-logic/transactions/freeze"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import { Gear, Snowflake, Trash } from "phosphor-react"
import { useSWRConfig } from "swr"
import useAuction from "./hooks/useAuction"

const SettingsMenu = () => {
  const { auction } = useAuction()
  const { connection } = useConnection()
  const { sendTransaction } = useWallet()
  const toast = useToast()
  const router = useRouter()
  const { mutate } = useSWRConfig()

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

  const { onSubmit: onFreeze } = useSubmit(handleFreezeAuction, {
    onSuccess: () => {
      toast({
        title: `Auction successfully freezed!`,
        status: "success",
      })
      mutate(["auction", auction?.id])
    },
    onError: (e) =>
      toast({
        title: "Error freezing auction",
        description: e.toString(),
        status: "error",
      }),
  })

  const handleDeleteAuction = async () => {
    throw new Error("Not implemented yet")
    // const tx = await deleteAuction(connection, auction?.ownerPubkey, auction?.id)
    // console.log(tx)
    // const signature = await sendTransaction(tx, connection, {
    //   skipPreflight: false,
    //   preflightCommitment: "singleGossip",
    // })
    // console.log("info", "Transaction sent:", signature)
    // await connection.confirmTransaction(signature, "processed")
    // console.log("success", "Transaction successful!", signature)
  }

  const { onSubmit: onDelete } = useSubmit(handleDeleteAuction, {
    onSuccess: () => {
      toast({
        title: `Auction successfully deleted!`,
        status: "success",
      })
      mutate("auctions")
      router.push("/")
    },
    onError: (e) =>
      toast({
        title: "Error deleting auction",
        description: e.toString(),
        status: "error",
      }),
  })

  return (
    <Menu placement="bottom-end">
      <MenuButton as={IconButton} aria-label="Auction settings" h="10">
        <Icon as={Gear} />
      </MenuButton>
      <MenuList border="none" shadow="md">
        <MenuItem py="2" icon={<Snowflake />} onClick={onFreeze}>
          Freeze auction
        </MenuItem>
        <MenuItem py="2" icon={<Trash />} onClick={onDelete} color="red.400">
          Delete auction
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default SettingsMenu
