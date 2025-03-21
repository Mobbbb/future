import { prefixApi } from '@/libs/api.request'

export const getQrCode = ({
    onpen = () => {},
    onmessage = () => {},
    onclose = () => {},
    onerror = () => {},
}) => {
    // const ws = new WebSocket(`ws://127.0.0.1:3002`)
    const ws = new WebSocket(`wss://${process.env.VUE_APP_HOST}${prefixApi}/ws`)

    // 连接打开时触发
    ws.onopen = function(event) {
        // 发送消息
        ws.send('GET_CODE')
    }
    // 收到服务器消息时触发 
    ws.onmessage = function(event) {
        const res = JSON.parse(event.data)
        onmessage(res)
    }
    // 连接关闭时触发
    ws.onclose = function(event) {
        onclose(event.reason)
    }
    // 处理错误
    ws.onerror = function(error) {
        console.log(error)
        onclose()
    }

    return ws
}
