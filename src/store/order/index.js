import { fetchOrderInfo, fetchOpeningOrderInfo, fetchFutureConfigInfo  } from '@/api'

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
        async getAnalyseCalendar({ commit }, params) {
            const res = await fetchOrderInfo(params)
            const data = res.data || []
            const dateMap = {}
            data.forEach(item => {
                if (!dateMap[item.date.slice(0, 10)]) {
                    dateMap[item.date.slice(0, 10)] = []
                }
                dateMap[item.date.slice(0, 10)].push(item.totalProfit)
            })
            Object.keys(dateMap).forEach(date => {
                dateMap[date] = dateMap[date].reduce((a, b) => a + b, 0)
            })
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
