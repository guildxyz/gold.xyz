import { Connection, PublicKey } from "@solana/web3.js"
import { PROGRAM_ID } from "../consts"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { getAuction } from "./getAuctions"

export async function getTreasuryFunds(connection: Connection, auctionId: string, auctionOwnerPubkey?: PublicKey) {
  if (auctionOwnerPubkey == null) {
    auctionOwnerPubkey = (await getAuction(connection, auctionId)).ownerPubkey
  }

  const auctionIdBuffer = padTo32Bytes(auctionId)
  const [auctionBankPubkey, _a] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_bank"), auctionIdBuffer, Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )
  let auctionBankAccount = await connection.getAccountInfo(auctionBankPubkey)
  return auctionBankAccount.lamports - (await connection.getMinimumBalanceForRentExemption(0))
}
