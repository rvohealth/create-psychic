import axios, { AxiosError } from 'axios'
import routes from '../config/routes'

export const api = axios.create({
  withCredentials: true,
  baseURL: routes.baseURL,
})
