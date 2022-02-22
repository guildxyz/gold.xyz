const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { auctionExistsWasm } = await import("gold-glue/wasm-bindings")
  return auctionExistsWasm(auction_id).then((exists) => exists)
}

export default auctionExists
