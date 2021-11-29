import { Keypair, Transaction } from "@solana/web3.js"
import {
  SCHEMA,
  InitializeAuctionArgs,
  AuctionConfig,
  AuctionDescription,
  CreateMetadataAccountArgs,
  CreateTokenArgs,
  CreateTokenArgsNft,
  Data,
} from "./schema"
import { serialize } from "borsh"
import { initContract, initAuction } from "./wasm-factory"
import { initializeContract, sendTransaction, SECRET2 } from "./test"
import { CONTRACT_ADMIN_PUBKEY } from "./consts"
import { parseInstruction } from "./utils"

;(async () => {
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //await initializeContract(auctionOwner.publicKey);
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
  const auctionId = Uint8Array.from([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 0,
  ])
  const initAuctionArgs = new InitializeAuctionArgs({
    contractAdminPubkey: CONTRACT_ADMIN_PUBKEY,
    auctionOwnerPubkey: auctionOwner.publicKey,
    auctionId,
    auctionName: auctionId,
    auctionConfig,
    auctionDescription,
    createTokenArgs,
    auctionStartTimestamp: null,
  })

  const initAuctionArgsSerialized = serialize(SCHEMA, initAuctionArgs)
  const instruction = parseInstruction(initAuction(initAuctionArgsSerialized))

  await sendTransaction(new Transaction().add(instruction), auctionOwner)
  console.log("hello")
})()
