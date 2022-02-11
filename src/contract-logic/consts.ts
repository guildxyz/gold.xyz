import { Connection, PublicKey } from "@solana/web3.js"

export const PROGRAM_ID = new PublicKey("go1dcKcvafq8SDwmBKo6t2NVzyhvTEZJkMwnnfae99U")
export const LAMPORTS = 1_000_000_000
export const NUM_OF_CYCLES_TO_DELETE = 30
export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_SOLANA_API, "confirmed")
