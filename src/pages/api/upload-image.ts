import fleekStorage from "@fleekhq/fleek-storage-js"
import multer from "multer"
import type { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const handler = nextConnect({
  onError(error, req, res: NextApiResponse) {
    res.status(501).json({ error: `${error.message}` })
  },
})
handler.use(upload.any())

const uploadImage = async (key: string, file: Buffer | string): Promise<string> => {
  const uploadedFile = await fleekStorage.upload({
    apiKey: process.env.FLEEK_API_KEY,
    apiSecret: process.env.FLEEK_API_SECRET,
    key,
    data: file,
  })
  return uploadedFile.publicUrl
}

type Data = {
  publicUrl: string
}

type MulterFile = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

handler.post(
  async (
    req: NextApiRequest & { files: MulterFile[] },
    res: NextApiResponse<Data>
  ) => {
    const { symbol, description, folder } = req.body
    const attributes = JSON.parse(req.body.attributes)
    const nftNames = JSON.parse(req.body.nftnames)

    const [firstJsonUri] = await Promise.all(
      req.files.map(({ fieldname, originalname, buffer, mimetype }, index) =>
        uploadImage(
          `${folder}/${fieldname}.${originalname.split(".").pop()}`,
          buffer
        ).then((uploadedPublicUrl) =>
          uploadImage(
            `${folder}/${fieldname}.json`,
            JSON.stringify({
              name: nftNames[index],
              symbol,
              description,
              image: uploadedPublicUrl,
              attributes,
              properties: {
                category: "image",
                files: [
                  {
                    uri: uploadedPublicUrl,
                    type: mimetype,
                  },
                ],
              },
            })
          )
        )
      )
    )

    res.status(200).json({ publicUrl: firstJsonUri })
  }
)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler
