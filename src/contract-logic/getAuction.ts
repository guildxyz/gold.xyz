import { PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { auctionId, connection, contractAdmin, programId } from "./config"
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

async function getAuctionWithId() {
  // temporary dummy data until the function doesn't work correctly
  return {
    id: "0",
    name: "First auction",
    cyclePeriod: 64800,
    minBid: 300,
    numberOfCycles: 10,
    startTimestamp: 1634262267169,
    nftData: {
      name: "First NFT",
      symbol: "SYMB",
      uri: "https://storageapi.fleek.co/608ac2f5-df51-4e35-a363-1afacc7db6d3-bucket/dovalid_agora.png",
    },
  }

  const auctions = await getAuctions()
  const auction = auctions.pool.get(auctionId.toString())
  console.log(auction)
  return auction
}

export default getAuctionWithId
