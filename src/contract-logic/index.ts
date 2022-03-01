import { Keypair } from "@solana/web3.js"
import { AuctionConfig, NFTData } from "./queries/types"
import { CONNECTION, SECRET2, SECRET3 } from "./test"
import claimFunds from "./transactions/claimFunds"
import claimRewards from "./transactions/claimRewards"
import deleteAuction from "./transactions/deleteAuction"
import modifyAuction from "./transactions/modifyAuction"
import placeBid from "./transactions/placeBid"
import startAuction from "./transactions/startAuction"
import auctionExists from "./queries/auctionExists"
import { getAuction, getAuctions, getAuctionCycle } from "./queries/getAuctions"

import fetch from "node-fetch"
// @ts-ignore
global.fetch = fetch
// @ts-ignore
global.Headers = fetch.Headers
// @ts-ignore
global.Request = fetch.Request
// @ts-ignore
global.Response = fetch.Response
;(async () => {
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  let bidder = Keypair.fromSecretKey(SECRET3)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  const nftAsset: NFTData = {
    type: "Nft",
    name: "aaa",
    symbol: "AAA",
    uri: "ipfs://nice/aaaa",
    isRepeating: false,
  }
  //const tokenAsset: TokenData = {
  //  type: "Token",
  //  decimals: 1,
  //  perCycleAmount: 1000,
  //  mintAddress: PublicKey.default.toString(),
  //}
  
  const auctionConfig: AuctionConfig = {
    id: "weheho",
    name: "Weheho",
    description: "this is a test",
    socials: ["aaa.aaa"],
    goalTreasuryAmount: null,
    ownerPubkey: auctionOwner.publicKey.toString(),
    asset: nftAsset,
    encorePeriod: 0,
    cyclePeriod: 86400,
    numberOfCycles: 20,
    startTime: null,
    minBid: 0.07,
  }
  // CREATE AUCTION
  //const startAuctionTx = await startAuction(auctionConfig);
  //console.log(startAuctionTx)
  //await sendTransaction(startAuctionTransaction, auctionOwner);
  //console.log("Auction created successfully.");
  // QUERY AUCTION
  //console.log(await auctionExists("gold-dao"))
  //const auction = await getAuction(auctionConfig.id)
  //console.log(auction)
  //const cycle = await getAuctionCycle(auction.rootStatePubkey, auction.currentCycle)
  //console.log(cycle)
  //const auctions = await getAuctions()
  //console.log(auctions)
  // MODIFY AUCTION
  //const modifyAuctionTx = await modifyAuction(
  //  auctionOwner.publicKey.toString(),
  //  "this-id",
  //  {
  //    //description: "this is a description",
  //    //socials: ["aaa.aaa", "bbb.bbb"]
  //    encorePeriod: 20,
  //  }
  //);
  //console.log(modifyAuctionTx.instructions[0])
  // CLAIM FUNDS
  //const claimFundsTx = await claimFunds(
  //  "loller",
  //  auctionOwner.publicKey.toString(),
  //  auctionOwner.publicKey.toString(),
  //  1,
  //  32.23
  //);
  //console.log(claimFundsTx)
  // PLACE BID
  //const placeBidTx = await placeBid(
  //  bidder.publicKey.toString(),
  //  "loller",
  //  3,
  //  12.3,
  //  //bidder.publicKey.toString(),
  //);
  // CLAIM REWARDS
  //const claimRewardsTx = await claimRewards(
  //  auctionOwner.publicKey.toString(),
  //  bidder.publicKey.toString(),
  //  "this-is-id",
  //  32,
  //  "Nft"
  //);
  //console.log(claimRewardsTx.instructions[0])
  // DELETE AUCTION
  //const deleteAuctionTx = await deleteAuction(
  //  "loller",//auction.id,
  //  auctionOwner.publicKey.toString(),//auction.ownerPubkey,
  //  1,//auction.currentCycle,
  //  bidder.publicKey.toString(),
  //);
  //console.log(deleteAuctionTx)
})()
