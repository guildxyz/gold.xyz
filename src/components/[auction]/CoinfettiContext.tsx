import Coinfetti from "components/common/Coinfetti"
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"

const CoinfettiContext = createContext<{ triggerCoinfetti: () => void }>(null)

const CoinfettiProvider = ({
  children,
}: PropsWithChildren<unknown>): JSX.Element => {
  const [showCoinfetti, setShowCoinfetti] = useState(false)

  useEffect(() => {
    if (!showCoinfetti) return

    setTimeout(() => setShowCoinfetti(false), 4000)
  }, [showCoinfetti])

  return (
    <CoinfettiContext.Provider
      value={{
        triggerCoinfetti: () => setShowCoinfetti(true),
      }}
    >
      {children}
      <Coinfetti
        animate={showCoinfetti}
        imageWidth={47}
        imageHeight={35.5}
        imageCount={40}
        speed={1.5}
        gravity={2}
      />
    </CoinfettiContext.Provider>
  )
}

const useCoinfettiContext = () => useContext(CoinfettiContext)

export { useCoinfettiContext, CoinfettiProvider }
