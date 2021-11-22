import { CompiledInstruction, Connection, Message, SignaturesForAddressOptions } from "@solana/web3.js"
import base58 from "bs58"
import { PROGRAM_ID, TARGET_CLUSTER } from "../consts"
import { parseAuctionId } from "../utils/parseAuctionId"

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
  filter(instr: ParsedInstruction): boolean
}

export class NoFilter {
  filter(instr: ParsedInstruction): boolean {
    return true
  }
}

export interface InstructionExtractor {
  extract(instr: ParsedInstruction, args: { message: Message; signatures: string[] })
}

export function parseInstruction(fetchedInstruction: CompiledInstruction) {
  const binaryData = base58.decode(fetchedInstruction.data)
  const instructionCode = binaryData[0]
  const auctionId = parseAuctionId(binaryData.slice(1, 33))
  const rest = binaryData.slice(33)

  return new ParsedInstruction(instructionCode, auctionId, rest)
}

//
export async function getTransactions(
  extractor: InstructionExtractor,
  filter: InstructionFilter = new NoFilter(),
  listOptions: SignaturesForAddressOptions = null
) {
  const connection_confirmed = new Connection(TARGET_CLUSTER, "confirmed")

  // Get transactions
  const all_signatures = await connection_confirmed.getSignaturesForAddress(PROGRAM_ID, listOptions)

  let extractedTransactions = []
  let lastSignature: string
  for (let i = 0; i < all_signatures.length; ++i) {
    const transaction = (await connection_confirmed.getTransaction(all_signatures[i].signature)).transaction

    transaction.message.instructions.forEach((instruction) => {
      const parsedInstruction = parseInstruction(instruction)
      if (filter.filter(parsedInstruction)) {
        extractedTransactions.push(extractor.extract(parsedInstruction, transaction))
      }
    })

    lastSignature = all_signatures[i].signature
  }
  return extractedTransactions
}
