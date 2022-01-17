import { Keypair, PublicKey } from "@solana/web3.js"
import fetch from "node-fetch"
import { CONNECTION, CONTRACT_ADMIN_KEYPAIR } from "./consts"
import { getAuction, getAuctions, getAuctionCycle } from "./queries/getAuctions"
import { AuctionConfig, NFTData, TokenData } from "./queries/types"
import { claimFunds } from "./transactions/claimFunds"
import { freezeAuction } from "./transactions/freezeAuction"
import { placeBid } from "./transactions/placeBid"
import { startAuction } from "./transactions/startAuction"
import { SECRET2, SECRET3 } from "./test"
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
  console.log("CONTRACT ADMIN", CONTRACT_ADMIN_KEYPAIR.publicKey.toString())
  //await initializeContract(auctionOwner.publicKey);
  //const nftAsset: NFTData = {
  //  type: "NFT",
  //  name: "aaa",
  //  symbol: "AAA",
  //  uri: "aaaa/0.json",
  //  isRepeated: false,
  //}

  //const tokenAsset: TokenData = {
  //  type: "TOKEN",
  //  decimals: 1,
  //  perCycleAmount: 1000,
  //  mintAddress: PublicKey.default,
  //}

  //const auction: AuctionConfig = {
  //  id: "totally-three",
  //  name: "Totally Three",
  //  description: "xd",
  //  socials: ["aaa.aaa"],
  //  goalTreasuryAmount: null,
  //  ownerPubkey: auctionOwner.publicKey,
  //  asset: nftAsset,
  //  cyclePeriod: 60,
  //  numberOfCycles: 20,
  //  minBid: 0.01,
  //  startTimestamp: null,
  //}

  // Create Auction
  //const startAuctionTransaction = await startAuction(auction);
  //await sendTransaction(startAuctionTransaction, auctionOwner);
  //console.log("Auction created successfully.");
  // Query auction
  //console.log(await getAuctions(CONNECTION))
  const auction = await getAuction("goldxyz-dao");
  console.log(auction);
  console.log(await getAuctionCycle(auction.rootStatePubkey, 1))
  // CLAIM FUNDS
  //let claimFundsTransaction = await claimFunds(auction.id, auctionOwner.publicKey, 0.5)
  //await sendTransaction(claimFundsTransaction, auctionOwner)
  //console.log("successfully claimed funds");
  // Bid on an auction
  //CONNECTION.requestAirdrop(bidder.publicKey, 100000000);
  //const bidTransaction = await placeBid(auction.id, bidder.publicKey, 0.6);
  //await sendTransaction(bidTransaction, bidder);
  //console.log("Bid placed successfully.");
  //console.log(await getAuction("totally-three"))

  // Freeze auction
  //const freezeAuctionTransaction = await freezeAuction(auction.id, auction.ownerPubkey)
  //await sendTransaction(freezeAuctionTransaction, auctionOwner)
  //console.log("Auction frozen successfully.")

  //// Delete auction
  //const deleteAuctionTransaction = await deleteAuction(auction.id, auction.ownerPubkey)
  //await sendTransaction(deleteAuctionTransaction, CONTRACT_ADMIN_KEYPAIR)
  //console.log("Auction deleted successfully.")
})()
