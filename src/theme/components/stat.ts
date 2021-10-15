import { statAnatomy as parts } from "@chakra-ui/anatomy"
import { PartsStyleObject } from "@chakra-ui/theme-tools"

const sizes: Record<string, PartsStyleObject<typeof parts>> = {
  md: {
    label: { fontSize: "sm" },
    helpText: { fontSize: "sm" },
    number: { fontSize: "2xl" },
  },
  lg: {
    label: { fontSize: "md" },
    helpText: { fontSize: "sm" },
    number: { fontSize: "3xl" },
  },
}

export default {
  sizes,
}
