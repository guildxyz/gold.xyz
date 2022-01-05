import { Bid } from "./types"
import { LAMPORTS } from "../consts"

export async function getAvailableFunds(id: string, last_bid?: Bid): Promise<number> {
  const { getTreasuryWasm } = await import ("../../../wasm-factory")
  const sol = Number(await getTreasuryWasm(id)) / LAMPORTS
  let availableSol;
  if (last_bid) {
    availableSol = sol - last_bid.amount; 
  } else {
    availableSol = sol
  }

  if (availableSol < 0) {
    return 0
  } else {
    return Math.floor(availableSol * 100) / 100
  }
}
