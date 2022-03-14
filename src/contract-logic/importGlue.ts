const importGlue = () =>
  import(`${process.env.NEXT_PUBLIC_GOLD_GLUE}${typeof window === "undefined" ? "-node" : ""}`)

export default importGlue
