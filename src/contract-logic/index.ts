import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { CONNECTION, PROGRAM_ID } from "./consts"
import { getAuction } from "./queries/getAuctions"
import { SECRET2, SECRET3 } from "./test"

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
  //  id: "bargain-2",
  //  name: "Bargain 2",
  //  ownerPubkey: auctionOwner.publicKey,
  //  nftData: {
  //    name: "bargain2",
  //    symbol: "BARGAIN2",
  //    uri: "https://i.kym-cdn.com/entries/icons/original/000/022/916/doctor-strange-benedict-cumberbatch.jpg",
  //  },
  //  bids: [],
  //  cyclePeriod: 30000,
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

  let auction_id = "bargain-2"
  var auction = await getAuction(CONNECTION, auction_id)
  console.log(await getAuction(CONNECTION, auction_id, 1))
  //console.log(await getAuction(CONNECTION, auction_id, 2))
  //console.log(await getAuction(CONNECTION, auction_id, 3))
  let auctionOwnerPubkey = new PublicKey(auction.ownerPubkey)
  console.log("AUCTION OWNER: ", auctionOwnerPubkey.toString())
  console.log('getAuction("', auction_id, '")', auction)
  // AIRDROP TO BIDDER
  let someUser = Keypair.fromSecretKey(SECRET3)
  console.log("SOME USER: ", someUser.publicKey.toString())

  //let bidder = new Keypair()
  //console.log("NEW BIDDER: ", bidder.publicKey.toString())
  //await CONNECTION.confirmTransaction(await CONNECTION.requestAirdrop(someUser.publicKey, 6_000_000_000))
  //console.log(await CONNECTION.getBalance(someUser.publicKey));
  //// PLACE A BID
  //let placeBidTransaction = await placeBid(
  //  CONNECTION,
  //	auction.id,
  //	auctionOwnerPubkey,
  //	2,
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

  // Get transactions
  const connection2ElectricBoogaloo = new Connection("https://api.devnet.solana.com", "confirmed")
  const all_signatures = await connection2ElectricBoogaloo.getSignaturesForAddress(PROGRAM_ID)
  const transaction = await connection2ElectricBoogaloo.getTransaction(all_signatures[1].signature)
  console.log(transaction)
  console.log(transaction.transaction)
  console.log(transaction.transaction.message.instructions)
  console.log(transaction.transaction.message.instructions[0].data)
  console.log(transaction.meta.innerInstructions)
  console.log(transaction.meta.innerInstructions[0].instructions)

  // Grogu
  // Start
  // 5fAzZW53rUK6dWGQ6DkEK2iRh9aLrPyJcxSn6j8CTebdQByFcYvGQtuy6tMuZ8HUAmX77mb5Dq9bLL6sqMmeC6p4WMAtudMqnGKhMW2JK2mapYgTvJeNaMa2DX11oTWELPeERANH75NQyMrqosKZX88MXs1AGiK1HCrwWnVyCyAqGdFUjtPeZcrn5eNxdKWNu46795adFB8NFmDeUBQGVex87sDtrSr7LxRj2gMLzmQUnCSUY83d1Gn99Vqaz1RWUfLSjseGTqZ36CEKr2FRwkQsFGUZdEJY2DV6ZZVBwbL7niTbKLNwdqb1Gi1xsKkDhCK
  // Bid
  // y2AJ1HJhLKAYw7by8n5Ye2oLXkwWyVvUa4eivwyi9dkFok8zojFZoe7
  // y2AJ1HJhLKAYw7by8n5Ye2oLXkwWyVvUa4eivwyi9dkFokwr3ysEgdu
  // CloseCycle
  // 21emK5tG9DUYqKCRM2YzLXQUuL5WQvwVQTmkvVkSbL3Ub

  for (let i = 0; i < 10; ++i) {
    const transaction = await connection2ElectricBoogaloo.getTransaction(all_signatures[i].signature)
    console.log(transaction.transaction.message.instructions[0].data)
  }

  // Swolo
  // Start
  //4WADXfxQcpNt4QnnCJjbPzDbJ366XyYo1zmhkwAyd2PPeXGi23uaV6RM4bv3JkXGpe1SK1suKMWghs4cH7X9oSBBteznfP4nFpvw8QXSp4qtHkL2MesvXTwnUStsWVZ9f7ubm5znDTLyeTCJuM1zhdHvArWmhRiP7yqDQ6pAe2Z8Pb4WLTGVFpLnsMorUuZ5WkKYVqShYUeDTYUb9dda9QaX8Ka3Xu1Pd2Hy3HFF72uzPSUBKeVfpfcGaxjkQXQGET6EV7WFpKAQErAfBmbD11
  //GThgJNwZF67aN414UuH2ARXhPSn7N5FGsMJWnMKwjjb1oE9WjviK2j9GKfUPyZLV7HXR4WT287Yja9Zxv7vw2RVQDmiR37CdChdk84TR1BrCD4Jz5TFcq4oMEWbY6UHK259XKUCq8WVx2Qa2yuvjxreRf64i9NkXCX1gQcsaAkXqwgydwY7hAwASPFtsBLYvrSDY1qyv3aTcsmYpfefFgvpM6W9JZBoo64Mw7gVYdWahXuu5GPxveq7jzCSfi55rEeFQr5XwXs4bKXAcBJvwmsV
  // Bid
  //xmc4S78ZydZJ2xTQ65LWC9nqn8s2iDnT13zo3BHzC99THXm88ZPKhqH
  //xmc4S78ZydZJ2xTQ65LWC9nqn8s2iDnT13zo3BHzC99Sv69nFd3E7C3
  //xmc4S78ZydZJ2xTQ65LWC9nqn8s2iDnT13zo3BHzC99Sv9yLSuwfV3D

  /*
  xmZTYa99SMEXycoecrKE8dQc6vV8DqiRWE2wRM51WuErtuB7aDffw6w
  xmZTYa99SMEXycoecrKE8dQc6vV8DqiRWE2wRM51WuErts7ZSsq8a4P
  
  
  xmZTYa99SMEXuiQ188ELJ8hCQoWciaGXaUogQnJJZoLH2bHcNufx8Sb
  xmZTYa99SMEXuiQ188ELJ8hCQoWciaGXaUogQnJJZoLH2ZE4FZqQmQ3
  */
})()
