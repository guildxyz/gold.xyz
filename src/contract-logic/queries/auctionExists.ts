import importGlue from "contract-logic/importGlue"

const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { auctionExistsWasm } = await importGlue()
  return auctionExistsWasm(auction_id).then((exists) => exists)
}

export default auctionExists
