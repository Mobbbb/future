import HttpRequest from '@/libs/axios'
import config, { DEV } from '@/config'

const axios = config.env === DEV ? new HttpRequest('http://localhost:3002') : new HttpRequest()

export const prefixApi = config.env === DEV ? '' : '/api/future'

export default axios
