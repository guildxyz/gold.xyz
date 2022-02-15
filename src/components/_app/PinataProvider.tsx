import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react"
import useSWRImmutable from "swr/immutable"
import pinFileToIPFS, {
  PinataPinFileResponse,
  PinToIPFSProps,
} from "utils/pinataUpload"
import shortenHex from "utils/shortenHex"

type Credentials = {
  jwt: string
  key: string
}

const PinataContext = createContext<{
  jwt: string
  pinFileToIPFS: (
    props: Omit<PinToIPFSProps, "jwt">
  ) => Promise<PinataPinFileResponse>
  updateCredentials: () => Promise<Credentials>
}>({
  jwt: null,
  pinFileToIPFS: null,
  updateCredentials: null,
})

const fetchCredentials = async (_: string): Promise<Credentials> => {
  const response = await fetch("/api/pinata-key")
  const body = await response.json()
  console.log("Generated Pinata key:", {
    key: shortenHex(body.key),
    jwt: shortenHex(body.jwt),
  })
  return body
}

const PinataProvider = ({
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  const {
    data: { jwt, key },
    mutate,
  } = useSWRImmutable("pinataJWT", fetchCredentials, {
    revalidateOnMount: false,
    fallbackData: { jwt: null, key: null },
  })

  const revokeKey = useCallback(() => {
    console.log("Revoking Pinata key:", shortenHex(key))
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

  const pinWithJWT = async (props: Omit<PinToIPFSProps, "jwt">) => {
    const jwtToUse = jwt || (await mutate().then((d) => d.jwt))
    return pinFileToIPFS({ ...props, jwt: jwtToUse })
  }

  useEffect(() => {
    window.addEventListener("beforeunload", revokeKey)
    return () => window.removeEventListener("beforeunload", revokeKey)
  }, [revokeKey])

  return (
    <PinataContext.Provider
      value={{
        jwt,
        pinFileToIPFS: pinWithJWT,
        updateCredentials: async () => (jwt ? { jwt, key } : mutate()),
      }}
    >
      {children}
    </PinataContext.Provider>
  )
}

const usePinata = () => useContext(PinataContext)

export { PinataProvider, usePinata }
