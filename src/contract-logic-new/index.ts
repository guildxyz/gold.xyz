import { Keypair } from "@solana/web3.js"
import { CONNECTION } from "./consts"
import { Auction, getAuction, getAuctions } from "./queries/getAuctions"
import { SECRET2, SECRET3 } from "./test"

;(async () => {
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  let bidder = Keypair.fromSecretKey(SECRET3)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //await initializeContract(auctionOwner.publicKey);

  /*
  export type Auction = AuctionBase & {
    description: string
    socials: string[]
    asset: NFTData | TokenData
    bids: Bid[]
    cyclePeriod: number
    currentCycle: number
    numberOfCycles: number
    minBid: number
    startTimestamp: number
    endTimestamp: number
    isActive: boolean
    isFrozen: boolean
  }
  */
  const auction: Auction = {
    id: "something",
    name: "Something",
    description: "Some cool description of the auction",
    socials: ["this.com", "that.xyz"],
    goalTreasuryAmount: 100000000,
    currentTreasuryAmount: 0,
    ownerPubkey: auctionOwner.publicKey,
    asset: {
      type: "NFT",
      name: "test-nft",
      symbol: "TEST",
      uri: "test.json",
      isRepeated: false,
    },
    currentCycle: 1,
    bids: [],
    cyclePeriod: 300,
    numberOfCycles: 5,
    minBid: 10000,
    startTimestamp: 0,
    endTimestamp: 0,
    isActive: true,
    isFrozen: false,
  }

  // Create Auction
  //const startAuctionTransaction = await startAuction(auction, auctionOwner.publicKey);
  //await sendTransaction(startAuctionTransaction, auctionOwner);
  //console.log("Auction created successfully.");

  // Query auction
  console.log(await getAuctions(CONNECTION))
  console.log("auction data:", await getAuction(CONNECTION, auction.id))

  // Bid on an auction
  //const bidTransaction = await placeBid(auctionOwner.publicKey, auction.id, bidder.publicKey, 100000);
  //await sendTransaction(bidTransaction, bidder);
  //console.log("Bid placed successfully.");

  // Freeze auction
  //const freezeAuctionTransaction = await freezeAuction(auctionOwner.publicKey, auction.id)
  //await sendTransaction(freezeAuctionTransaction, auctionOwner)
  //console.log("Auction frozen successfully.")

  // Delete auction
  //const deleteAuctionTransaction = await deleteAuction(
  //  auctionOwner.publicKey,
  //  auction.id
  //)
  //await sendTransaction(deleteAuctionTransaction, CONTRACT_ADMIN_KEYPAIR)
  //console.log("Auction deleted successfully.")

  //console.log( await getAuctions(CONNECTION) );
  console.log("start")
})()
