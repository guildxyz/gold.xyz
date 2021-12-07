import { Connection, PublicKey } from "@solana/web3.js";
import { padTo32Bytes } from "../utils/padTo32Bytes";

export async function getTreasuryFunds(
  connection: Connection,
  auctionId: string,
) {
  const { getAuctionBankPubkeyWasm } = await import("../../../zgen-solana/zgsol-fund-client/wasm-factory");

  const auctionIdBuffer = padTo32Bytes(auctionId)
  const auctionBankPubkey = new PublicKey(
    await getAuctionBankPubkeyWasm(auctionIdBuffer)
  )
  let auctionBankAccount = await connection.getAccountInfo(auctionBankPubkey)
  return (
    auctionBankAccount.lamports -
    (await connection.getMinimumBalanceForRentExemption(0))
  )
}
