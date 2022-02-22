import { Keypair } from "@solana/web3.js"
import fetch from "node-fetch"
import { CONNECTION } from "./consts"
import { AuctionConfig, NFTData } from "./queries/types"
import { SECRET2, SECRET3 } from "./test"
import auctionExists from "./queries/auctionExists"
import { getAuctions } from "./queries/getAuctions"

var assert = require("assert")
// @ts-ignore
global.fetch = fetch
// @ts-ignore
global.Headers = fetch.Headers
// @ts-ignore
global.Request = fetch.Request
// @ts-ignore
global.Response = fetch.Response
;(async () => {
  console.log(await auctionExists("gold-dao"))
  console.log(await getAuctions(CONNECTION))
  //let auctionOwner = Keypair.fromSecretKey(SECRET2)
  //let bidder = Keypair.fromSecretKey(SECRET3)
  //console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //const nftAsset: NFTData = {
  //  type: "NFT",
  //  name: "aaa",
  //  symbol: "AAA",
  //  uri: "ipfs://nice/aaaa",
  //  isRepeated: false,
  //}
  //const tokenAsset: TokenData = {
  //  type: "TOKEN",
  //  decimals: 1,
  //  perCycleAmount: 1000,
  //  mintAddress: PublicKey.default,
  //}
  //const auction_config: AuctionConfig = {
  //  id: "heheheheheho",
  //  name: "heheheheheho",
  //  description: "xd",
  //  socials: ["aaa.aaa"],
  //  goalTreasuryAmount: null,
  //  ownerPubkey: auctionOwner.publicKey,
  //  asset: nftAsset,
  //  encorePeriod: 0,
  //  cyclePeriod: 86400,
  //  numberOfCycles: 20,
  //  startTime: null,
  //  minBid: 0.07,
  //}

  // CREATE AUCTION
  //const startAuctionTransaction = await startAuction(auction_config);
  //await sendTransaction(startAuctionTransaction, auctionOwner);
  //console.log("Auction created successfully.");
  // Query auction
  //console.log(await getAuctions(CONNECTION))
  //const auction = await getAuction("gold-dao")
  //console.log(auction)
  //console.log(await getAuctionCycle(auction.rootStatePubkey, 1))
  // CLAIM FUNDS
  //let ownerBalanceBefore = await CONNECTION.getBalance(auctionOwner.publicKey);
  //const claimAmount = 0.3;
  //let claimFundsTransaction = await claimFunds(auction_config.id, auctionOwner.publicKey, claimAmount)
  //await sendTransaction(claimFundsTransaction, auctionOwner)
  //let ownerBalanceAfter = await CONNECTION.getBalance(auctionOwner.publicKey);
  //assert.equal(ownerBalanceAfter * LAMPORTS, (ownerBalanceBefore + claimAmount) * LAMPORTS - 5000);
  //console.log("successfully claimed funds");
  // PLACE BID
  //CONNECTION.requestAirdrop(bidder.publicKey, 100000000);
  //const bidTransaction = await placeBid(auction.id, bidder.publicKey, 0.6);
  //await sendTransaction(bidTransaction, bidder);
  //console.log("Bid placed successfully.");
  // FREEZE_AUCTION
  //const deleteAuctionTransaction = await deleteAuction(auction_config.id, auctionOwner.publicKey)
  //await sendTransaction(deleteAuctionTransaction, auctionOwner)
  //console.log("Auction frozen successfully.")
})()
