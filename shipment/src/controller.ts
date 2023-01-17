import { Request, Response, Express } from 'express'
import { createShipment } from './db'
import { errmsg, message } from './messages'

const jumps = process.env.JUMPS || 6
const getRandomInt = (max: number) =>
  Math.floor(Math.random() * max)

export const routes = (app: Express) => {
  app.post('/create', async (req: Request, res: Response) => {
    const ran = getRandomInt(3)
    const myshipment = await createShipment(req.body)
    if (ran > 1 && process.env.INJECT_ERR === '1') {
      return res.status(502).send(message(errmsg()))
    }
    else
      res.status(200).send({ msg: '\nEnded Transaction', myshipment })
  })
}