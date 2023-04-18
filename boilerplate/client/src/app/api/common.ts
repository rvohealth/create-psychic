import axios, { AxiosError } from 'axios'
import routes from '../config/routes'

export const api = axios.create({
  withCredentials: true,
  baseURL: routes.baseURL,
})

export interface HowlHttpError extends AxiosError {
  response: {
    status: number
    statusText: string
    config: any
    headers: any
    data: {
      errors: { [key: string]: any }
    }
  }
}
