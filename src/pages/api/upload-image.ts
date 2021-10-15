import fleekStorage from "@fleekhq/fleek-storage-js"
import middleware from "middleware"
import type { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"

const handler = nextConnect()
handler.use(middleware)

type Data = {
  imageUrl: string
}

const uploadImage = async (key: string, file: File) => {
  const uploadedFile = await fleekStorage.upload({
    apiKey: process.env.FLEEK_API_KEY,
    apiSecret: process.env.FLEEK_API_SECRET,
    key,
    data: file,
  })
  return uploadedFile.hash
}

handler.post(
  async (req: NextApiRequest & { files: File[] }, res: NextApiResponse<Data>) => {
    // console.log("req", req)
    // console.log("body", req.body)
    // console.log("files", req.files)
    const hash = await uploadImage("test", req.files[0])

    res.status(200).json({ imageUrl: hash })
  }
)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler
