import { useCallback, useEffect } from "react"
import useSWRImmutable from "swr/immutable"

const fetchCredentials = (_: string) => {
  console.log("Generating Pinata key...")
  return fetch("/api/pinata-key").then((response) =>
    response
      .json()
      .then((body) => ({ jwt: body.jwt as string, key: body.key as string }))
  )
}

const usePinataCredentials = () => {
  const {
    data: { jwt, key },
    mutate,
  } = useSWRImmutable("pinataJWT", fetchCredentials, {
    revalidateOnMount: false, // Do not fetch until first Pinata request is made
    fallbackData: {
      jwt: null,
      key: null,
    },
  })

  const revokeKey = useCallback(() => {
    console.log("Revoking Pinata key...")
    fetch("/api/pinata-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })
  }, [key])

  useEffect(() => {
    window.addEventListener("beforeunload", revokeKey)
    return () => window.removeEventListener("beforeunload", revokeKey)
  }, [revokeKey])

  const getJWT = useCallback(async () => {
    if (!jwt) {
      const data = await mutate()
      console.log("Using Pinata key to make a request...")
      return data.jwt
    }
    console.log("Using Pinata key to make a request...")
    return jwt
  }, [jwt, mutate])

  return getJWT
}

export default usePinataCredentials
