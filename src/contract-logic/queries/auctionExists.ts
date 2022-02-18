const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { auctionExists } = await import("../wasm-factory")
  return auctionExists(auction_id).then((exists) => exists)
}

export default auctionExists
