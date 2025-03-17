import HttpRequest from '@/libs/axios'
import config, { DEV } from '@/config'

export const baseUrl = config.env === DEV ? 'http://localhost:3002' : ''

const axios = new HttpRequest(baseUrl)

export const prefixApi = config.env === DEV ? '' : '/api/future'

export default axios
