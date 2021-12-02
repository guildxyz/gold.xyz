import { BinaryReader, BinaryWriter } from "borsh"
import { PublicKey } from "@solana/web3.js"

export const borshPublicKey = () => {
  ;(BinaryReader.prototype as any).readPublicKey = function () {
    const reader = this as unknown as BinaryReader
    const array = reader.readFixedArray(32)
    return new PublicKey(array)
  }
  ;(BinaryWriter.prototype as any).writePublicKey = function (value: PublicKey) {
    const writer = this as unknown as BinaryWriter
    writer.writeFixedArray(value.toBytes())
  }
}
