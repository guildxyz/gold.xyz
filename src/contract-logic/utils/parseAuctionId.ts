export function parseAuctionId(auctionId: Uint8Array): string {
    let firstZeroIndex = auctionId.indexOf(0);
    let result = Buffer.from(auctionId.slice(0, firstZeroIndex));
    return result.toString();
}
