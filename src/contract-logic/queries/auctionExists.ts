const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { isIdUniqueWasm } = await import("../wasm-factory")
  return isIdUniqueWasm(auction_id).then((isUnique) => !isUnique)
}

export default auctionExists
