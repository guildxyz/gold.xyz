import { Connection, PublicKey } from "@solana/web3.js"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { getAuctionBankPubkeyWasm } from "../wasm-factory/instructions"
import { getAuction } from "./getAuctions"

export async function getTreasuryFunds(
  connection: Connection,
  auctionId: string,
  auctionOwnerPubkey?: PublicKey
) {
  if (auctionOwnerPubkey == null) {
    auctionOwnerPubkey = (await getAuction(connection, auctionId)).ownerPubkey
  }

  const auctionIdBuffer = padTo32Bytes(auctionId)
  const auctionBankPubkey = new PublicKey(
    await getAuctionBankPubkeyWasm(auctionIdBuffer, auctionOwnerPubkey.toBytes())
  )
  let auctionBankAccount = await connection.getAccountInfo(auctionBankPubkey)
  return (
    auctionBankAccount.lamports -
    (await connection.getMinimumBalanceForRentExemption(0))
  )
}
