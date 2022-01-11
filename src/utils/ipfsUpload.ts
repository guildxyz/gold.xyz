import https from "https"
import { CID, create } from "ipfs-http-client"
import { HTTPClientExtraOptions } from "ipfs-http-client/types/src/types"

// Couldn only import these types from "node_modules/ipfs-core-types/src/root.ts" by relative path, figured its better this way
type AddOptions = {
  chunker?: string
  cidVersion?: 0 | 1
  hashAlg?: string
  onlyHash?: boolean
  pin?: boolean
  progress?: (bytes: number, path?: string) => void
  rawLeaves?: boolean
  trickle?: boolean
  wrapWithDirectory?: boolean
  preload?: boolean
  blockWriteConcurrency?: number
  signal?: AbortSignal
  timeout?: number
}

type AddResult = {
  cid: CID
  size: number
  path: string
  mode?: number
  mtime?: {
    secs: number
    nsecs?: number
  }
}

const client = create({
  url: "https://ipfs.infura.io:5001/api/v0",
  agent: new https.Agent({ keepAlive: true }),
})

const textEncoder = new TextEncoder()

type Props = {
  data: ArrayBuffer | string
  path?: string
  onProgress?: (progress: number) => void
} & AddOptions &
  HTTPClientExtraOptions

const ipfsUpload = async ({
  data,
  path,
  onProgress,
  ...addOptions
}: Props): Promise<AddResult> => {
  const dataToUpload =
    typeof data === "string" ? textEncoder.encode(data).buffer : data

  return client.add(path ? { path, content: dataToUpload } : dataToUpload, {
    ...addOptions,
    progress: (bytes, _path) => {
      onProgress?.(bytes / dataToUpload.byteLength)
      addOptions?.progress?.(bytes, _path)
    },
    headers: {
      authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_INFURA_ID}:${process.env.NEXT_PUBLIC_INFURA_SECRET}`
      ).toString("base64")}`,
    },
    wrapWithDirectory: !!path,
  })
}

const ipfsUploadAll = async ({ data, ...addOptions }) => {
  let dir = null

  for await (const file of client.addAll(
    data.map((content, index) => ({ path: `${index}.json`, content })),
    {
      ...addOptions,
      headers: {
        authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_INFURA_ID}:${process.env.NEXT_PUBLIC_INFURA_SECRET}`
        ).toString("base64")}`,
      },
      wrapWithDirectory: true,
    }
  )) {
    dir = file
  }

  return dir
}

export { ipfsUploadAll }
export default ipfsUpload
