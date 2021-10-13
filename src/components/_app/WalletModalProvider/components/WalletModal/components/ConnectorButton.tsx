import { Button, Img } from "@chakra-ui/react"
import { Wallet } from "@solana/wallet-adapter-wallets"

type Props = {
  wallet: Wallet
  onClick: () => void
  disabled: boolean
  isActive: boolean
  isLoading: boolean
}

const ConnectorButton = ({
  wallet,
  onClick,
  disabled,
  isActive,
  isLoading,
}: Props): JSX.Element => (
  <Button
    onClick={onClick}
    rightIcon={<Img src={wallet.icon} h="5" alt={`${wallet.name} logo`} />}
    disabled={disabled || isActive}
    isLoading={isLoading}
    spinnerPlacement="end"
    loadingText={`${wallet.name} - connecting...`}
    isFullWidth
    size="xl"
    justifyContent="space-between"
    border={isActive ? "2px" : undefined}
    borderColor="primary.500"
  >
    {`${wallet.name} ${isActive ? " - connected" : ""}`}
  </Button>
)

export default ConnectorButton
