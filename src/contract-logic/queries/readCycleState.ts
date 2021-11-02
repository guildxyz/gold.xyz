import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { PROGRAM_ID } from "../consts"
import * as StateLayout from "../layouts/state"
import { numberToBytes } from "../utils/numberToBytes"

export async function readNthCycleState(
  connection: Connection,
  auctionOwnerPubkey: PublicKey,
  auctionId: Uint8Array,
  N: number
) {
  const [auctionRootStatePubkey, _y] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_root_state"), Buffer.from(auctionId), Buffer.from(auctionOwnerPubkey.toBytes())],
    PROGRAM_ID
  )
  const nthAuctionCycleStatePubkey = await getNthCycleStatePubkey(auctionRootStatePubkey, N)
  const nthAuctionCycleStateAccountInfo = await connection.getAccountInfo(nthAuctionCycleStatePubkey)
  const nthAuctionCycleStateData: Buffer = nthAuctionCycleStateAccountInfo!.data
  const nthAuctionCycleStateDeserialized = deserializeUnchecked(
    StateLayout.AUCTION_CYCLE_STATE_SCHEMA,
    StateLayout.AuctionCycleState,
    nthAuctionCycleStateData
  )

  return nthAuctionCycleStateDeserialized
}

export async function getNthCycleStatePubkey(auctionRootStatePubkey: PublicKey, N: number) {
  const [auctionCycleStatePubkey, _z] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_cycle_state"), Buffer.from(auctionRootStatePubkey.toBytes()), Buffer.from(numberToBytes(N))],
    PROGRAM_ID
  )
  return auctionCycleStatePubkey
}

export async function getNextCycleStatePubkey(connection: Connection, auctionRootStatePubkey: PublicKey) {
  const auctionRootStateAccount = await connection.getAccountInfo(auctionRootStatePubkey)
  const auctionRootStateAccountData: Buffer = auctionRootStateAccount!.data
  const auctionRootState = deserializeUnchecked(
    StateLayout.AUCTION_ROOT_STATE_SCHEMA,
    StateLayout.AuctionRootState,
    auctionRootStateAccountData
  )

  const cycle_number = +auctionRootState.status.currentAuctionCycle + 1
  const [auctionCycleStatePubkey, _z] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_cycle_state"),
      Buffer.from(auctionRootStatePubkey.toBytes()),
      Buffer.from(numberToBytes(cycle_number)),
    ],
    PROGRAM_ID
  )

  return auctionCycleStatePubkey
}

export async function getCurrentCycleStatePubkey(connection: Connection, auctionRootStatePubkey: PublicKey) {
  const auctionRootStateAccount = await connection.getAccountInfo(auctionRootStatePubkey)
  const auctionRootStateAccountData: Buffer = auctionRootStateAccount!.data
  const auctionRootState = deserializeUnchecked(
    StateLayout.AUCTION_ROOT_STATE_SCHEMA,
    StateLayout.AuctionRootState,
    auctionRootStateAccountData
  )

  const cycle_number = auctionRootState.status.currentAuctionCycle
  const [auctionCycleStatePubkey, _z] = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_cycle_state"),
      Buffer.from(auctionRootStatePubkey.toBytes()),
      Buffer.from(numberToBytes(cycle_number)),
    ],
    PROGRAM_ID
  )

  return auctionCycleStatePubkey
}

export async function getCurrentCycleState(connection: Connection, auctionRootStatePubkey: PublicKey) {
  const auctionCycleStatePubkey = await getCurrentCycleStatePubkey(connection, auctionRootStatePubkey)

  const auctionCycleStateAccount = await connection.getAccountInfo(auctionCycleStatePubkey)
  const auctionCycleStateAccountData: Buffer = auctionCycleStateAccount!.data
  const auctionCycleState = deserializeUnchecked(
    StateLayout.AUCTION_CYCLE_STATE_SCHEMA,
    StateLayout.AuctionCycleState,
    auctionCycleStateAccountData
  )
  return auctionCycleState
}
