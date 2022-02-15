import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react"
import useSWRImmutable from "swr/immutable"

type Credentials = {
  jwt: string
  key: string
}

const PinataContext = createContext<string>(null)

const fetchCredentials = async (_: string): Promise<Credentials> => {
  const response = await fetch("/api/pinata-key")
  return response.json()
}

const PinataProvider = ({
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  const {
    data: { jwt, key },
    mutate,
  } = useSWRImmutable("pinataJWT", fetchCredentials, {
    revalidateOnMount: true,
    fallbackData: { jwt: null, key: null },
  })

  const revokeKey = useCallback(() => {
    fetch("/api/pinata-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    }).then((response) => {
      if (response.ok) {
        mutate({
          jwt: null,
          key: null,
        })
      }
    })
  }, [key, mutate])

  useEffect(() => {
    window.addEventListener("beforeunload", revokeKey)
    return () => window.removeEventListener("beforeunload", revokeKey)
  }, [revokeKey])

  return <PinataContext.Provider value={jwt}>{children}</PinataContext.Provider>
}

const usePinataJWT = () => useContext(PinataContext)

export { PinataProvider, usePinataJWT }
