// Number to little endian bytes
export function bytesToNumber(byteArray: Uint8Array) {
  var value = 0
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i]
  }

  return value
}
