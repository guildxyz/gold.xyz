import importGlue from "contract-logic/importGlue"
import limiter from "contract-logic/solanaLimiter"

const auctionExists = limiter.wrap(async (auction_id: string): Promise<boolean> => {
  const { auctionExistsWasm } = await importGlue()
  return auctionExistsWasm(auction_id).then((exists) => exists)
})

export default auctionExists
