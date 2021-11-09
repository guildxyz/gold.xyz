import { Keypair, PublicKey } from "@solana/web3.js"
import { CONNECTION, CONTRACT_ADMIN_KEYPAIR } from "./consts"
import { Auction, getAuction, getAuctions } from "./queries/getAuctions"
import { SECRET2, SECRET3, sendTransaction } from "./test"
import { deleteAuction } from "./transactions/deleteAuction"
import { startAuction } from "./transactions/startAuction"

;(async () => {
  // INITIALIZE CONTRACT
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //await init(auctionOwner.publicKey)
  // READ AUCTION STATE
  let auctionBaseArray = await getAuctions(CONNECTION)
  console.log("getAuctions:", auctionBaseArray)
  // START A NEW AUCTION
  let newAuction: Auction = {
    id: "asdasd",
    name: "Asd",
    ownerPubkey: auctionOwner.publicKey,
    nftData: {
      name: "Asd",
      symbol: "ASD",
      uri: "https://www.pixelstalk.net/wp-content/uploads/2016/08/Awesome-Sunset-Beaches-Images.jpg",
    },
    bids: [],
    cyclePeriod: 5,
    currentCycle: 1,
    numberOfCycles: 15,
    minBid: 2000,
    startTimestamp: 100000000,
    endTimestamp: 100010000,
    isActive: true,
    isFrozen: false,
  }
  let startAuctionTransaction = await startAuction(newAuction)
  //await sendTransaction(startAuctionTransaction, auctionOwner);

  var auction = await getAuction(CONNECTION, newAuction.id)
  let auctionOwnerPubkey = new PublicKey(auction.ownerPubkey)
  console.log("AUCTION OWNER: ", auctionOwnerPubkey.toString())
  console.log('getAuction("', newAuction.id, '")', auction)
  // AIRDROP TO BIDDER
  let someUser = Keypair.fromSecretKey(SECRET3)
  console.log("SOME USER: ", someUser.publicKey.toString())
  await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(someUser.publicKey, 100000000))
  let bidder = new Keypair()
  console.log("NEW BIDDER: ", bidder.publicKey.toString())
  //await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(bidder.publicKey, 100000000))
  //await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(someUser.publicKey, 100000000))
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
  //for (let i = 3; i < 5; ++i){
  //  await(await sleep(10000));
  //  let closeCycleTransaction = await closeCycle(
  //    CONNECTION,
  //    auctionOwnerPubkey,
  //    someUser.publicKey,
  //    auction.id,
  //    i+1,
  //  );
  //  await sendTransaction(closeCycleTransaction, someUser);
  //  console.log("successfully closed auction cycle: ", i+1);
  //}

  // FREEZE AUCTION
  //let freezeTransaction = await freeze(CONNECTION, auctionOwnerPubkey, auction.id)
  //await sendTransaction(freezeTransaction, auctionOwner)
  //console.log("successfully frozen auction");

  // CLAIM FUNDS
  //let claimFundsTransaction = await claimFunds(CONNECTION, CONTRACT_ADMIN_PUBKEY, auctionOwnerPubkey, auction.id, 1000)
  //await sendTransaction(claimFundsTransaction, auctionOwner)
  //console.log("successfully claimed funds");

  // DELETE AUCTION
  let deleteAuctionTransaction = await deleteAuction(
    CONNECTION,
    CONTRACT_ADMIN_KEYPAIR,
    auction.id,
    auctionOwnerPubkey,
    100
  )
  await sendTransaction(deleteAuctionTransaction, CONTRACT_ADMIN_KEYPAIR)
  console.log("successfully deleted auction")
})()
