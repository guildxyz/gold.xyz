const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { auctionExistsWasm } = await import(
    `gold-glue${process.env.NODE_ENV === "production" || process.env.IS_VERCEL ? "" : "-dev"}`
  )
  return auctionExistsWasm(auction_id).then((exists) => exists)
}

export default auctionExists
