import { NFTData } from "contract-logic/queries/types"
import { useMemo } from "react"
import useSWRImmutable from "swr/immutable"
import useCycle from "./useCycle"

const useNftData = (asset: NFTData) => {
  const { cycle } = useCycle()
  const { cycleNumber } = cycle ?? {}

  const shouldFetch = asset && cycleNumber

  /**
   * Currently we save assets with the gateway uri, but we used to with the native
   * one and plan to in the future too, thus this replace is left here
   */
  const gatewayUri = asset?.uri?.replace?.("ipfs://", "https://ipfs.io/ipfs/")

  const uri = useMemo(
    () =>
      `${gatewayUri}${
        asset.uri.endsWith(".json")
          ? ""
          : `/${asset.isRepeating ? "0" : cycleNumber}.json`
      }`,
    [asset, gatewayUri, cycleNumber]
  )

  const { data } = useSWRImmutable(shouldFetch ? uri : null)

  if (!data) return null
  if (!asset.isRepeating) return data
  return {
    ...data,
    image: data.image?.replace?.("ipfs://", "https://ipfs.io/ipfs/"),
    name: `${data.name} #${cycleNumber}`,
  }
}
export default useNftData
