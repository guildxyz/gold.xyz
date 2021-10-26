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
  let AuctionMap = deserializeUnchecked(Layout.AUCTION_POOL_SCHEMA, Layout.AuctionPool, Buffer.from(AuctionPoolData));
  
  let slugMap: any = Array.from((AuctionMap.pool.entries())).map((auction: any) => {  
    let slugId = Buffer.from(auction[0].split(","))
    let index = slugId.indexOf(0x00)
    let unpadded = slugId.slice(0, index).toString();
    return {
      name: unpadded,
      id: auction[1]
    }
  })  
  return slugMap
}

export default getAuctions
