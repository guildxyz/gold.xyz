function padTo32Bytes(string: string) {
  const arr = Buffer.from(string)
  const diff = Math.max(32 - arr.length, 0)
  const pad = Buffer.from([...Array(diff)].map(() => "00").join(""), "hex")
  const newBuffer = Buffer.concat([arr, pad]).slice(0, 32)
  return newBuffer
}

export default padTo32Bytes
