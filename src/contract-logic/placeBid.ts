import { Transaction } from "@solana/web3.js"

const placeBid = async (amount: number): Promise<Transaction> => {
  console.log(amount)

  return new Transaction().add(undefined)
}

export default placeBid
