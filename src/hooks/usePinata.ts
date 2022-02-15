import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"
import useSWRImmutable from "swr/immutable"
import pinFileToIPFS, { PinToIPFSProps } from "utils/pinataUpload"

type Credentials = {
  jwt: string
  key: string
}

const fetchCredentials = async (_: string): Promise<Credentials> => {
  const response = await fetch("/api/pinata-key")
  return response.json()
}

const usePinata = () => {
  const router = useRouter()

  const swrResponse = useSWRImmutable("pinataJWT", fetchCredentials, {
    revalidateOnMount: true,
    dedupingInterval: 60_000,
    fallbackData: { jwt: null, key: null },
  })

  const revokeKey = useCallback(
    () =>
      fetch("/api/pinata-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: swrResponse.data.key }),
      }).then((response) => {
        if (response.ok) {
          swrResponse.mutate({
            jwt: null,
            key: null,
          })
        }
      }),
    [swrResponse]
  )

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
      pinFileToIPFS({ ...props, jwt: swrResponse.data.jwt }),
    [swrResponse]
  )

  return {
    ...swrResponse,
    jwt: swrResponse.data.jwt,
    pinFile,
  }
}

export default usePinata
