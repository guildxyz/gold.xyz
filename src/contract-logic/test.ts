import { Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONNECTION, CONTRACT_ADMIN_KEYPAIR } from "./consts"
import { parseInstruction } from "./utils/parseInstruction"

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MasterNftData {
  name: string = "TEST"
  symbol: string = "TST"
  uri: string = "test.com"
}

export const SECRET2 = Uint8Array.from([
  110, 156, 29, 116, 136, 221, 72, 113, 16, 84, 50, 192, 65, 209, 100, 231, 3, 47, 231, 28, 161,
  218, 169, 110, 250, 194, 114, 27, 94, 114, 59, 109, 120, 10, 72, 77, 1, 26, 130, 146, 19, 164, 30,
  88, 232, 81, 31, 206, 127, 186, 90, 180, 126, 86, 40, 54, 128, 75, 248, 85, 2, 128, 84, 202,
])

export const SECRET3 = Uint8Array.from([
  149, 210, 118, 216, 144, 222, 57, 30, 7, 228, 175, 91, 120, 94, 197, 122, 199, 108, 28, 160, 229,
  17, 63, 226, 180, 142, 38, 28, 233, 201, 69, 130, 45, 115, 172, 64, 253, 227, 246, 254, 233, 174,
  56, 153, 112, 50, 17, 252, 140, 177, 128, 180, 121, 240, 113, 21, 64, 141, 111, 221, 31, 93, 6,
  156,
])

export async function sendTransaction(transaction: Transaction, signer: Keypair) {
  await CONNECTION.confirmTransaction(
    await CONNECTION.sendTransaction(transaction, [signer], {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
  )
}
