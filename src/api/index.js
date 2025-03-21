import axios, { prefixApi } from '@/libs/api.request'

export const fetchUserLogin = (uid, password, captcha) => {
    return axios.request({
        url: prefixApi + '/user/login',
        method: 'post',
        data: { uid, password, captcha },
    })
}

export const fetchUserInfo = () => {
    return axios.request({
        url: prefixApi + '/user/info',
        method: 'get',
    })
}

export const updateUserInDayFirstLists = (lists) => {
    return axios.request({
        url: prefixApi + '/user/updateUserInDayFirstLists',
        method: 'post',
        data: { lists, },
    })
}

export const updateUserEmail = (email) => {
    return axios.request({
        url: prefixApi + '/user/updateUserEmail',
        method: 'post',
        data: { email },
    })
}

export const fetchListData = () => {
    return axios.request({
        url: '/resource/future/message.json',
        method: 'get',
    })
}

export const fetchFlag = () => {
    return axios.request({
        url: prefixApi + '/other/selectAllFlag',
        method: 'get',
    })
}

export const updateFlagStatus = (params) => {
    return axios.request({
        url: prefixApi + '/other/updateStatus',
        method: 'get',
        params,
    })
}

export const fetchRebateInfo = () => {
    return axios.request({
        url: prefixApi + '/other/rebateInfo',
        method: 'get',
    })
}

export const fetchRebateInfoByUserId = async (params) => {
    return axios.request({
        url: prefixApi + '/other/getRebateInfoByUserId',
        method: 'post',
        data: params,
    })
}

export const fetchIncomeInfo = () => {
    return axios.request({
        url: prefixApi + '/other/incomeInfo',
        method: 'get',
    })
}

export const fetchRecentlyFeature = () => {
    return axios.request({
        url: prefixApi + '/other/recentlyFeature',
        method: 'get',
    })
}

export const fetchInsertIncome = (params) => {
    return axios.request({
        url: prefixApi + '/other/insertIncome',
        method: 'post',
        data: params,
    })
}

export const fetchDeleteIncome = (id) => {
    return axios.request({
        url: prefixApi + '/other/deleteIncome',
        method: 'get',
        params: { id },
    })
}

export const fetchOrderInfo = (params) => {
    return axios.request({
        url: prefixApi + '/other/orderInfo',
        method: 'post',
        data: params,
    })
}

export const fetchOrderInfoByUserId = (params) => {
    return axios.request({
        url: prefixApi + '/other/orderInfoByUserId',
        method: 'post',
        data: params,
    })
}

export const fetchOrderInfoByUserIdHandle = async (params) => {
    const res = await fetchOrderInfoByUserId(params)
    const data = res.data || {}
    const { result = [], commission, profit, totalProfit, total } = data
    return {
        commission,
        profit,
        totalProfit,
        total: total || 0,
        result,
        success: res.success,
    }
}

export const fetchOrderInfoHandle = async (params) => {
    const res = await fetchOrderInfo(params)
    const data = res.data || {}
    const { result = [], commission, profit, totalProfit, total } = data
    return {
        commission,
        profit,
        totalProfit,
        total: total || 0,
        result,
    }
}

export const fetchInsertOrder = (params) => {
    return axios.request({
        url: prefixApi + '/other/insertOrder',
        method: 'post',
        data: params,
    })
}

export const fetchDeleteOrder = (id) => {
    return axios.request({
        url: prefixApi + '/other/deleteOrder',
        method: 'get',
        params: { id },
    })
}

export const fetchCancelOrder = (params) => {
    return axios.request({
        url: prefixApi + '/other/cancelOrder',
        method: 'post',
        data: params,
    })
}

export const fetchFutureConfigInfo = () => {
    return axios.request({
        url: prefixApi + '/other/futureConfigInfo',
        method: 'get',
    })
}

export const fetchOpeningOrderInfo = () => {
    return axios.request({
        url: prefixApi + '/other/openingOrderInfo',
        method: 'get',
    })
}

export const fetchFutureDayShareInfo = (params) => {
    return axios.request({
        url: prefixApi + '/other/futureDayShareInfo',
        method: 'post',
        data: params,
    })
}

export const fetchFutureDayLineInfo = (params) => {
    return axios.request({
        url: prefixApi + '/other/futureDayLineInfo',
        method: 'post',
        data: params,
    })
}

export const fetchFuturePositionInfo = (params) => {
    return axios.request({
        url: prefixApi + '/other/futurePositionInfo',
        method: 'post',
        data: params,
    })
}

export const fetchIncomeLatestInfo = () => {
    return axios.request({
        url: prefixApi + '/other/incomeLatestInfo',
        method: 'get',
    })
}

export const fetchFutureLatestInfo = () => {
    return axios.request({
        url: prefixApi + '/other/futureLatestInfo',
        method: 'get',
    })
}

export const fetchFutureFestivalInfo = (params) => {
    return axios.request({
        url: prefixApi + '/other/futureFestivalInfo',
        method: 'get',
        params,
    })
}

export const getNewAppVersion = () => {
    return axios.request({
        url: prefixApi + '/other/getNewAppVersion',
        method: 'get',
    })
}
