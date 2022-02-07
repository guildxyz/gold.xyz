import { statAnatomy as parts } from "@chakra-ui/anatomy"
import { SystemStyleObject } from "@chakra-ui/react"
import { PartsStyleObject } from "@chakra-ui/theme-tools"

const baseStyleHelpText: SystemStyleObject = {
  opacity: 0.4,
  marginBottom: 2,
}

const baseStyle: PartsStyleObject<typeof parts> = {
  helpText: baseStyleHelpText,
}

const sizes: Record<string, PartsStyleObject<typeof parts>> = {
  sm: {
    label: { fontSize: "xs" },
    helpText: { fontSize: "xs" },
    number: { fontSize: "lg" },
  },
  md: {
    label: { fontSize: "sm" },
    helpText: { fontSize: "sm" },
    number: { fontSize: "xl" },
  },
  lg: {
    label: { fontSize: "md" },
    helpText: { fontSize: "sm" },
    number: { fontSize: "2xl" },
  },
}

export default {
  sizes,
  baseStyle,
}
