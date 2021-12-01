import { PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { CONTRACT_ADMIN_PUBKEY } from "../consts"
import { Auction } from "../queries/getAuctions"
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
import { initAuctionWasm } from "../wasm-factory/instructions"

// TODO: separate error in contract if the metadata account is existing
//  (auction with same parameters as a deleted one results in PDA with same seeds)
export async function startAuction(auction: Auction, auctionOwnerPubkey: PublicKey) {
  const auctionConfig = new AuctionConfig({
    cyclePeriod: auction.cyclePeriod,
    encorePeriod: 300,
    numberOfCycles: auction.numberOfCycles,
    minimumBidAmount: auction.minBid,
  })
  const auctionDescription = new AuctionDescription({
    description: auction.description,
    socials: auction.socials,
    goalTreasuryAmount: auction.goalTreasuryAmount,
  })
  let createTokenArgs: CreateTokenArgs

  if (auction.asset.type === "NFT") {
    const createMetadataAccountArgs = new CreateMetadataAccountArgs({
      data: new Data({
        name: auction.asset.name,
        symbol: auction.asset.symbol,
        uri: auction.asset.uri,
        sellerFeeBasisPoints: 100,
        creators: null,
      }),
      isMutable: true,
    })
    createTokenArgs = new CreateTokenArgs({
      createTokenArgsNft: new CreateTokenArgsNft({
        unnamed: createMetadataAccountArgs,
      }),
    })
  } else if (auction.asset.type === "TOKEN") {
    createTokenArgs = new CreateTokenArgs({
      createTokenArgsToken: new CreateTokenArgsToken({
        decimals: auction.asset.decimals,
        perCycleAmount: auction.asset.perCycleAmount,
      }),
    })
  }

  const initAuctionArgs = new InitializeAuctionArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwnerPubkey,
    auctionId: padTo32Bytes(auction.id),
    auctionName: padTo32Bytes(auction.id),
    auctionConfig,
    auctionDescription,
    createTokenArgs,
    auctionStartTimestamp: null,
  })

  const initAuctionArgsSerialized = serialize(SCHEMA, initAuctionArgs)
  const instruction = parseInstruction(initAuctionWasm(initAuctionArgsSerialized))

  return new Transaction().add(instruction)
}
