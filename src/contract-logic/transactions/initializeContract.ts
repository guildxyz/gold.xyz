import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
import { CONNECTION, PROGRAM_ID } from "../consts"

export async function initContract(contractAdmin: Keypair) {
  const [contractBankPubkey, _c] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_contract_bank")],
    PROGRAM_ID
  )
  const [auctionPoolPubkey, _b] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_pool"), Buffer.from(contractAdmin.publicKey.toBytes())],
    PROGRAM_ID
  )

  const initializeContractInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    data: Buffer.from(Uint8Array.of(0)),
    keys: [
      { pubkey: contractAdmin.publicKey, isSigner: true, isWritable: true },
      { pubkey: contractBankPubkey, isSigner: false, isWritable: true },
      { pubkey: auctionPoolPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  })
  // send the transaction via CONNECTION
  await CONNECTION.confirmTransaction(
    await CONNECTION.sendTransaction(new Transaction().add(initializeContractInstruction), [contractAdmin], {
      skipPreflight: false,
      preflightCommitment: "singleGossip",
    })
  )
}
