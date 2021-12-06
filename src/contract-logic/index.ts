import { Keypair } from "@solana/web3.js";
import { CONNECTION, CONTRACT_ADMIN_KEYPAIR } from "./consts";
import { AuctionConfig, getAuction, getAuctions } from "./queries/getAuctions";
import { SECRET2, SECRET3, sendTransaction } from "./test";
import { startAuction } from "./transactions/startAuction";
(async () => {
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  let bidder = Keypair.fromSecretKey(SECRET3)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //await initializeContract(auctionOwner.publicKey);

  const auction: AuctionConfig = {
    id: "aaa-aaa",
    name: "aaa-aaa",
    description: "aaa",
    socials: ["aaa.aaa"],
    goalTreasuryAmount: 100000000,
    ownerPubkey: auctionOwner.publicKey,
    asset: {
      type: "NFT",
      name: "aaa",
      symbol: "AAA",
      uri: "aaaa.json",
      isRepeated: false,
    },
    cyclePeriod: 60,
    numberOfCycles: 10,
    minBid: 10000,
    startTimestamp: null,
  }

  console.log(CONTRACT_ADMIN_KEYPAIR.publicKey.toString())
  console.log(await getAuctions(CONNECTION))

  // Create Auction
  const startAuctionTransaction = await startAuction(auction);
  await sendTransaction(startAuctionTransaction, auctionOwner);
  console.log("Auction created successfully.");

  // Query auction
  console.log(await getAuctions(CONNECTION))
  console.log("auction data:", await getAuction(CONNECTION, "small-fixes-test"))

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
