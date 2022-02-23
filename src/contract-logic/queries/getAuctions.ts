import { Connection, PublicKey } from "@solana/web3.js"
import { Auction, AuctionBase, NFTData, TokenData, Cycle} from "./types"

export async function getAuction(auctionId: string): Promise<Auction> {
  const { getAuctionWasm } = await import("../../gold-wasm")
  try {
    const auction = await getAuctionWasm(auctionId)
    return auction
  } catch (error) {
    console.log("wasm error: ", error)
  }
}

export async function getAuctionCycle(rootStatePubkey: string, cycleNum: number): Promise<Cycle> {
  const { getAuctionCycleWasm, Pubkey } = await import("../../gold-wasm")
  try {
    const cycle = await getAuctionCycleWasm(new Pubkey(rootStatePubkey), BigInt(cycleNum))
    return cycle
  } catch (error) {
    console.log("wasm error: ", error)
  }
}

export async function getAuctions(secondary?: boolean): Promise<Array<AuctionBase>> {
  const { getAuctionsWasm } = await import("../../gold-wasm")
  let flag = false
  if (secondary) {
    flag = true
  }
  try {
    const auctions = await getAuctionsWasm(flag)
    return auctions
  } catch (error) {
    console.log("wasm error: ", error)
  }
}
