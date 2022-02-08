import { Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { LAMPORTS } from "../consts"
import { AuctionConfig as AuctionConfigType } from "../queries/types"
import {
  AuctionConfig,
  AuctionDescription,
  CreateMetadataAccountArgs,
  CreateTokenArgs,
  CreateTokenArgsNft,
  CreateTokenArgsToken,
  Data,
  InitializeAuctionArgs,
  SCHEMA,
} from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"

// TODO: separate error in contract if the metadata account is existing
//  (auction with same parameters as a deleted one results in PDA with same seeds)
export async function startAuction(frontendAuctionConfig: AuctionConfigType) {
  const { initializeAuctionWasm } = await import("../wasm-factory")
  const auctionConfig = new AuctionConfig({
    cyclePeriod: frontendAuctionConfig.cyclePeriod,
    encorePeriod: frontendAuctionConfig.encorePeriod,
    numberOfCycles: frontendAuctionConfig.numberOfCycles,
    minimumBidAmount: frontendAuctionConfig.minBid * LAMPORTS,
  })
  const auctionDescription = new AuctionDescription({
    description: frontendAuctionConfig.description,
    socials: frontendAuctionConfig.socials ?? [],
    goalTreasuryAmount: frontendAuctionConfig.goalTreasuryAmount * LAMPORTS,
  })

  let createTokenArgs: CreateTokenArgs
  if (frontendAuctionConfig.asset.type === "NFT") {
    const createMetadataAccountArgs = new CreateMetadataAccountArgs({
      data: new Data({
        name: frontendAuctionConfig.asset.name,
        symbol: frontendAuctionConfig.asset.symbol,
        uri: frontendAuctionConfig.asset.uri,
        // TODO: set this from parameter maybe?
        sellerFeeBasisPoints: 100,
        creators: null,
      }),
      isMutable: true,
    })
    createTokenArgs = new CreateTokenArgs({
      createTokenArgsNft: new CreateTokenArgsNft({
        metadataArgs: createMetadataAccountArgs,
        isRepeating: frontendAuctionConfig.asset.isRepeated,
      }),
    })
  } else if (frontendAuctionConfig.asset.type === "TOKEN") {
    createTokenArgs = new CreateTokenArgs({
      createTokenArgsToken: new CreateTokenArgsToken({
        decimals: frontendAuctionConfig.asset.decimals,
        perCycleAmount: frontendAuctionConfig.asset.perCycleAmount,
      }),
    })
  }

  const initAuctionArgs = new InitializeAuctionArgs({
    auctionOwnerPubkey: frontendAuctionConfig.ownerPubkey,
    auctionId: padTo32Bytes(frontendAuctionConfig.id),
    auctionName: padTo32Bytes(frontendAuctionConfig.name),
    auctionConfig: auctionConfig,
    auctionDescription: auctionDescription,
    createTokenArgs: createTokenArgs,
    auctionStartTimestamp: frontendAuctionConfig.startTime,
  })

  let initAuctionArgsSerialized = serialize(SCHEMA, initAuctionArgs)

  try {
    const instruction = parseInstruction(initializeAuctionWasm(initAuctionArgsSerialized))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
