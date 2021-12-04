import { Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY } from "../consts"
import * as FrontendAuctionTypes from "../queries/getAuctions"
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
import { parseInstruction } from "../utils"
import { padTo32Bytes } from "../utils/padTo32Bytes"
//import { initAuctionWasm } from "../wasm-factory/instructions"

// TODO: separate error in contract if the metadata account is existing
//  (auction with same parameters as a deleted one results in PDA with same seeds)
export async function startAuction(
  frontendAuctionConfig: FrontendAuctionTypes.AuctionConfig
) {
  const { initAuctionWasm } = async import("../../../zgen-solana/zgsol-fund-client/wasm-factory");
  const auctionConfig = new AuctionConfig({
    cyclePeriod: frontendAuctionConfig.cyclePeriod,
    encorePeriod: 300,
    numberOfCycles: frontendAuctionConfig.numberOfCycles,
    minimumBidAmount: frontendAuctionConfig.minBid,
  })
  const auctionDescription = new AuctionDescription({
    description: frontendAuctionConfig.description,
    socials: frontendAuctionConfig.socials,
    goalTreasuryAmount: frontendAuctionConfig.goalTreasuryAmount,
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
        // TODO: put the auctionOwnerPubkey here?
        creators: null,
      }),
      isMutable: true,
    })
    createTokenArgs = new CreateTokenArgs({
      createTokenArgsNft: new CreateTokenArgsNft({
        unnamed: createMetadataAccountArgs,
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
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: frontendAuctionConfig.ownerPubkey,
    auctionId: padTo32Bytes(frontendAuctionConfig.id),
    auctionName: padTo32Bytes(frontendAuctionConfig.id),
    auctionConfig,
    auctionDescription,
    createTokenArgs,
    auctionStartTimestamp: frontendAuctionConfig.startTimestamp,
  })

  const initAuctionArgsSerialized = serialize(SCHEMA, initAuctionArgs)
  const instruction = parseInstruction(initAuctionWasm(initAuctionArgsSerialized))

  return new Transaction().add(instruction)
}
