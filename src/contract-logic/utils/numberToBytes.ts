// Number to little endian bytes
function numberToBytes(num: number) {
  // we want to represent the input as a 8-bytes array
  const byteArray = [0, 0, 0, 0, 0, 0, 0, 0]

  for (let index = 0; index < byteArray.length; index++) {
    const byte = num & 0xff
    byteArray[index] = byte
    num = (num - byte) / 256
  }

  return byteArray
}

export default numberToBytes
