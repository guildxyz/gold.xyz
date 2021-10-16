import { Alert, AlertIcon, AlertTitle, Stack } from "@chakra-ui/react"

const WalletNotConnectedAlert = () => (
  <Alert status="error" mb="6" pb="5">
    <AlertIcon />
    <Stack>
      <AlertTitle position="relative" top="4px">
        Please connect your wallet in order to continue!
      </AlertTitle>
    </Stack>
  </Alert>
)

export default WalletNotConnectedAlert
