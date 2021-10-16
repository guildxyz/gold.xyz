import { Connection, Keypair, PublicKey } from "@solana/web3.js"

const contractAdmin = new Keypair()
const auctionOwner = new Keypair()

const connection = new Connection("https://api.testnet.solana.com", "singleGossip")

const programId = new PublicKey("C49m9xTNShV9Ab1YwhgGqN3tv6bM3mYFVcdPrLxiZj2V")

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)
const PREFIX = Buffer.from("metadata")
const EDITION = Buffer.from("edition")

export {
  contractAdmin,
  auctionOwner,
  programId,
  connection,
  METADATA_PROGRAM_ID,
  PREFIX,
  EDITION,
}
