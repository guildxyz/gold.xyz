import { useCallback, useEffect } from "react"
import useSWRImmutable from "swr/immutable"

type Credentials = {
  jwt: string
  key: string
}

const fetchCredentials = async (_: string): Promise<Credentials> => {
  const response = await fetch("/api/pinata-key")
  return response.json()
}

const usePinataJWT = () => {
  const swrResponse = useSWRImmutable("pinataJWT", fetchCredentials, {
    revalidateOnMount: true,
    fallbackData: { jwt: null, key: null },
  })

  const revokeKey = useCallback(() => {
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
    })
  }, [swrResponse])

  useEffect(() => {
    window.addEventListener("beforeunload", revokeKey)
    return () => window.removeEventListener("beforeunload", revokeKey)
  }, [revokeKey])

  return {
    ...swrResponse,
    jwt: swrResponse.data.jwt,
  }
}

export default usePinataJWT
