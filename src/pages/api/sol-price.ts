/**
 * Having this server endpoint instead of just fetching the URL from the client to
 * hide our api key
 */

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // todo fetch api
  res.status(200).send(230)
}

export default handler
