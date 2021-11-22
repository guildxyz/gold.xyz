global.TextEncoder = require("util").TextEncoder

import { Keypair, PublicKey } from "@solana/web3.js"
import { performance } from "perf_hooks"
import { CONNECTION } from "./consts"
import { getAuction } from "./queries/getAuctions"
import { getBidHistory, GetBidHistoryOptions } from "./queries/getBidHistory"
import { SECRET2 } from "./test"
;(async () => {
  // INITIALIZE CONTRACT
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //await init(auctionOwner.publicKey)
  // READ AUCTION STATE
  //let auctionBaseArray = await getAuctions(CONNECTION)
  //console.log("getAuctions:", auctionBaseArray)
  // START A NEW AUCTION
  //let newAuction: Auction = {
  //  id: "bargain-4",
  //  name: "Bargain 4",
  //  ownerPubkey: auctionOwner.publicKey,
  //  nftData: {
  //    name: "bargain4",
  //    symbol: "BARGAIN4",
  //    uri: "https://i.kym-cdn.com/entries/icons/original/000/022/916/doctor-strange-benedict-cumberbatch.jpg",
  //  },
  //  bids: [],
  //  cyclePeriod: 300,
  //  currentCycle: 1,
  //  numberOfCycles: 1,
  //  minBid: 2000,
  //  startTimestamp: 100000000,
  //  endTimestamp: 100010000,
  //  isActive: true,
  //  isFrozen: false,
  //}
  //let startAuctionTransaction = await startAuction(newAuction)
  //await sendTransaction(startAuctionTransaction, auctionOwner);

  let auction_id = "bargain-4"
  var auction = await getAuction(CONNECTION, auction_id)
  //console.log(await getAuction(CONNECTION, auction_id, 1))
  //console.log(await getAuction(CONNECTION, auction_id, 2))
  //console.log(await getAuction(CONNECTION, auction_id, 3))
  let auctionOwnerPubkey = new PublicKey(auction.ownerPubkey)
  //console.log("AUCTION OWNER:", auctionOwnerPubkey.toString())
  //console.log('getAuction("', auction_id, '")', auction)

  // AIRDROP TO BIDDER
  //let someUser = Keypair.fromSecretKey(SECRET3)
  //console.log("SOME USER: ", someUser.publicKey.toString())

  //let bidder = new Keypair()
  //console.log("NEW BIDDER: ", bidder.publicKey.toString())
  //await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(someUser.publicKey, 6_000_000_000))
  //console.log(await CONNECTION.getBalance(someUser.publicKey));
  //// PLACE A BID
  //let placeBidTransaction = await placeBid(
  //  CONNECTION,
  //	auction.id,
  //	auctionOwnerPubkey,
  //	3,
  //	someUser.publicKey,
  //);
  //console.log("sending bid transaction");
  //await sendTransaction(placeBidTransaction, someUser);
  //console.log("successfully placed a bid");
  //console.log(await CONNECTION.getBalance(someUser.publicKey));

  // CLOSE AUCTION CYCLE
  //for (let i = 0; i < 1; ++i){
  //  //await(await sleep(10000));
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
  //let deleteAuctionTransaction = await deleteAuction(
  //  CONNECTION,
  //  auction.id,
  //  auctionOwnerPubkey,
  //)
  //await sendTransaction(deleteAuctionTransaction, CONTRACT_ADMIN_KEYPAIR)
  //console.log("successfully deleted auction")

  // Get treasury funds
  //console.log('"Asd" treasury funds:', await getTreasuryFunds(CONNECTION, "asdasd"))
  //console.log('"New" treasury funds:', await getTreasuryFunds(CONNECTION, "new"))

  //
  let options = new GetBidHistoryOptions(30)

  let startTime = performance.now()
  const bidHistory = await getBidHistory(auction_id, options)
  let endTime = performance.now()
  console.log("Bid history query fetched in", endTime - startTime, "ms")
  console.log(bidHistory)

  let options2 = new GetBidHistoryOptions(
    30,
    "4uuM4QFGwpF1gPzZMX99QvczBf7QWbgo4oJLs7cznTCDGD4LebAWoLdXMyZyvMuEP71PfooanpR9nHpXmeBGkfVq"
  )

  let startTime2 = performance.now()
  const bidHistory2 = await getBidHistory(auction_id, options2)
  let endTime2 = performance.now()
  console.log("Bid history query fetched in", endTime2 - startTime2, "ms")
  console.log(bidHistory2)

  let options3 = new GetBidHistoryOptions(
    30,
    "bGNXwRmptLmWB7LBF1je7E1gKKArDrpG7GuBxaGaniKXe9tqVZjxBMRL7i2664kYsw4ow6PMx5px68gPNhxSRYG"
  )

  let startTime3 = performance.now()
  const bidHistory3 = await getBidHistory(auction_id, options3)
  let endTime3 = performance.now()
  console.log("Bid history query fetched in", endTime3 - startTime3, "ms")
  console.log(bidHistory3)
})()
