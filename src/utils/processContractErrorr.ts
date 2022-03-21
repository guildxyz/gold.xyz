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
        description: "This auction is in progress",
      }

    case "20e":
    case "1fb":
      return {
        title: "Invalid bid amount",
        description: "Please adjust the bid amount to reach the dispalyed minimum",
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
        description: "Some of the submitted NFTs are invalid",
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

    case "1f7":
    case "204":
      return {
        title: "Auction name taken",
        description:
          "This auction name is already taken. Please choose a different one",
      }

    case "205":
      return {
        title: "Not admin",
        description: "Only admin can execute this action",
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
        description: "This is likely caused by a bug. Please contact us",
      }

    case "210":
      return {
        title: "Invalid cycle period",
        description:
          "Make sure the round term is selected. If it is set to custom, make sure to set it correctly",
      }

    case "211":
      return {
        title: "Auction ID not ASCII",
        description:
          "The id generated from the auction name contains invalid characters. Make sure to not use emojis in the auction name",
      }

    case "1fe":
      return {
        title: "Top bidder mismatch",
        description: "It's not possible to bid as the top bidder",
      }

    case "214":
      return {
        title: "Invalid encore period",
        description:
          "If set, the encore period has to be a positive number, and cannot be more than the half of the round term",
      }

    case "216":
      return {
        title: "Reward already claimed",
        description: "This reward has already been claimed",
      }

    case "217":
      return {
        title: "Unclaimed rewards",
        description:
          "This auction has some unclaimed rewards. It cannot be deleted until all the rewards are claimed",
      }

    case "215": // Invalid protocol fee
    case "213": // String too long -> This one does not seem to be thrown anywhere
    case "212": // Token auction inconsistency
    case "20f": // Invalid per cycle amount
    case "20d": // Shrinking pool is not allowed
    case "20c": // Auction pool full
    case "20b": // Withdraw authority mismatch
    case "209": // Invalid account owner
    case "208": // Invalid program address
    case "207": // Metadata manipulation error
    case "1fa": // Invalid seeds
    case "1f4": // Invalid instruction
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
