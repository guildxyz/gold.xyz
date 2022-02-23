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

export async function getAuctionCycle(rootStatePubkey: string, cycleNum: number): Promise<Cycle> {
  const { getAuctionCycleWasm, Pubkey } = await import("../../gold-wasm")
  let cycle
  try {
    cycle = await getAuctionCycleWasm(new Pubkey(rootStatePubkey), BigInt(cycleNum))
  } catch (error) {
    console.log("wasm error: ", error)
  }
  return cycle
}

export async function getAuctions(secondary?: boolean): Promise<Array<AuctionBase>> {
  const { getAuctionsWasm } = await import("../../gold-wasm")
  let flag = false
  if (secondary) {
    flag = true
  }
  let auctions
  try {
    auctions = await getAuctionsWasm(flag)
  } catch (error) {
    console.log("wasm error: ", error)
  }
  return auctions
}
