const auctionExists = async (auction_id: string): Promise<boolean> => {
  const { auctionExistsWasm } = await import(`${process.env.NEXT_PUBLIC_GOLD_GLUE}`)
  return auctionExistsWasm(auction_id).then((exists) => exists)
}

export default auctionExists
