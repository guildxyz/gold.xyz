import { Box, EASINGS } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { PropsWithChildren } from "react"
import { Rest } from "types"

const MotionBox = motion(Box)

type Props = {
  animateOnMount?: boolean
  shouldBounce?: boolean
} & Rest

const CardMotionWrapper = ({
  animateOnMount = true,
  shouldBounce = false,
  children,
  ...rest
}: PropsWithChildren<Props>): JSX.Element => (
  <MotionBox
    layout="position"
    {...(animateOnMount && {
      initial: { opacity: 0, scale: 0.95 },
    })}
    animate={{
      opacity: 1,
      scale: shouldBounce ? [1, 1.05, 1] : 1,
      transition: {
        duration: 0.2,
        ease: EASINGS.easeOut,
      },
    }}
    exit={{
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.1, ease: EASINGS.easeIn },
    }}
    transition={{ duration: 0.3, ease: EASINGS.easeInOut }}
    sx={{ "> *": { height: "full" } }}
    {...rest}
  >
    {children}
  </MotionBox>
)

export default CardMotionWrapper
