import Bottleneck from "bottleneck"

const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 1000,
})

export default limiter
