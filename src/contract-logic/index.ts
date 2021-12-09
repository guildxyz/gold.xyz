import { Keypair, PublicKey } from "@solana/web3.js"
import { CONNECTION, CONTRACT_ADMIN_KEYPAIR } from "./consts"
import { AuctionConfig, getAuction, getAuctions, NFTData, TokenData } from "./queries/getAuctions"
import { SECRET2, SECRET3, sendTransaction } from "./test"
import { deleteAuction } from "./transactions/deleteAuction"
import { freezeAuction } from "./transactions/freezeAuction"
import { startAuction } from "./transactions/startAuction"
import { placeBid } from "./transactions/placeBid"
;(async () => {
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  let bidder = Keypair.fromSecretKey(SECRET3)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  console.log("CONTRACT ADMIN", CONTRACT_ADMIN_KEYPAIR.publicKey.toString())
  //await initializeContract(auctionOwner.publicKey);

  const nftAsset: NFTData = {
    type: "NFT",
    name: "aaa",
    symbol: "AAA",
    uri: "aaaa/0.json",
    isRepeated: false,
  }

  const tokenAsset: TokenData = {
    type: "TOKEN",
    decimals: 1,
    perCycleAmount: 1000,
    mintAddress: PublicKey.default,
  }

  const auction: AuctionConfig = {
    id: "nft-test",
    name: "NFT Test",
    description: "xd",
    socials: ["aaa.aaa"],
    goalTreasuryAmount: 100000000,
    ownerPubkey: auctionOwner.publicKey,
    asset: nftAsset,
    cyclePeriod: 60,
    numberOfCycles: 20,
    minBid: 10000,
    startTimestamp: null,
  }

  // Create Auction
  //const startAuctionTransaction = await startAuction(auction);
  //await sendTransaction(startAuctionTransaction, auctionOwner);
  //console.log("Auction created successfully.");

  // Query auction
  console.log(await getAuctions(CONNECTION))
  console.log("auction data:", await getAuction(CONNECTION, "nft-test"))

  // Bid on an auction
  //CONNECTION.requestAirdrop(bidder.publicKey, 100000000);
  //const bidTransaction = await placeBid(CONNECTION, auction.id, bidder.publicKey, 234000);
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
