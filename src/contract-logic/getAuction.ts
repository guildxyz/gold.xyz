import { PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { Auction } from "types"
import {
  auctionOwner,
  connection,
  EDITION,
  METADATA_PROGRAM_ID,
  PREFIX,
  programId,
} from "./config"
import * as StateLayout from "./config/state_layout"

async function getAuction(): Promise<Auction> {
  // temporary dummy data until the function doesn't work correctly
  return {
    id: "0",
    name: "First auction",
    cyclePeriod: 64800,
    minBid: 300,
    numberOfCycles: 10,
    startTimestamp: 1634262267169,
    nftData: {
      name: "First NFT",
      symbol: "SYMB",
      uri: "https://storageapi.fleek.co/608ac2f5-df51-4e35-a363-1afacc7db6d3-bucket/dovalid_agora.png",
    },
  }

  const auctionId = new Uint8Array([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29, 30, 42,
  ]) //sha256(auction_name, auction_owner_pubkey); // TODO
  const [auctionStatePubkey] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_state"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwner.publicKey.toBytes()),
    ],
    programId
  )

  const auctionStateAccount = await connection.getAccountInfo(auctionStatePubkey)
  console.log("eddig fut")
  const auctionStateAccountData: Buffer = auctionStateAccount!.data
  const auctionState = deserializeUnchecked(
    StateLayout.AUCTION_STATE_SCHEMA,
    StateLayout.AuctionState,
    auctionStateAccountData
  )

  const [masterMintPubkey] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwner.publicKey.toBytes()),
    ],
    programId
  )
  const [masterEditionPubkey] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(masterMintPubkey.toBytes()),
      EDITION,
    ],
    METADATA_PROGRAM_ID
  )
  const masterEditionAccount = await connection.getAccountInfo(masterEditionPubkey)
  const masterEditionAccountData: Buffer = masterEditionAccount!.data
  const nftState = deserializeUnchecked(
    StateLayout.METADATA_SCHEMA,
    StateLayout.MasterEditionV2,
    masterEditionAccountData
  )

  console.log(auctionState)

  return {
    id: "TODO",
    name: "TODO",
    nftData: {
      name: "TODO",
      symbol: "TODO",
      uri: "TODO",
      supply: nftState.supply.toString(),
      maxSupply: nftState.maxSupply.toString(),
    },
    // bids: auctionState.bidHistory,
    // status: auctionState.status,
    cyclePeriod: auctionState.config.cyclePeriod,
    numberOfCycles: auctionState.config.numberOfCycles,
    minBid: auctionState.config.minimumBidAmount,
    startTimestamp: auctionState.startTime,
  }
}

export default getAuction
