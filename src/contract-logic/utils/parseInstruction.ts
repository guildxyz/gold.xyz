import { PublicKey, TransactionInstruction } from "@solana/web3.js"

export function parseInstruction(ix: any) {
  let keys = []
  let programId = new PublicKey(ix.program_id)
  for (const account of ix.accounts) {
    keys.push({
      isSigner: account.is_signer,
      isWritable: account.is_writable,
      pubkey: new PublicKey(account.pubkey),
    })
  }
  return new TransactionInstruction({
    data: ix.data,
    keys,
    programId,
  })
}
