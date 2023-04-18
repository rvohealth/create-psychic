import { getMockReq, getMockRes } from '@jest-mock/express'
import { HttpMethod } from 'howl'

export default ({
  method='get',
  params={},
  body={},
}: {
  method?: HttpMethod
  params?: { [key: string]: any }
  body?: { [key: string]: any }
}={}) => ({
  req: getMockReq({ params, body }),
  res: getMockRes().res,
})
