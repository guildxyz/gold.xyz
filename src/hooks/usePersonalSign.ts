import { useWallet } from "@solana/wallet-adapter-react"
import base58 from "bs58"
import useSWRImmtable from "swr/immutable"
import { sign } from "tweetnacl"
import useToast from "./useToast"

const handleSign = async (_, publicKey, signMessage): Promise<string> => {
  // `publicKey` will be null if the wallet isn't connected
  if (!publicKey) throw new Error("Wallet not connected!")
  // `signMessage` will be undefined if the wallet doesn't support it
  if (!signMessage) throw new Error("Wallet does not support message signing!")

  // Encode anything as bytes
  const message = new TextEncoder().encode(
    "Please sign this message to verify your address"
  )
  // Sign the bytes using the wallet
  const signature = await signMessage(message)
  // Verify that the bytes were signed using the private key that matches the known public key
  if (!sign.detached.verify(message, signature, publicKey.toBytes()))
    throw new Error("Invalid signature!")

  return base58.encode(signature)
}

const usePersonalSign = (shouldShowErrorToast = false) => {
  const { signMessage, publicKey } = useWallet()
  const toast = useToast()

  const { data, mutate, isValidating, error } = useSWRImmtable(
    ["sign", publicKey, signMessage],
    handleSign,
    {
      revalidateOnMount: false,
      shouldRetryOnError: false,
    }
  )

  const removeError = () => mutate((_) => _, false)

  const callbackWithSign = (callback: any) => async () => {
    removeError()
    if (!data) {
      const newData = await mutate()
      if (newData) callback()
      else if (shouldShowErrorToast)
        toast({
          title: "Request rejected",
          description: "Please try again and confirm the request in your wallet",
          status: "error",
          duration: 4000,
        })
    } else {
      callback()
    }
  }

  return {
    addressSignedMessage: data,
    callbackWithSign,
    isSigning: isValidating,
    // explicit undefined instead of just "&& error" so it doesn't change to false
    error: !data && !isValidating ? error : undefined,
    removeError,
  }
}

export default usePersonalSign
