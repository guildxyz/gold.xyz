import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { EDITION, METADATA_PROGRAM_ID, PREFIX, PROGRAM_ID } from "../consts"
import * as MetadataLayout from "../layouts/metadata"

export class MasterEditionAccounts {
  mint: PublicKey
  holding: PublicKey
  metadata: PublicKey
  edition: PublicKey
  constructor(args: {
    mint: PublicKey
    holding: PublicKey
    metadata: PublicKey
    edition: PublicKey
  }) {
    this.mint = args.mint
    this.holding = args.holding
    this.metadata = args.metadata
    this.edition = args.edition
  }
}

export async function getMasterAccounts(
  connection: Connection,
  auctionId: Uint8Array,
  auctionOwnerPubkey: PublicKey
) {
  const [mint, _d] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
    ],
    PROGRAM_ID
  )
  const [holding, _e] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master_holding"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
    ],
    PROGRAM_ID
  )
  const [metadata, _f] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(mint.toBytes()),
    ],
    METADATA_PROGRAM_ID
  )
  const [edition, _g] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(mint.toBytes()),
      EDITION,
    ],
    METADATA_PROGRAM_ID
  )

  return new MasterEditionAccounts({ mint, holding, metadata, edition })
}

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
  let metadata = deserializeUnchecked(
    MetadataLayout.METADATA_SCHEMA,
    MetadataLayout.Metadata,
    metadataAccountData
  )

  const METADATA_REPLACE = new RegExp("\u0000", "g")

  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, "")
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, "")
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, "")

  return metadata.data
}
