import { Keypair } from "@solana/web3.js"
import { CONTRACT_ADMIN_KEYPAIR } from "./consts"
import { SECRET2, SECRET3, sendTransaction } from "./test"
import { deleteAuction } from "./transactions/deleteAuction"
import { freeze } from "./transactions/freeze"

;(async () => {
  let auctionOwner = Keypair.fromSecretKey(SECRET2)
  let bidder = Keypair.fromSecretKey(SECRET3)
  console.log("AUCTION OWNER", auctionOwner.publicKey.toString())
  //await initializeContract(auctionOwner.publicKey);

  const auctionId = Uint8Array.from([
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 0,
  ])

  //const startAuctionTransaction = await startAuction(auctionOwner.publicKey, auctionId);
  //await sendTransaction(startAuctionTransaction, auctionOwner);
  //console.log("Auction created successfully.");

  // Don't bid until topBidder queries are use in the following instructions
  //const bidTransaction = await placeBid(auctionOwner.publicKey, auctionId, bidder.publicKey);
  //await sendTransaction(bidTransaction, bidder);
  //console.log("Bid placed successfully.");

  const freezeAuctionTransaction = await freeze(auctionOwner.publicKey, auctionId)
  await sendTransaction(freezeAuctionTransaction, auctionOwner)
  console.log("Auction frozen successfully.")

  const deleteAuctionTransaction = await deleteAuction(
    auctionOwner.publicKey,
    auctionId
  )
  await sendTransaction(deleteAuctionTransaction, CONTRACT_ADMIN_KEYPAIR)
  console.log("Auction deleted successfully.")
})()
