import axios, { AxiosResponse } from 'axios'
import CircuitBreaker from 'opossum'
import { Request, Response, Express } from 'express'
import { createPayment, Payment } from './db'
import { errmsg, message } from './messages'

const jumps = process.env.JUMPS || 6
const getRandomInt = (max: number) =>
  Math.floor(Math.random() * max)


const chain = (endpoint: string, payment: Payment): Promise<string> =>
  new Promise((resolve, reject) =>
    axios.post(endpoint, payment.shipment)
      .then((response: AxiosResponse) =>
        resolve(message(response.data))
      ).catch((err: any) =>
        reject(message(err.response.data))
      )
  )

const breaker = new CircuitBreaker(chain, {
  timeout: 300, // If name service takes longer than .3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 20% of requests fail, trip the breaker
  resetTimeout: 10000 // After 10 seconds, try again.
})


export const routes = (app: Express) => {
  app.get('/', (req: Request, res: Response) => res.send(`hello from ${process.env.ID}\n`))

  app.post('/create', async (req: Request, res: Response) => {
    const count = (parseInt(`${req.query['count']}`) || 0) + 1
    const endpoint = `${process.env.CHAIN_SVC}?count=${count}`
    const ran = getRandomInt(3)
    const myPayment = await createPayment(req.body)
    // res.status(201).send(myorder)
    if (ran > 1 && process.env.INJECT_ERR === '1') {
      return res.status(502).send(message(errmsg()))
    } else {
      if (count < jumps) {
        breaker.fire(endpoint, myPayment)
          .then((response: string) =>
            res.status(200).send(response)
          )
          .catch((response: string) =>
            res.status(200).send(response)
          )
      }
      else
        res.status(200).send('\nEnded Transaction')
    }
  })
}

breaker.on("fallback", () => console.log('🔌 status:: fallback'))
breaker.on("success", () => console.log("🔌 status:: success"))
breaker.on("failure", () => console.log("🔌 status:: failed"))
breaker.on("timeout", () => console.log("🔌 status:: timed out"))
breaker.on("reject", () => console.log("🔌 status:: rejected"))
breaker.on("open", () => console.log("🔌 status:: opened"))
breaker.on("halfOpen", () => console.log("🔌 status:: halfOpened"))
breaker.on("close", () => console.log("🔌 status:: closed"))