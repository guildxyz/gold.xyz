import { NFTData } from "contract-logic/queries/types"
import { useMemo } from "react"
import useSWRImmutable from "swr/immutable"
import useCycle from "./useCycle"

const useNftData = (asset: NFTData) => {
  const { cycle } = useCycle()
  const { cycleNumber } = cycle ?? {}

  const shouldFetch = asset && cycleNumber

  const uri = useMemo(
    () =>
      asset?.isRepeated
        ? asset?.uri
        : asset?.uri.replace("0.json", `${cycleNumber - 1}.json`),
    [asset, cycleNumber]
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
