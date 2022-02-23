import pinFileToIPFS, { PinToIPFSProps } from "hooks/usePinata/utils/pinataUpload"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import useSWRImmutable from "swr/immutable"

type Credentials = {
  jwt: string
  key: string
}

const usePinata = () => {
  const router = useRouter()
  // really hacky way to revoke so we can use SWR's state management
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
      pinFileToIPFS({ ...props, jwt: data?.jwt }).catch((reason) => {
        if (reason === "Invalid authorization") {
          setRevokeFetchOptions(null)
          throw reason
        } else throw reason
      }),
    [data]
  )

  return pinFile
}

export default usePinata
