import { fetchOrderInfo, fetchOpeningOrderInfo, fetchFutureConfigInfo  } from '@/api'
import { getBelongDealDate } from '@/libs/util'

const order = {
    namespaced: true,
    state() {
        return {
            orderList: [],
            openingOrderList: [],
            analyseList: [],
            futureConfigInfo: [],
            analyseCalendarData: {},
        }
    },
    getters: {
        futuresList(state) { // 合约列表
            return [...new Set(state.futureConfigInfo.map(item => item.name))]
        },
        enFutureMap(state) {
            const obj = {}
            state.futureConfigInfo.forEach(item => {
                obj[item.name] = item.chName
            })
            return obj
        },
    },
    mutations: {
        setFutureConfigInfo(state, value) {
            state.futureConfigInfo = value
        },
        setOrderList(state, value) {
            state.orderList = value
        },
        setOpeningOrderList(state, value) {
            state.openingOrderList = value
        },
        setAnalyseList(state, value) {
            state.analyseList = value
        },
        setAnalyseCalendarData(state, value) {
            state.analyseCalendarData = value
        },
        emptyAnalyseCalendarDataByDate(state, date) {
            state.analyseCalendarData[date] = 0
        },
    },
    actions: {
        async getFutureConfigInfo({ commit }) {
            const res = await fetchFutureConfigInfo()
            const futureConfigInfo = res.data || []
            commit('setFutureConfigInfo', futureConfigInfo)
        },
        async getOrderData({ commit }, params) {
            const res = await fetchOrderInfo(params)
            const data = res.data || []
            commit('setOrderList', data || [])
        },
        async getAnalyseData({ commit }, params) {
            const res = await fetchOrderInfo(params)
            const data = res.data || []
            commit('setAnalyseList', data || [])
        },
        async getAnalyseCalendar({ state, commit }, { params, type }) {
            let { endDate } = params
            let yearMoth = endDate.slice(0, 7)
            let year = endDate.slice(0, 4)
            if (state.analyseCalendarData[`${yearMoth}-status`] && type === 'M') return // 如果该月份数据已获取，不再重新请求
            if (state.analyseCalendarData[`${year}-status`] && type === 'Y') return // 如果该年份数据已获取，不再重新请求

            const res = await fetchOrderInfo(params)
            const data = res.data || []
            let dateMap = {}
            data.forEach(item => {
                const belongDate = getBelongDealDate(item.date)
                const belongMonth = belongDate.slice(0, 7)
                if (!dateMap[belongDate]) {
                    dateMap[belongDate] = []
                }
                if (!dateMap[belongMonth]) {
                    dateMap[belongMonth] = []
                }
                dateMap[belongDate].push(item.totalProfit)
                dateMap[belongMonth].push(item.totalProfit)
            })
            Object.keys(dateMap).forEach(date => {
                dateMap[date] = dateMap[date].reduce((a, b) => a + b, 0)
            })
            if (type === 'M') dateMap[`${yearMoth}-status`] = 1 // 表示月份数据已获取
            if (type === 'Y') {
                dateMap[`${yearMoth}-status`] = 1 // 表示年和月份数据已获取
                dateMap[`${year}-status`] = 1 // 表示年和月份数据已获取
            }
            dateMap = Object.assign(state.analyseCalendarData, dateMap)
            commit('setAnalyseCalendarData', dateMap)
        },
        async getOpeningOrderData({ commit }) {
            const res = await fetchOpeningOrderInfo()
            const data = res.data || []
            const formatArr = []
            const groupObj = {}
            data.forEach(item => {
                if (!groupObj[`${item.name}${item.buyOrSale}`]) {
                    groupObj[`${item.name}${item.buyOrSale}`] = []
                }
                groupObj[`${item.name}${item.buyOrSale}`].push(item)
            })
            Object.keys(groupObj).forEach(key => {
                const itemObj = { ...groupObj[key][0] }
                let totalHands = 0
                let totalPrice = 0
                let totalCommission = 0
                groupObj[key].forEach(item => {
                    const { closeHands = 0, hands, price, commission } = item
                    const preCommission = commission / hands
                    totalHands += hands
                    totalHands -= closeHands
                    totalPrice += (hands - closeHands) * price
                    totalCommission += (hands - closeHands) * preCommission
                })
                itemObj.price = (totalPrice / totalHands).toFixed(3)
                itemObj.hands = totalHands
                itemObj.commission = totalCommission.toFixed(2)
                formatArr.push(itemObj)
            })
            commit('setOpeningOrderList', formatArr)
        }
    },
}

export default order
