import useWindowSize from "hooks/useWindowSize"
import { useEffect, useRef, useState } from "react"

type Props = {
  animate: boolean
  imageWidth: number
  imageHeight: number
  imageCount: number
  speed: number
  gravity: number
}

const Coinfetti = ({
  animate,
  imageWidth,
  imageHeight,
  imageCount,
  speed,
  gravity,
}: Props): JSX.Element => {
  const startYPosition = -35.5
  let startTime = 0
  const positions = Array(imageCount)

  const { width, height } = useWindowSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement>(null)

  const resizeCanvas = () => {
    const canvas = canvasRef?.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
  }

  useEffect(() => {
    const img = new Image()
    img.src = "/img/coin.png"
    img.onload = () => setImage(img)

    resizeCanvas()
  }, [])

  // Handle window resize
  useEffect(() => resizeCanvas(), [width, height])

  const start = () => {
    startTime = Date.now()

    const canvas = canvasRef?.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Initial random positions on the X axis
    for (let i = 0; i < imageCount; i++) {
      positions[i] = {
        x: Math.random() * ctx.canvas.width,
        y: 0,
        startY: Math.random() * startYPosition * 20,
        rotationRandomness: Math.random() * 2 + 0.5,
        speedRandomness: Math.random(),
        finishedAnimation: false,
      }
    }

    window.requestAnimationFrame(draw)
  }

  const draw = () => {
    const canvas = canvasRef?.current
    const ctx = canvas.getContext("2d")
    const time = Date.now()

    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    for (let i = 0; i < imageCount; i++) drawAtRandomPosition(time, i)

    if (positions.every((position) => position.finishedAnimation)) return

    window.requestAnimationFrame(draw)
  }

  const drawAtRandomPosition = (time, index) => {
    const canvas = canvasRef?.current
    const ctx = canvas.getContext("2d")
    const { x, y } = positions[index]

    ctx.save()

    ctx.translate(x + imageWidth / 2, y + imageHeight / 2)
    ctx.rotate(y * (2 - positions[index].rotationRandomness) * (Math.PI / 360))
    ctx.translate(-x - imageWidth / 2, -y - imageHeight / 2)

    // ctx.fillStyle = "#ff0000";
    // ctx.fillRect(x, y, imageWidth, imageHeight);
    if (image && y !== 0) ctx.drawImage(image, x, y, imageWidth, imageHeight)

    ctx.restore()

    const newY =
      (time - startTime) / (1 / speed + positions[index].speedRandomness) +
      positions[index].startY +
      (positions[index].y * (1 + gravity)) / 10
    positions[index].y = newY

    if (newY > canvas.offsetHeight + imageWidth)
      positions[index].finishedAnimation = true
  }

  useEffect(() => {
    if (!animate) return
    start()
  }, [animate])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "full",
        height: "full",
        pointerEvents: "none",
      }}
    />
  )
}

export default Coinfetti
