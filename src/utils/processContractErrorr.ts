const EXTRACT_ERROR_CODE_REGEX = /custom program error: 0x([0-9a-f]{3})/i

const processContractError = (
  error: string
): { title: string; description: string } => {
  const errorCode = error.match(EXTRACT_ERROR_CODE_REGEX)?.[1]?.toLowerCase()

  switch (errorCode) {
    case "1f5":
      return {
        title: "Auction cycle ended",
        description: "This auction cycle has ended",
      }

    case "1f6":
      return {
        title: "Auction frozen",
        description: "This auction is frozen",
      }

    case "1f9":
      return {
        title: "Auction is in progress",
        description: "",
      }

    case "20e":
    case "1fb":
      return {
        title: "Invalid bid amount",
        description: "Please adjust the bit amount to reach the dsipalyed minimum",
      }

    case "1fc":
      return {
        title: "Auction owner mismatch",
        description: "Only the owner of this auction can execute this action",
      }

    case "1fd":
      return {
        title: "Invalid start time",
        description: "The provided auction start date has already passed",
      }

    case "1ff": // Master edition mismatch
    case "200": // Child edition number mismatch
    case "201": // Nft already exists
      return {
        title: "NFT error",
        description: "The submitted NFTs are invelid",
      }

    case "1f9":
      return {
        title: "Auction is in progress",
        description: "",
      }

    case "202":
      return {
        title: "Invalid claim amount",
        description: "Tried to claim an invalid amount of funds",
      }

    case "203":
      return {
        title: "Auction ended",
        description: "This auction has already ended",
      }

    case "204":
      return {
        title: "Auction name taken",
        description:
          "This auction name is already taken. Please choose a different one",
      }

    case "205":
      return {
        title: "Not admin",
        description: "Only contract admin can execute this action",
      }

    // Looks like this one does not get thrown anywhere
    case "206":
      return {
        title: "Auction is active",
        description: "This auction is active",
      }

    case "20a":
      return {
        title: "Arithmetic error",
        description: "This is likely caudes by a bug. Please contact us",
      }

    case "210":
      return {
        title: "Invalid cycle period",
        description:
          "Make sure to set the cycle period correctly. If it looks fine, contact us",
      }

    case "211":
      return {
        title: "Auction ID not ASCII",
        description: "This should not happen. Please contact us",
      }

    case "214": // Invalid encore period
    case "213": // String too long -> This one does not seem to be thrown anywhere
    case "212": // Token auction inconsistency
    case "20f": // Invalid per cycle amount
    case "20d": // Shrinking pool is not allowed
    case "20c": // Auction pool full
    case "20b": // Withdraw authority mismatch
    case "209": // Invalid account owner
    case "208": // Invalid program address
    case "207": // Metadata manipulation error
    case "1fe": // Top bidder account mismatch
    case "1fa": // Invalid seeds
    case "1f4": // Invalid instruction
    case "1f7": // Auction already initialized
    case "1f8": // Contract already initialized
    default:
      console.error("Unknown contract error:", error)
      return {
        title: "Contract error",
        description:
          "An unknown contract error occured. This is likely a bug in the application. Please check the console and contact us",
      }
  }
}

export default processContractError
