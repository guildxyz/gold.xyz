import { WalletError } from "@solana/wallet-adapter-base"
import { ErrorInfo } from "components/common/Error"

const processWalletError = (error: WalletError): ErrorInfo => {
  switch (error.error) {
    default:
      return {
        title: error.name,
        description: error.message,
      }
    // default:
    //   console.error(error)
    //   return {
    //     title: "An unknown error occurred",
    //     description: "Check the console for more details.",
    //   }
  }
}

export default processWalletError
