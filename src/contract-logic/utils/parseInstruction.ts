import { AccountMeta, PublicKey, TransactionInstruction } from "@solana/web3.js"

export function parseInstruction(jsonString) {
  let parsed = JSON.parse(jsonString, function (key, value) {
    if (key === "accounts") {
      this.keys = []
      for (const v of value) {
        this.keys.push({
          isSigner: v.is_signer,
          isWritable: v.is_writable,
          pubkey: new PublicKey(v.pubkey),
        })
      }
      return // return undefined removes "accounts" from the keys
    } else if (key === "program_id") {
      // TODO temporary hack
      this.programId = new PublicKey(value)
      return
    }
    return value
  })
  return new TransactionInstruction(parsed)
}
