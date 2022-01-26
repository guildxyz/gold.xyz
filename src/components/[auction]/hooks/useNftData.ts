import { NFTData } from "contract-logic/queries/types"
import { useMemo } from "react"
import useSWRImmutable from "swr/immutable"
import useCycle from "./useCycle"

const useNftData = (asset: NFTData) => {
  const { cycle } = useCycle()
  const { cycleNumber } = cycle ?? {}

  const shouldFetch = asset && cycleNumber

  const gatewayUri = asset
    ? `https://ipfs.fleek.co/ipfs/${asset.uri.split("ipfs://")[1]}`
    : ""

  const uri = useMemo(
    () => `${gatewayUri}/${asset?.isRepeated ? "0" : cycleNumber - 1}.json`,
    [asset, gatewayUri, cycleNumber]
  )

  const { data } = useSWRImmutable(shouldFetch ? uri : null)

  if (!data) return null
  if (!asset.isRepeated) return data
  return {
    ...data,
    name: `${data.name} #${cycleNumber}`,
  }
}
export default useNftData
