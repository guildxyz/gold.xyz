import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY } from "../consts"
import {
  AuctionConfig,
  AuctionDescription,
  CreateMetadataAccountArgs,
  CreateTokenArgs,
  CreateTokenArgsNft,
  Data,
  InitializeAuctionArgs,
  SCHEMA
} from "../schema"
import { parseInstruction } from "../utils"
import { initAuctionWasm } from "../wasm-factory/instructions"

// TODO: separate error in contract if the metadata account is existing
//  (auction with same parameters as a deleted one results in PDA with same seeds)
export async function startAuction(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array
) {
  const auctionConfig = new AuctionConfig({
    cyclePeriod: 5,
    encorePeriod: 2,
    numberOfCycles: 10,
    minimumBidAmount: 1000,
  })
  const auctionDescription = new AuctionDescription({
    description: "cool description",
    socials: ["this.xyz", "that.com"],
    goalTreasuryAmount: 100_000_000,
  })
  const createMetadataAccountArgs = new CreateMetadataAccountArgs({
    data: new Data({
      name: "hello",
      symbol: "hll",
      uri: "gold.xyz",
      sellerFeeBasisPoints: 100,
      creators: null,
    }),
    isMutable: true,
  })
  const createTokenArgs = new CreateTokenArgs({
    createTokenArgsNft: new CreateTokenArgsNft({
      unnamed: createMetadataAccountArgs,
    }),
  })

  const initAuctionArgs = new InitializeAuctionArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId,
    auctionName: auctionId,
    auctionConfig,
    auctionDescription,
    createTokenArgs,
    auctionStartTimestamp: null,
  })

  const initAuctionArgsSerialized = serialize(SCHEMA, initAuctionArgs)
  const instruction = parseInstruction(initAuctionWasm(initAuctionArgsSerialized))

  return new Transaction().add(instruction)
}
