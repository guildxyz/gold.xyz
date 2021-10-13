import { ErrorInfo } from "components/common/Error"

const processConnectionError = (error: Error): ErrorInfo => {
  switch (error.constructor) {
    // case UserRejectedRequestErrorInjected:
    // case UserRejectedRequestErrorWalletConnect:
    //   return {
    //     title: "Error connecting. Try again!",
    //     description:
    //       "Please authorize this website to access your Ethereum account.",
    //   }
    case Error:
      return {
        title: error.name,
        description: error.message,
      }
    default:
      console.error(error)
      return {
        title: "An unknown error occurred",
        description: "Check the console for more details.",
      }
  }
}

export default processConnectionError
