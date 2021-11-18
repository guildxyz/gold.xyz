import { Connection, Keypair, PublicKey } from "@solana/web3.js"

// razorblade localnet
//export const programId = new PublicKey("k4GBZGhNyhMx1uf7q2tVYNRabnUGdR3StqXvi26ntAL");
//export const METADATA_PROGRAM_ID = new PublicKey("EzjN1TGJQULYwCzFYbscJoWU1HfpvGe4WagCFKxJgY5T");
// turbineblade localnet
//export const PROGRAM_ID = new PublicKey("EYWyXhivnRcNfEPejGvprRhJ9PzwQpP5G558uESR6EmY");
//export const METADATA_PROGRAM_ID = new PublicKey("4vCSqWXmDKtX7QN237mr4nMmJ9Sbsn6ceswEWv8cuQ23");
// gyozo localnet
//export const PROGRAM_ID = new PublicKey("C49m9xTNShV9Ab1YwhgGqN3tv6bM3mYFVcdPrLxiZj2V")
//export const METADATA_PROGRAM_ID = new PublicKey("4AokZ7xLLA4FJu5SciX9tAMjCdusFmiQXbJ5tpeF65qo")
//export const CONNECTION = new Connection("http://localhost:8899", "singleGossip")

// testnet
export const PROGRAM_ID = new PublicKey("go1dcKcvafq8SDwmBKo6t2NVzyhvTEZJkMwnnfae99U")
export const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
export const CONNECTION = new Connection("https://api.devnet.solana.com", "singleGossip")

export const PREFIX = Buffer.from("metadata")
export const EDITION = Buffer.from("edition")
export const EDITION_MARKER_BIT_SIZE = 248
export const LAMPORTS = 1_000_000_000
export const NUM_OF_CYCLES_TO_DELETE = 30

const SECRET1 = Uint8Array.from([
  81, 206, 2, 84, 194, 25, 213, 226, 169, 97, 254, 229, 43, 106, 226, 29, 181, 244, 192, 48, 232, 94, 249, 178, 120, 15,
  117, 219, 147, 151, 148, 102, 184, 227, 91, 48, 138, 79, 190, 249, 113, 152, 84, 101, 174, 107, 202, 130, 113, 205,
  134, 62, 149, 92, 86, 216, 113, 95, 245, 151, 34, 17, 205, 3,
])

export const CONTRACT_ADMIN_KEYPAIR = Keypair.fromSecretKey(SECRET1) // only for tests
export const CONTRACT_ADMIN_PUBKEY = CONTRACT_ADMIN_KEYPAIR.publicKey
