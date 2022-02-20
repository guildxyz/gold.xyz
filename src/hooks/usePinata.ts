import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"
import useSWRImmutable from "swr/immutable"
import fetcher from "utils/fetcher"
import pinFileToIPFS, { PinToIPFSProps } from "utils/pinataUpload"

type Credentials = {
  jwt: string
  key: string
}

const usePinata = () => {
  const router = useRouter()

  const swrResponse = useSWRImmutable<Credentials>("/api/pinata-key", {
    revalidateOnMount: true,
    dedupingInterval: 60_000,
    fallbackData: { jwt: null, key: null },
  })

  const revokeKey = useCallback(
    () =>
      fetcher("/api/pinata-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: swrResponse.data.key }),
      }).then(() => {
        swrResponse.mutate({
          jwt: null,
          key: null,
        })
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
