const importGlue = () => {
  console.log(`${process.env.NEXT_PUBLIC_GOLD_GLUE}${typeof window === "undefined" ? "-node" : ""}`)
  return import(
    `${process.env.NEXT_PUBLIC_GOLD_GLUE}${typeof window === "undefined" ? "-node" : ""}`
  )
}

export default importGlue
