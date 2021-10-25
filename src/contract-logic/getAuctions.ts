import { PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { connection, contractAdmin, programId } from "./config"
import * as Layout from "./config/layout"

async function getAuctions() {
  const [auctionPoolPubkey, _b] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_pool"), Buffer.from(contractAdmin.publicKey.toBytes())],
    programId
  )
  const AuctionPoolAccount = await connection.getAccountInfo(auctionPoolPubkey)
  const AuctionPoolData: Buffer = AuctionPoolAccount!.data
  return deserializeUnchecked(
    Layout.AUCTION_POOL_SCHEMA,
    Layout.AuctionPool,
    Buffer.from(AuctionPoolData)
  )
}

export default getAuctions
