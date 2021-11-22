import { Connection, Message, SignaturesForAddressOptions, TransactionSignature } from "@solana/web3.js"
import BN from "bn.js"
import { PROGRAM_ID, TARGET_CLUSTER } from "../consts"
import { Bid } from "../layouts/state"
import { bytesToNumber } from "../utils/bytesToNumber"
import { getAndExtractTransactions, ParsedInstruction, parseInstruction } from "./getTransactions"

export class myFilter {
  auctionId: string
  constructor(auctionId: string) {
    this.auctionId = auctionId
  }

  filter(instr: ParsedInstruction): boolean {
    return this.auctionId === instr.auctionId && instr.instructionCode === 4
  }
}

// `from` parameter should be the last signature of the last fetch
// the transaction with the signature given in `from` is not included
export class GetBidHistoryOptions {
  from?: TransactionSignature
  limit?: number
  constructor(limit?: number, from?: TransactionSignature) {
    this.from = from
    this.limit = limit
  }

  toSignaturesForAddressOptions() {
    const options: SignaturesForAddressOptions = {
      before: this.from,
      until: null,
      limit: this.limit,
    }
    return options
  }
}

export class BidExtractor {
  extract(instr: ParsedInstruction, args: { message: Message; signatures: string[] }) {
    const bidAmount = new BN(bytesToNumber(instr.rest))
    const bidder = args.message.accountKeys[0]
    return new Bid({ amount: bidAmount, bidderPubkey: bidder })
  }
}

export async function getBidHistory(auctionId: string, options: GetBidHistoryOptions) {
  const bids = await getAndExtractTransactions(
    new BidExtractor(),
    new myFilter(auctionId),
    options.toSignaturesForAddressOptions()
  )
  return { bidHistory: bids.extractedTransactions, lastSignature: bids.lastSignature }
}

export async function getBidHistoryMonolith(auctionId: string, options: GetBidHistoryOptions) {
  const connection_confirmed = new Connection(TARGET_CLUSTER, "confirmed")

  // Get transactions
  const all_signatures = await connection_confirmed.getSignaturesForAddress(
    PROGRAM_ID,
    options.toSignaturesForAddressOptions()
  )

  let bidHistory = []
  let lastSignature: string
  for (let i = 0; i < all_signatures.length; ++i) {
    const transaction = (await connection_confirmed.getTransaction(all_signatures[i].signature)).transaction

    transaction.message.instructions.forEach((instruction) => {
      const parsedInstruction = parseInstruction(instruction)
      if (parsedInstruction.instructionCode === 4 && parsedInstruction.auctionId === auctionId) {
        const bidAmount = new BN(bytesToNumber(parsedInstruction.rest))
        const bidderPubkey = transaction.message.accountKeys[0]
        bidHistory.push(new Bid({ amount: bidAmount, bidderPubkey: bidderPubkey }))
      }
    })

    lastSignature = all_signatures[i].signature
  }
  return { bidHistory, lastSignature }
}
