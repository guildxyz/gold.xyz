import Bottleneck from "bottleneck"
import shortenHex from "./shortenHex"

export type PinataPinFileResponse = {
  IpfsHash: string
  PinSize: number
  Timestamp: string
  isDuplicate?: boolean
}

export type PinToIPFSProps = {
  jwt: string
  data: (File | string)[]
  fileNames?: string[]
  pinataOptions?: {
    cidVersion?: "0" | "1"
    wrapWithDirectory?: boolean
    customPinPolicy?: {
      regions: Array<{ id: "FRA1" | "NYC1"; desiredReplicationCount: 0 | 1 | 2 }>
    }
  }
  pinataMetadata?: {
    name?: string
    keyvalues?: Record<string, string | number | Date>
  }
  onProgress?: (progress: number) => void
}

const pinataLimiter = new Bottleneck({
  minTime: 2000, // 60_000 / 30 -> 30 requests / min rate limit
})

const pinFileToIPFS = ({
  data,
  fileNames = [""],
  pinataOptions = {},
  pinataMetadata = {},
  jwt,
  onProgress,
}: PinToIPFSProps) =>
  pinataLimiter.schedule(
    () =>
      new Promise<PinataPinFileResponse>(async (resolve, reject) => {
        const formData = new FormData()

        if (data.length <= 0)
          reject(
            "This shouldn't happen. Tried to upload 0 images, please contact us on Discord"
          )
        if (data.length !== fileNames.length)
          reject(
            "This shouldn't happen. Wrong number of images passed, please contact us on Discord"
          )
        data.forEach((d, index) => {
          if (typeof d === "string") {
            const blob = new Blob([d])
            formData.append("file", blob, fileNames[index])
          } else {
            formData.append("file", d)
          }
        })

        if (Object.keys(pinataOptions).length > 0) {
          formData.append("pinataOptions", JSON.stringify(pinataOptions))
        }

        if (Object.keys(pinataMetadata).length > 0) {
          formData.append("pinataMetadata", JSON.stringify(pinataMetadata))
        }

        const xhr = new XMLHttpRequest()
        xhr.open("POST", "https://api.pinata.cloud/pinning/pinFileToIPFS")
        xhr.setRequestHeader("Authorization", `Bearer ${jwt}`)

        xhr.upload.onprogress = (event) =>
          onProgress?.((event.loaded / event.total) * 0.9)
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress?.(1)
            resolve(JSON.parse(xhr.response))
          } else {
            onProgress?.(0)
            if (xhr.status === 401) reject("Invalid authorization")
            else reject("Upload request failed")
          }
        }
        xhr.onerror = () => reject("Upload request failed")

        xhr.onabort = () => reject("Upload request aborted")

        console.log("JWT used for request:", shortenHex(jwt))
        xhr.send(formData as any)
      })
  )

export default pinFileToIPFS
