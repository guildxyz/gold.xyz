import { PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import {
  CONNECTION,
  EDITION,
  METADATA_PROGRAM_ID,
  PREFIX,
  PROGRAM_ID,
} from "../consts"
import * as MetadataLayout from "../layouts/metadata"
import { numberToBytes } from "../utils/numberToBytes"

export class ChildEditionAccounts {
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

export async function getChildAccounts(
  auctionId: Uint8Array,
  auctionOwnerPubkey: PublicKey,
  nextEdition: number
) {
  const [mint, _d] = await PublicKey.findProgramAddress(
    [
      Buffer.from("child_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
      Buffer.from(numberToBytes(nextEdition)),
    ],
    PROGRAM_ID
  )
  const [holding, _e] = await PublicKey.findProgramAddress(
    [
      Buffer.from("child_holding"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
      Buffer.from(numberToBytes(nextEdition)),
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

  return new ChildEditionAccounts({ mint, holding, metadata, edition })
}

export async function getChildMetadata(
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array,
  nextEdition: number
) {
  const [childMintPubkey, _d] = await PublicKey.findProgramAddress(
    [
      Buffer.from("child_mint"),
      Buffer.from(auctionId),
      Buffer.from(auctionOwnerPubkey.toBytes()),
      Buffer.from(numberToBytes(nextEdition)),
    ],
    PROGRAM_ID
  )
  const [childMetadataPubkey, _f] = await PublicKey.findProgramAddress(
    [
      PREFIX,
      Buffer.from(METADATA_PROGRAM_ID.toBytes()),
      Buffer.from(childMintPubkey.toBytes()),
    ],
    METADATA_PROGRAM_ID
  )

  let metadataAccount = await CONNECTION.getAccountInfo(childMetadataPubkey)
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
