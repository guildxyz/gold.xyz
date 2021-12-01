import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { METADATA_PROGRAM_ID, PREFIX, PROGRAM_ID } from "../consts"
import { Metadata, METADATA_SCHEMA } from "../metadata_schema"

export async function getMasterMetadata(
  connection: Connection,
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array
) {
  const [masterMint, _a] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
    ],
    PROGRAM_ID
  )
  const [masterMetadataPubkey, _b] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(masterMint.toBytes()),
    ],
    METADATA_PROGRAM_ID
  )

  let metadataAccount = await connection.getAccountInfo(masterMetadataPubkey)
  let metadataAccountData: Buffer = metadataAccount!.data
  let metadata = deserializeUnchecked(METADATA_SCHEMA, Metadata, metadataAccountData)

  const METADATA_REPLACE = new RegExp("\u0000", "g")

  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, "")
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, "")
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, "")

  return metadata.data
}
