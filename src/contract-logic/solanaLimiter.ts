import Bottleneck from "bottleneck"

const limiter = new Bottleneck({
  reservoir: 40,
  reservoirRefreshAmount: 40,
  reservoirRefreshInterval: 10_000,
})

export default limiter
