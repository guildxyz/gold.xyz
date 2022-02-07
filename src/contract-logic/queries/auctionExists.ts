const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { getAuctionWasm } = await import("../wasm-factory")
  return getAuctionWasm(auction_id)
    .then(() => true)
    .catch((error) => {
      if (error.message === "no auction found with this id") return false
      console.log("wasm error: ", error)
      Promise.reject(error)
    })
}

export default auctionExists
