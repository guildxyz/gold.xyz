import importGlue from "contract-logic/importGlue"
import limiter from "contract-logic/solanaLimiter"
import { Auction, AuctionBase, Cycle } from "./types"

async function getAuction(auctionId: string): Promise<Auction> {
  const { getAuctionWasm } = await importGlue()
  try {
    const auction = await getAuctionWasm(auctionId)
    return auction
  } catch (error) {
    console.log("wasm error: ", error)
  }
}

async function getAuctionCycle(rootStatePubkey: string, cycleNum: number): Promise<Cycle> {
  const { getAuctionCycleWasm, Pubkey } = await importGlue()
  try {
    const cycle = await getAuctionCycleWasm(new Pubkey(rootStatePubkey), BigInt(cycleNum))
    return cycle
  } catch (error) {
    console.log("wasm error: ", error)
  }
}

async function getAuctions(secondary: boolean): Promise<Array<AuctionBase>> {
  const { getAuctionsWasm } = await importGlue()
  try {
    const auctions = await getAuctionsWasm(!!secondary)
    return auctions
  } catch (error) {
    console.log("wasm error: ", error)
  }
}

const limitedGetAuction = limiter.wrap(getAuction)
const limitedGetAuctionCycle = limiter.wrap(getAuctionCycle)
const limitedGetAuctions = limiter.wrap(getAuctions)

export {
  limitedGetAuction as getAuction,
  limitedGetAuctionCycle as getAuctionCycle,
  limitedGetAuctions as getAuctions,
}
