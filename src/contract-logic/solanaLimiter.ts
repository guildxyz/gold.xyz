import Bottleneck from "bottleneck"

const limiter = new Bottleneck({
  reservoir: 40,
  reservoirRefreshAmount: 40,
  reservoirRefreshInterval: 60_000,
})

export default limiter
