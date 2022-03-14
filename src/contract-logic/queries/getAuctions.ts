import importGlue from "contract-logic/importGlue"
import limiter from "contract-logic/solanaLimiter"
import { Auction, AuctionBase, Cycle } from "./types"

const getAuction = limiter.wrap(async (auctionId: string): Promise<Auction> => {
  const { getAuctionWasm } = await importGlue()
  try {
    const auction = await getAuctionWasm(auctionId)
    return auction
  } catch (error) {
    console.log("wasm error: ", error)
  }
})

const getAuctionCycle = limiter.wrap(
  async (rootStatePubkey: string, cycleNum: number): Promise<Cycle> => {
    const { getAuctionCycleWasm, Pubkey } = await importGlue()
    try {
      const cycle = await getAuctionCycleWasm(new Pubkey(rootStatePubkey), BigInt(cycleNum))
      return cycle
    } catch (error) {
      console.log("wasm error: ", error)
    }
  }
)

const getAuctions = limiter.wrap(async (secondary: boolean): Promise<Array<AuctionBase>> => {
  const { getAuctionsWasm } = await importGlue()
  try {
    const auctions = await getAuctionsWasm(!!secondary)
    return auctions
  } catch (error) {
    console.log("wasm error: ", error)
  }
})

export { getAuction, getAuctionCycle, getAuctions }
