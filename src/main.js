import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import store from './store'
import './libs/index.js'
import './libs/weixinJSBridge'
import './styles/media.css'

if (process.env.NODE_ENV !== 'production') {
    require('element-plus/dist/index.css')
}

import './styles/index.css'

const app = createApp(App)

zhCn.el.datepicker.months.jan = '01'
zhCn.el.datepicker.months.feb = '02'
zhCn.el.datepicker.months.mar = '03'
zhCn.el.datepicker.months.apr = '04'
zhCn.el.datepicker.months.may = '05'
zhCn.el.datepicker.months.jun = '06'
zhCn.el.datepicker.months.jul = '07'
zhCn.el.datepicker.months.aug = '08'
zhCn.el.datepicker.months.sep = '09'
zhCn.el.datepicker.months.oct = '10'
zhCn.el.datepicker.months.nov = '11'
zhCn.el.datepicker.months.dec = '12'

app.use(ElementPlus, {
    locale: zhCn,
})
app.use(router)
app.use(store)

app.mount('#app')
