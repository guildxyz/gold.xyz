import { Connection, PublicKey } from "@solana/web3.js"
import { deserializeUnchecked } from "borsh"
import { AuctionCycleState, AuctionRootState, SCHEMA } from "../schema"
import { numberToBytes } from "../utils/numberToBytes"
import { getCycleStatePubkeyWasm, getRootStatePubkeyWasm } from "../wasm-factory/instructions"

// ROOT STATES
export async function getRootState(connection: Connection, auctionRootStatePubkey: PublicKey) {
  const auctionRootStateAccount = await connection.getAccountInfo(auctionRootStatePubkey)
  const auctionRootStateAccountData: Buffer = auctionRootStateAccount!.data
  const auctionRootState = deserializeUnchecked(
    SCHEMA,
    AuctionRootState,
    auctionRootStateAccountData
  )
  return auctionRootState;
}

export async function getRootStatePubkey(auctionId: Uint8Array, auctionOwnerPubkey: PublicKey) {
  const pubkeyBytes = await getRootStatePubkeyWasm(auctionId, auctionOwnerPubkey.toBytes())
  return new PublicKey(pubkeyBytes);
}


// CYCLE STATES
export async function getNthCycleStatePubkey(auctionRootStatePubkey: PublicKey, n: number) {
  const pubkeyBytes = getCycleStatePubkeyWasm(auctionRootStatePubkey.toBytes(), numberToBytes(n));
  return new PublicKey(pubkeyBytes)
}

export async function readNthCycleState(connection: Connection, auctionRootStatePubkey: PublicKey, n: number) {
  const nthAuctionCycleStatePubkey = await getNthCycleStatePubkey(auctionRootStatePubkey, n)
  const nthAuctionCycleState = await getCycleState(connection, nthAuctionCycleStatePubkey);

  return nthAuctionCycleState;
}

export async function getCurrentCycleStatePubkey(connection: Connection, auctionRootStatePubkey: PublicKey) {
  const cycleNumber = await getCurrentCycleNumber(connection, auctionRootStatePubkey);
  const auctionCycleStatePubkey = getNthCycleStatePubkey(auctionRootStatePubkey, cycleNumber);

  return auctionCycleStatePubkey
}

export async function getCurrentCycleNumberFromId(connection: Connection, auctionId: Uint8Array, auctionOwnerPubkey: PublicKey) {
  const auctionRootStatePubkey = await getRootStatePubkey(auctionId, auctionOwnerPubkey);
  const cycleNumber = await getCurrentCycleNumber(connection, auctionRootStatePubkey);

  return cycleNumber
}

export async function getNextCycleStatePubkey(connection: Connection, auctionRootStatePubkey: PublicKey) {  
  const cycleNumber = +(await getCurrentCycleNumber(connection, auctionRootStatePubkey)) + 1;
  const auctionCycleStatePubkey = getNthCycleStatePubkey(auctionRootStatePubkey, cycleNumber);

  return auctionCycleStatePubkey
}

export async function getCurrentCycleState(connection: Connection, auctionRootStatePubkey: PublicKey) {
  const auctionCycleStatePubkey = await getCurrentCycleStatePubkey(connection, auctionRootStatePubkey)
  const cycleState = await getCycleState(connection, auctionCycleStatePubkey);
  
  return cycleState
}

export async function getCurrentCycleNumber(connection: Connection, auctionRootStatePubkey: PublicKey) {
  const auctionRootState = await getRootState(connection, auctionRootStatePubkey);

  return auctionRootState.status.currentAuctionCycle.toNumber();
}

export async function getCycleState(connection: Connection, auctionCycleStatePubkey: PublicKey) {
  const auctionCycleStateAccount = await connection.getAccountInfo(auctionCycleStatePubkey)
  const auctionCycleStateAccountData: Buffer = auctionCycleStateAccount!.data
  const auctionCycleState = deserializeUnchecked(
    SCHEMA,
    AuctionCycleState,
    auctionCycleStateAccountData
  )
  return auctionCycleState;
}
