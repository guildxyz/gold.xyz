import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import useSWRImmutable from "swr/immutable"
import pinFileToIPFS, { PinToIPFSProps } from "utils/pinataUpload"

type Credentials = {
  jwt: string
  key: string
}

const usePinata = () => {
  const router = useRouter()
  const [revokeFetchOptions, setRevokeFetchOptions] = useState<RequestInit>(null)

  const { data } = useSWRImmutable<Credentials>(
    ["/api/pinata-key", revokeFetchOptions],
    {
      revalidateOnMount: true,
    }
  )

  const revokeKey = useCallback(() => {
    if (!data?.key) return
    setRevokeFetchOptions({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: data?.key }),
    })
  }, [data])

  useEffect(() => {
    router.events.on("routeChangeStart", revokeKey)
    return () => router.events.off("routeChangeStart", revokeKey)
  }, [revokeKey, router.events])

  useEffect(() => {
    window.addEventListener("beforeunload", revokeKey)
    return () => window.removeEventListener("beforeunload", revokeKey)
  }, [revokeKey])

  const pinFile = useCallback(
    (props: Omit<PinToIPFSProps, "jwt">) =>
      pinFileToIPFS({ ...props, jwt: data?.jwt }),
    [data]
  )

  return {
    pinFile,
  }
}

export default usePinata
