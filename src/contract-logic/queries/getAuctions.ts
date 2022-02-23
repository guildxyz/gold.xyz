import { Connection, PublicKey } from "@solana/web3.js"
import { Auction, AuctionBase, NFTData, TokenData, Cycle} from "./types"

export async function getAuction(auctionId: string): Promise<Auction> {
  const { getAuctionWasm } = await import("../../gold-wasm")
  let auction
  try {
    auction = await getAuctionWasm(auctionId)
  } catch (error) {
    console.log("wasm error: ", error)
  }
  return auction
}

export async function getAuctionCycle(auction
