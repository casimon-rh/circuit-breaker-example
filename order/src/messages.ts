
export const curtime = () => `${new Date().getMinutes()}:${new Date().getSeconds()}`


export const message = (data: any) => {
  console.log({ data })
  return `\nThis is ${process.env.ID} @${curtime()} -> Next ${JSON.stringify(data)}`
}
export const errmsg = () =>
  `\n${process.env.ID} @${curtime()} -> unavailable`