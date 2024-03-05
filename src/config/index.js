const deviceMatch = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i) || [] // eslint-disable-line

const ltMinWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 544

export const DEV = 'dev'
export const PC = 'PC'

let env = ''

if (process.env.NODE_ENV === 'production') env = ''

export default {
    device: deviceMatch[0] || PC,
    ltMinWidth,
    env,
}

// buyOrSale    1: 买，0: 卖
// openOrClose  1: 开，0: 平
