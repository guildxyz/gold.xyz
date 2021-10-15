import multiparty from "multiparty"
import nextConnect from "next-connect"

const middleware = nextConnect()

middleware.use(async (req: any, res, next) => {
  const form = new multiparty.Form()

  await form.parse(req, function (err, fields, files) {
    // console.log("req", req)
    // console.log("fields", fields)
    // console.log("files", files)
    req.body = fields
    req.files = files
    next()
  })
})

export default middleware
