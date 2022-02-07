import { useEffect, useLayoutEffect, useState } from "react"

// Use "useEffect" when rendering on the server, so we don't get warnings
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

const useWindowSize = (): { width: number; height: number } => {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: Infinity,
    height: Infinity,
  })

  useIsomorphicLayoutEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("resize", updateSize)
    updateSize()

    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return size
}

export default useWindowSize
