import {
    fetchOrderInfoHandle,
    fetchOpeningOrderInfo,
    fetchFutureConfigInfo,
    fetchFutureDayShareInfo,
    fetchFutureDayLineInfo,
} from '@/api'
import { sortCallback } from 'umob'

const order = {
    namespaced: true,
    state() {
        return {
            orderList: [],
            openingOrderList: [],
            openingOrderGroup: {},
            futureConfigInfo: [],

            futureDayShareInfo: [],
            futureDayLineInfo: [],
        }
    },
    getters: {
        futuresList(state) { // 合约列表
            return state.futureConfigInfo.filter(item => item.name === item.activeName)
        },
        closeSettingfuturesList(state) { // 可平今的合约品种
            return state.futureConfigInfo.filter(item => item.canCloseInDay)
        },
        enFutureNameMap(state) { // 英文名-中文名
            const obj = {}
            state.futureConfigInfo.forEach(item => {
                obj[item.name] = item.chName
            })
            return obj
        },
        enFutureMap(state) {
            const obj = {}
            state.futureConfigInfo.forEach(item => {
                obj[item.name] = item
            })
            return obj
        },
    },
    mutations: {
        setFutureDayShareInfo(state, value) {
            state.futureDayShareInfo = value
        },
        setFutureConfigInfo(state, value) {
            state.futureConfigInfo = value
        },
        setOrderList(state, value) {
            state.orderList = value
        },
        setOpeningOrderList(state, value) {
            state.openingOrderList = value
        },
        setOpeningOrderGroup(state, value) {
            state.openingOrderGroup = value
        },
        setFutureDayLineInfo(state, value) {
            state.futureDayLineInfo = value
        },
    },
    actions: {
        async getOrderData({ commit }, params) {
            const result = await fetchOrderInfoHandle(params)
            commit('setOrderList', result.result)
            return result
        },
        async getFutureConfigInfo({ commit }) {
            const res = await fetchFutureConfigInfo()
            const futureConfigInfo = res.data || []
            commit('setFutureConfigInfo', futureConfigInfo)
        },
        async getFutureDayShareInfo({ commit }, params) {
            const res = await fetchFutureDayShareInfo(params)
            const info = res.data || []
            commit('setFutureDayShareInfo', info)
        },
        async getFutureDayLineInfo({ commit }, params) {
            const res = await fetchFutureDayLineInfo(params)
            const info = res.data || []
            info.sort(sortCallback({ key: 'date', type: 'asc' }))
            commit('setFutureDayLineInfo', info)
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
            commit('setOpeningOrderGroup', groupObj)
            commit('setOpeningOrderList', formatArr)
        }
    },
}

export default order
