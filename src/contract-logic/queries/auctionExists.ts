const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { auctionExistsWasm } = await import("../../gold-wasm")
  return auctionExistsWasm(auction_id).then((exists) => exists)
}

export default auctionExists
