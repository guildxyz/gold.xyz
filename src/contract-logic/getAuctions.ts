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
  const AuctionMap = deserializeUnchecked(
    Layout.AUCTION_POOL_SCHEMA,
    Layout.AuctionPool,
    Buffer.from(AuctionPoolData)
  )
  const slugMap: any = Array.from(AuctionMap.pool.entries()).map((auction: any) => {
    const slugId = Buffer.from(auction[0].split(","))
    const index = slugId.indexOf(0x00)
    const unpadded = slugId.slice(0, index).toString()
    return { [unpadded]: auction[1] }
  })
  return slugMap
}

export default getAuctions
