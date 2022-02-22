import { PropsWithChildren } from "react"
import CardMotionWrapper from "../common/CardMotionWrapper"

const ExplorerCardMotionWrapper = ({ children }: PropsWithChildren<any>) => (
  <CardMotionWrapper
    animateOnMount={
      typeof window ? document?.activeElement?.id === "searchBar" : false
    }
  >
    {children}
  </CardMotionWrapper>
)

export default ExplorerCardMotionWrapper
