import { Keypair, PublicKey } from "@solana/web3.js";
import { promises as fs } from "fs";
import { sendTransaction } from "../test";
import { deleteAuction } from "./deleteAuction";

export async function deleteAuctionAdmin(
    auctionId: string,
    auctionOwnerPubkey: PublicKey,
    adminSecretFilepath: string
) {
    const contractAdminSecret = await fs.readFile(adminSecretFilepath, 'utf8');
    const contractAdminKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(contractAdminSecret)));

    /*
    const auction = (await getAuction(auctionId));
    const auctionOwnerPubkey = auction.ownerPubkey
    */

    const deleteAuctionTransaction = await deleteAuction(auctionId, auctionOwnerPubkey)
    await sendTransaction(deleteAuctionTransaction, contractAdminKeypair)
    console.log("Auction deleted successfully.")
}
