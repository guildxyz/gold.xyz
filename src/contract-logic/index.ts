import { Keypair, PublicKey } from "@solana/web3.js"
import { CONNECTION, CONTRACT_ADMIN_PUBKEY } from "./consts"
import { getAuction, getAuctions } from "./queries/getAuctions"
import { init, SECRET2, SECRET3, sendTransaction } from "./test"
import { claimFunds } from "./transactions/claimFunds"
;(async () => {
  // INITIALIZE CONTRACT
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  await init(auctionOwner.publicKey)
  // READ AUCTION STATE
  let auctionBaseArray = await getAuctions(CONNECTION)
  console.log("getAuctions:", auctionBaseArray)
  // START A NEW AUCTION
  // let newAuction: Auction = {
  // 	id: "ordinary-wizarding-level",
  // 	name: "Ordinary Wizarding Level",
  // 	ownerPubkey: auctionOwner.publicKey,
  // 	nftData: {
  // 		name: "Ordinary Wizarding Level",
  // 		symbol: "OWL",
  // 		uri: "https://www.pixelstalk.net/wp-content/uploads/2016/08/Awesome-Sunset-Beaches-Images.jpg",
  // 	},
  // 	bids: [],
  // 	cyclePeriod: 60,
  // 	currentCycle: 1,
  // 	numberOfCycles: 15,
  // 	minBid: 2000,
  // 	startTimestamp: 100000000,
  // 	endTimestamp: 100010000,
  // };
  // let startAuctionTransaction = await startAuction(newAuction);
  // await sendTransaction(startAuctionTransaction, auctionOwner);
  const auction_id = "ordinary-wizarding-level"

  var auction = await getAuction(CONNECTION, auction_id)
  let auctionOwnerPubkey = new PublicKey(auction.ownerPubkey)
  console.log("AUCTION OWNER: ", auctionOwnerPubkey.toString())
  console.log('getAuction("', auction_id, '")', auction)
  // AIRDROP TO BIDDER
  let someUser = Keypair.fromSecretKey(SECRET3)
  console.log("SOME USER: ", someUser.publicKey.toString())
  await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(someUser.publicKey, 100000000))
  let bidder = new Keypair()
  console.log("NEW BIDDER: ", bidder.publicKey.toString())
  await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(bidder.publicKey, 100000000))
  await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(someUser.publicKey, 100000000))
  // PLACE A BID
  //let placeBidTransaction = await placeBid(
  //  CONNECTION,
  //	auction.id,
  //	auctionOwnerPubkey,
  //	7600000,
  //	bidder.publicKey,
  //);
  //await sendTransaction(placeBidTransaction, bidder);
  //console.log("successfully placed a bid");
  // CLOSE AUCTION CYCLE

  //let closeCycleTransaction = await closeCycle(
  //  CONNECTION,
  //	auctionOwnerPubkey,
  //	someUser.publicKey,
  //	auction.id,
  //	auction.currentCycle,
  //);
  //await sendTransaction(closeCycleTransaction, someUser);
  //console.log("successfully closed auction cycle");

  let claimFundsTransaction = await claimFunds(CONNECTION, CONTRACT_ADMIN_PUBKEY, auctionOwnerPubkey, auction.id, 1000)
  await sendTransaction(claimFundsTransaction, auctionOwner)
  //console.log("successfully claimed funds");
})()
