import { Keypair, PublicKey } from "@solana/web3.js";
import { CONNECTION } from "./consts";
import { AuctionConfig, getAuction, getAuctions, NFTData, TokenData } from "./queries/getAuctions";
import { SECRET2, SECRET3, sendTransaction } from "./test";
import { startAuction } from "./transactions/startAuction";
(async () => {
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  let bidder = Keypair.fromSecretKey(SECRET3)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //await initializeContract(auctionOwner.publicKey);

  const nftAsset: NFTData = {
    type: "NFT",
    name: "test-nft",
    symbol: "TEST",
    uri: "test.json",
    isRepeated: false,
  };

  const tokenAsset: TokenData = {
    type: "TOKEN",
    decimals: 1,
    mintAddress: PublicKey.default,
    perCycleAmount: 100,
  }

  const auction: AuctionConfig = {
    id: "small-fixes-test-token",
    name: "Small fixes test token",
    description: "Let's see if it works",
    socials: ["gold.xyz"],
    goalTreasuryAmount: 100000000,
    ownerPubkey: auctionOwner.publicKey,
    asset: tokenAsset,
    cyclePeriod: 60,
    numberOfCycles: 10,
    minBid: 10000,
    startTimestamp: null,
  }

  // Create Auction
  const startAuctionTransaction = await startAuction(auction);
  await sendTransaction(startAuctionTransaction, auctionOwner);
  console.log("Auction created successfully.");

  // Query auction
  console.log(await getAuctions(CONNECTION))
  console.log("auction data:", await getAuction(CONNECTION, auction.id))

  // Bid on an auction
  //const bidTransaction = await placeBid(CONNECTION, auction.id, auctionOwner.publicKey, bidder.publicKey, 100000);
  //await sendTransaction(bidTransaction, bidder);
  //console.log("Bid placed successfully.");

  // Freeze auction
  //const freezeAuctionTransaction = await freezeAuction(CONNECTION, auction.id, auctionOwner.publicKey)
  //await sendTransaction(freezeAuctionTransaction, auctionOwner)
  //console.log("Auction frozen successfully.")

  // Delete auction
  //const deleteAuctionTransaction = await deleteAuction(
  //  CONNECTION,
  //  auction.id,
  //  auctionOwner.publicKey
  //)
  //await sendTransaction(deleteAuctionTransaction, CONTRACT_ADMIN_KEYPAIR)
  //console.log("Auction deleted successfully.")
})()
