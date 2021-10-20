import { Connection, Keypair, PublicKey } from "@solana/web3.js"

const secret1 = Uint8Array.from([
  81, 206, 2, 84, 194, 25, 213, 226, 169, 97, 254, 229, 43, 106, 226, 29, 181, 244,
  192, 48, 232, 94, 249, 178, 120, 15, 117, 219, 147, 151, 148, 102, 184, 227, 91,
  48, 138, 79, 190, 249, 113, 152, 84, 101, 174, 107, 202, 130, 113, 205, 134, 62,
  149, 92, 86, 216, 113, 95, 245, 151, 34, 17, 205, 3,
])

const secret2 = Uint8Array.from([
  110, 156, 29, 116, 136, 221, 72, 113, 16, 84, 50, 192, 65, 209, 100, 231, 3, 47,
  231, 28, 161, 218, 169, 110, 250, 194, 114, 27, 94, 114, 59, 109, 120, 10, 72, 77,
  1, 26, 130, 146, 19, 164, 30, 88, 232, 81, 31, 206, 127, 186, 90, 180, 126, 86, 40,
  54, 128, 75, 248, 85, 2, 128, 84, 202,
])

const contractAdmin = Keypair.fromSecretKey(secret1)
const auctionOwner = Keypair.fromSecretKey(secret2)
const adminPub = new PublicKey(contractAdmin.publicKey)
const ownerPub = new PublicKey(auctionOwner.publicKey)

const connection = new Connection("https://api.testnet.solana.com", "singleGossip")

const programId = new PublicKey("C49m9xTNShV9Ab1YwhgGqN3tv6bM3mYFVcdPrLxiZj2V")

const auctionId = new Uint8Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 42,
])

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)
const PREFIX = Buffer.from("metadata")
const EDITION = Buffer.from("edition")
const EDITION_MARKER_BIT_SIZE = 248

export {
  contractAdmin,
  auctionOwner,
  adminPub,
  ownerPub,
  programId,
  connection,
  METADATA_PROGRAM_ID,
  PREFIX,
  EDITION,
  EDITION_MARKER_BIT_SIZE,
  auctionId,
}
