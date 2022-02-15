const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { getAuctionWasm } = await import("../wasm-factory")
  return getAuctionWasm(auction_id)
    .then(() => true)
    .catch((error) => {
      if (error.startsWith("error decoding response body")) return false
      console.log("wasm error: ", error)
      Promise.reject(error)
    })
}

export default auctionExists
