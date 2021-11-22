import {
  ParsedConfirmedTransaction,
  ParsedTransaction,
  PartiallyDecodedInstruction,
  SignaturesForAddressOptions,
  TransactionSignature,
} from "@solana/web3.js"
import base58 from "bs58"
import { CONNECTION_CONFIRMED, PROGRAM_ID } from "../consts"
import { parseAuctionId } from "../utils/parseAuctionId"

// `fromSignature` parameter should be the last signature of the last fetch
// the transaction with the signature given in `fromSignature` is not included
export class GetTransactionOptions {
  fromTimestamp: number
  toTimestamp?: number
  fromSignature?: TransactionSignature
  limit?: number
  constructor(args: {
    fromTimestamp: number
    toTimestamp?: number
    limit?: number
    fromSignature?: TransactionSignature
  }) {
    this.fromTimestamp = args.fromTimestamp
    this.toTimestamp = args.toTimestamp
    this.fromSignature = args.fromSignature
    this.limit = args.limit
  }

  toSignaturesForAddressOptions() {
    const options: SignaturesForAddressOptions = {
      before: this.fromSignature,
      until: null,
      limit: this.limit,
    }
    return options
  }
}

export class ParsedInstruction {
  instructionCode: number
  auctionId: string
  rest: Uint8Array
  constructor(instructionCode: number, auctionId: string, rest: Uint8Array) {
    this.instructionCode = instructionCode
    this.auctionId = auctionId
    this.rest = rest
  }
}

export interface InstructionFilter {
  filter(ix: ParsedInstruction): boolean
}

export class NoFilter implements InstructionFilter {
  filter(ix: ParsedInstruction): boolean {
    return true
  }
}

export interface InstructionExtractor {
  extract(ix: ParsedInstruction, tx: ParsedTransaction)
}

export function parseInstruction(fetchedInstruction: PartiallyDecodedInstruction) {
  const binaryData = base58.decode(fetchedInstruction.data)
  const instructionCode = binaryData[0]
  const auctionId = parseAuctionId(binaryData.slice(1, 33))
  const rest = binaryData.slice(33)

  return new ParsedInstruction(instructionCode, auctionId, rest)
}

export async function getAndExtractTransactions(
  extractor: InstructionExtractor,
  filter: InstructionFilter = new NoFilter(),
  transactionOptions: GetTransactionOptions
) {
  // Get transactions
  const all_signatures = (
    await CONNECTION_CONFIRMED.getSignaturesForAddress(PROGRAM_ID, transactionOptions.toSignaturesForAddressOptions())
  ).map((confirmedSignatureInfo) => confirmedSignatureInfo.signature)

  if (transactionOptions.toTimestamp == null) {
    transactionOptions.toTimestamp = Number.MAX_SAFE_INTEGER
  }

  const fetched = await CONNECTION_CONFIRMED.getParsedConfirmedTransactions(all_signatures)
  let extractedTransactions = []
  fetched.forEach((parsed: ParsedConfirmedTransaction | null) => {
    if (parsed !== null) {
      if (transactionOptions.fromTimestamp <= parsed.blockTime && transactionOptions.toTimestamp >= parsed.blockTime) {
        const transaction = parsed.transaction
        transaction.message.instructions.forEach((instruction) => {
          if ("data" in instruction) {
            const parsedInstruction = parseInstruction(instruction)
            if (filter.filter(parsedInstruction)) {
              extractedTransactions.push(extractor.extract(parsedInstruction, transaction))
            }
          } else {
            console.log("Unhandled case in instruction parsing")
          }
        })
      }
    }
  })

  const lastSignature = all_signatures[all_signatures.length - 1]
  return { extractedTransactions, lastSignature }
}
