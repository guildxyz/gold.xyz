import { Connection, PublicKey } from "@solana/web3.js"

// razorblade localnet
//export const PROGRAM_ID = new PublicKey("3Pa861iqJgg7YDWxJse7HkGqBuArMFvX7e13JWXhjogS");
//export const METADATA_PROGRAM_ID = new PublicKey("ES2XAjMzGF7Drpbc6MU1tyvrRFb6sTT9zUrgJbNg35xq");
// turbineblade localnet
//export const PROGRAM_ID = new PublicKey("EYWyXhivnRcNfEPejGvprRhJ9PzwQpP5G558uESR6EmY");
//export const METADATA_PROGRAM_ID = new PublicKey("4vCSqWXmDKtX7QN237mr4nMmJ9Sbsn6ceswEWv8cuQ23");
// gyozo localnet
//export const PROGRAM_ID = new PublicKey("go1dcKcvafq8SDwmBKo6t2NVzyhvTEZJkMwnnfae99U")
//export const METADATA_PROGRAM_ID = new PublicKey("4AokZ7xLLA4FJu5SciX9tAMjCdusFmiQXbJ5tpeF65qo")
//export const CONNECTION = new Connection("http://localhost:8899", "confirmed")

// testnet
export const PROGRAM_ID = new PublicKey("go1dcKcvafq8SDwmBKo6t2NVzyhvTEZJkMwnnfae99U")
export const LAMPORTS = 1_000_000_000
export const NUM_OF_CYCLES_TO_DELETE = 30
//export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_SOLANA_API, "confirmed")
export const CONNECTION = new Connection("https://api.devnet.solana.com", "confirmed")
