import { Keypair, PublicKey } from "@solana/web3.js"
import fetch from "node-fetch"
import { CONTRACT_ADMIN_KEYPAIR } from "./consts"
import { AuctionConfig, NFTData, TokenData } from "./queries/types"
import { SECRET2, SECRET3, sendTransaction } from "./test"
import { deleteAuctionAdmin } from "./transactions/deleteAuctionAdmin"
import { freezeAuction } from "./transactions/freezeAuction"
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
  const nftAsset: NFTData = {
    type: "NFT",
    name: "delete",
    symbol: "DELETE",
    uri: "delete/0.json",
    isRepeated: false,
  }

  const tokenAsset: TokenData = {
    type: "TOKEN",
    decimals: 1,
    perCycleAmount: 1000,
    mintAddress: PublicKey.default,
  }

  const auction: AuctionConfig = {
    id: "delete-this4",
    name: "Delete this4",
    description: "xd",
    socials: ["aaa.aaa"],
    goalTreasuryAmount: null,
    ownerPubkey: auctionOwner.publicKey,
    asset: tokenAsset,
    cyclePeriod: 60,
    numberOfCycles: 20,
    minBid: 0.01,
    startTimestamp: null,
  }

  

  // Create Auction
  //const startAuctionTransaction = await startAuction(auction);
  //await sendTransaction(startAuctionTransaction, auctionOwner);
  //console.log("Auction created successfully.");

  // Query auction
  //console.log(await getAuctions(CONNECTION))
  //console.log(await getAuction(auction.id))

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
  const freezeAuctionTransaction = await freezeAuction(auction.id, auction.ownerPubkey)
  await sendTransaction(freezeAuctionTransaction, auctionOwner)
  console.log("Auction frozen successfully.")

  //// Delete auction
  //const deleteAuctionTransaction = await deleteAuction(auction.id, auction.ownerPubkey)
  //await sendTransaction(deleteAuctionTransaction, CONTRACT_ADMIN_KEYPAIR)
  //console.log("Auction deleted successfully.")
  await deleteAuctionAdmin(auction.id, auctionOwner.publicKey, "./transactions/gold-admin-secret.json");
})()
