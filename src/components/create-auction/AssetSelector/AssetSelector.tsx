import RadioCard from "../RadioCard"
import NFTData from "./components/NFTData"

const options = [
  {
    value: "NFT",
    title: "NFT",
    disabled: false,
    children: <NFTData />,
  },
  {
    value: "TOKEN",
    title: "Token",
    disabled: true,
  },
  {
    value: "ERC1155",
    title: "ERC 1155",
    disabled: true,
  },
]

const AssetSelector = () => <RadioCard options={options} name="asset" />

export default AssetSelector
