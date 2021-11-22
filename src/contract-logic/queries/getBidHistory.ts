import { ParsedTransaction, PublicKey, TransactionSignature } from "@solana/web3.js"
import { CONNECTION_CONFIRMED, LAMPORTS } from "../consts"
import { bytesToNumber } from "../utils/bytesToNumber"
import { getAuction } from "./getAuctions"
import {
  getAndExtractTransactions,
  GetTransactionOptions,
  InstructionExtractor,
  InstructionFilter,
  ParsedInstruction,
} from "./getTransactions"

export class Bid {
  amount: number
  bidderPubkey: PublicKey
  constructor(amount: number, bidderPubkey: PublicKey) {
    this.amount = amount
    this.bidderPubkey = bidderPubkey
  }
}

export class BidFilter implements InstructionFilter {
  auctionId: string
  constructor(auctionId: string) {
    this.auctionId = auctionId
  }

  filter(instr: ParsedInstruction): boolean {
    return this.auctionId === instr.auctionId && instr.instructionCode === 4
  }
}

export class BidExtractor implements InstructionExtractor {
  extract(ix: ParsedInstruction, tx: ParsedTransaction) {
    const bidAmount = bytesToNumber(ix.rest) / LAMPORTS
    const bidder = tx.message.accountKeys[0].pubkey
    return new Bid(bidAmount, bidder)
  }
}

export async function getBidHistory(
  auctionId: string,
  cycleNumber: number,
  limit?: number,
  fromSignature?: TransactionSignature
) {
  const auction = await getAuction(CONNECTION_CONFIRMED, auctionId, cycleNumber)

  const getTransactionOptions = new GetTransactionOptions({
    fromTimestamp: auction.startTimestamp / 1000,
    toTimestamp: auction.endTimestamp / 1000,
    fromSignature: fromSignature,
    limit: limit,
  })

  const bids = await getAndExtractTransactions(new BidExtractor(), new BidFilter(auctionId), getTransactionOptions)
  return { bidHistory: bids.extractedTransactions, lastSignature: bids.lastSignature }
}

/*
export async function getBidHistoryMonolith(auctionId: string, transactionOptions: GetTransactionOptions) {
  // Get transactions
  const all_signatures = (await CONNECTION_CONFIRMED.getSignaturesForAddress(
    PROGRAM_ID,
    transactionOptions.toSignaturesForAddressOptions()
  )).map((confirmedSignatureInfo) => confirmedSignatureInfo.signature);

  let bidHistory = []
  const fetched = await CONNECTION_CONFIRMED.getParsedConfirmedTransactions(all_signatures)

  if (transactionOptions.toTimestamp == null) {
    transactionOptions.toTimestamp = Number.MAX_SAFE_INTEGER;
  }

  fetched.forEach(
    (parsed: ParsedConfirmedTransaction | null) => {
      if (parsed !== null) {
        if (transactionOptions.fromTimestamp <= parsed.blockTime && transactionOptions.toTimestamp >= parsed.blockTime ) {
          const transaction = parsed.transaction;
          transaction.message.instructions.forEach((instruction) => {
            if ("data" in instruction ) {
              const parsedInstruction = parseInstruction(instruction)
              if (parsedInstruction.instructionCode === 4 && parsedInstruction.auctionId === auctionId) {
                const bidAmount = bytesToNumber(parsedInstruction.rest) / LAMPORTS
                const bidderPubkey = transaction.message.accountKeys[0].pubkey
                bidHistory.push(new Bid(bidAmount, bidderPubkey))
              }
            }else {
              // This case the instruction is of type ParsedInstruction
              // Only deploy instructions seem to be of this type
              console.log("Unhandled case in instruction parsing");
            }
          });
        }
      }
  });

  const lastSignature = all_signatures[all_signatures.length - 1];
  return { bidHistory, lastSignature }
}
*/
