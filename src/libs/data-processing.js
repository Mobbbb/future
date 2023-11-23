import { sortCallback, bigNumTransform } from 'umob'
import { getBelongDealDate } from '@/libs/util'

export const filterDataByText = (text, data, key = 'ubbContent') => {
    let regStr = ['', ...text.trim().toLowerCase(), ''].join('.*')
    let reg = new RegExp(regStr)

    let filterData = data.filter(item => {
        let nameTestStatus = reg.test(item[key].toLowerCase()) // 输入abc，匹配abc、abcdefg...
        || text.trim().toLowerCase().indexOf(item[key].toLowerCase()) > -1 // 输入框abc，匹配abc、ab、bc、a、b、c
        
        return nameTestStatus
    })

    return filterData
}

export const formatPriceLineData = (designatedFutureLists) => {
    const lineXAxis1 = []
    const lineXAxis2 = []
    const buyList = []
    const saleList = []
    const openOrderMap = {}
    const totalPrice = []
    const lineXAxisInfo1 = []
    const lineXAxisInfo2 = []
    designatedFutureLists.forEach(item => {
        if (item.openOrClose) {
            openOrderMap[item.id] = item // 开仓id - 开仓信息
        }
        if (item.buyOrSale && !item.openOrClose) { // 买平
            buyList.push(item)
        } else if (!item.buyOrSale && !item.openOrClose) { // 卖平
            saleList.push(item)
        }
    })

    const lineYAxis1 = []
    saleList.forEach(item => { // 平多
        item.linkId.split(',').forEach(id => {
            // 买开/卖平
            lineYAxis1.push([openOrderMap[id].price, item.price, item.price, item.price])
            lineXAxis1.push(`${item.date.slice(5, 7)}.${item.date.slice(8, 10)} ${item.date.slice(11, 13)}h`)
            totalPrice.push(openOrderMap[id].price)
            totalPrice.push(item.price)
            lineXAxisInfo1.push([item, openOrderMap[id]])
        })
    })

    const lineYAxis2 = []
    buyList.forEach(item => {
        item.linkId.split(',').forEach(id => {
            // 买平/卖开
            lineYAxis2.push([item.price, openOrderMap[id].price, item.price, item.price])
            lineXAxis2.push(`${item.date.slice(5, 7)}.${item.date.slice(8, 10)} ${item.date.slice(11, 13)}h`)
            totalPrice.push(openOrderMap[id].price)
            totalPrice.push(item.price)
            lineXAxisInfo2.push([item, openOrderMap[id]])
        })
    })

    const delta = lineYAxis1.length - lineYAxis2.length
    if (delta > 0) {
        for (let i = 0; i < Math.abs(delta); i++) {
            lineXAxis2.unshift('')
            lineYAxis2.unshift([])
            lineXAxisInfo2.unshift(null)
        }
    } else if (delta < 0) {
        for (let i = 0; i < Math.abs(delta); i++) {
            lineXAxis1.unshift('')
            lineYAxis1.unshift([])
            lineXAxisInfo1.unshift(null)
        }
    }

    return {
        lineXAxis1,
        lineXAxis2,
        lineYAxis1,
        lineYAxis2,
        totalPrice,
        lineXAxisInfo1,
        lineXAxisInfo2,
    }
}

export const formatFutureFestivalData = (data) => {
    const yearMap = {}
    data.forEach(item => {
        const key = item.date.slice(0, 4)
        if (yearMap[key]) {
            yearMap[key].y.push([item.open, item.close, item.min, item.max])
            yearMap[key].x.push(item.date.slice(5, 10))
        } else {
            yearMap[key] = {
                y: [[item.open, item.close, item.min, item.max]],
                x: [item.date.slice(5, 10)],
                year: item.date.slice(2, 4),
                name: item.name,
            }
        }
    })

    return Object.keys(yearMap).map(key => yearMap[key])
}

export const formatDayLineData = (designatedOpenFutureLists, futureDayLineList) => {
    const dayLineDateMap = {} // date-dayLineItem
    const dayFutureMap = {
        buy: {}, // date-futureList
        sale: {}, // date-futureList
    }
    designatedOpenFutureLists.forEach(item => {
        const realDate = getBelongDealDate(item.date)
        if (item.buyOrSale === 1) {
            if (!dayFutureMap.buy[realDate]) {
                dayFutureMap.buy[realDate] = [item.price]
            } else {
                dayFutureMap.buy[realDate].push(item.price)
            }
        } else {
            if (!dayFutureMap.sale[realDate]) {
                dayFutureMap.sale[realDate] = [item.price]
            } else {
                dayFutureMap.sale[realDate].push(item.price)
            }
        }

        dayLineDateMap[realDate] = null // 设置默认数据
    })

    futureDayLineList.forEach(item => {
        dayLineDateMap[item.date] = item.close
        if (!dayFutureMap.buy[item.date]) { // 补充空数据
            dayFutureMap.buy[item.date] = null
        }
        if (!dayFutureMap.sale[item.date]) { // 补充空数据
            dayFutureMap.sale[item.date] = null
        }
    })

    const lineXAxisArr = Object.keys(dayLineDateMap).map(key => ({
        date: key,
        price: dayLineDateMap[key],
    })).sort(sortCallback({ key: 'date', type: 'asc' }))
    const lineYAxisArr1 = Object.keys(dayFutureMap.buy).map(key => {
        if (dayFutureMap.buy[key] instanceof Array) {
            return {
                date: key,
                price: (dayFutureMap.buy[key].reduce((a, b) => a + b, 0) / dayFutureMap.buy[key].length).toFixed(2),
            }
        } else {
            return {
                date: key,
                price: dayFutureMap.buy[key],
            }
        }
    }).sort(sortCallback({ key: 'date', type: 'asc' }))
    const lineYAxisArr2 = Object.keys(dayFutureMap.sale).map(key => {
        if (dayFutureMap.sale[key] instanceof Array) {
            return {
                date: key,
                price: (dayFutureMap.sale[key].reduce((a, b) => a + b, 0) / dayFutureMap.sale[key].length).toFixed(2),
            }
        } else {
            return {
                date: key,
                price: dayFutureMap.sale[key],
            }
        }
    }).sort(sortCallback({ key: 'date', type: 'asc' }))

    return {
        lineXAxis: lineXAxisArr.map(item => `${item.date.slice(2, 4)}.${item.date.slice(5, 7)}.${item.date.slice(8, 10)}`),
        lineYAxis: lineXAxisArr.map(item => item.price),
        lineYAxis1: lineYAxisArr1.map(item => item.price),
        lineYAxis2:lineYAxisArr2.map(item => item.price),
    }
}

export const formatBasicData = (enFutureNameMap, basciInfo) => {
    let buyNum = 0
    let buyWinNum = 0
    let saleNum = 0
    let saleWinNum = 0
    let saleProfit = 0
    let saleProfitUp = 0
    let saleProfitDown = 0
    let buyProfit = 0
    let buyProfitUp = 0
    let buyProfitDown = 0
    let totalProfit = 0

    const chFutureMap = {} // 中文名-futureList
    basciInfo.forEach(item => {
        if (!chFutureMap[enFutureNameMap[item.name.replace(/[^a-zA-Z]/g, '')]]) {
            chFutureMap[enFutureNameMap[item.name.replace(/[^a-zA-Z]/g, '')]] = {
                winNum: 0,
                totalNum: 0,
                totalProfit: 0,
            }
        }
        if (item.totalProfit > 0) {
            chFutureMap[enFutureNameMap[item.name.replace(/[^a-zA-Z]/g, '')]].winNum ++
        } 
        chFutureMap[enFutureNameMap[item.name.replace(/[^a-zA-Z]/g, '')]].totalNum ++
        chFutureMap[enFutureNameMap[item.name.replace(/[^a-zA-Z]/g, '')]].totalProfit += item.totalProfit

        if (item.buyOrSale === 1) { // 平空单
            saleNum ++
            if (item.totalProfit > 0) {
                saleWinNum ++
                saleProfitUp += item.totalProfit
            } else {
                saleProfitDown += item.totalProfit
            }
            saleProfit += item.totalProfit
        } else { // 平多单
            buyNum ++
            if (item.totalProfit > 0) { // 盈利
                buyWinNum ++
                buyProfitUp += item.totalProfit
            } else {
                buyProfitDown += item.totalProfit
            }
            buyProfit += item.totalProfit
        }
        totalProfit += item.totalProfit
    })

    return {
        buyRate: (buyWinNum / buyNum * 100).toFixed(2) * 1 || 0,
        saleRate: (saleWinNum / saleNum * 100).toFixed(2) * 1 || 0,
        totalRate: ((saleWinNum + buyWinNum) / (buyNum + saleNum) * 100).toFixed(2) * 1 || 0,
        preBuyProfit: (buyProfit / buyNum).toFixed(1) * 1 || 0,
        preBuyProfitUp: (buyProfitUp / buyWinNum).toFixed(1) * 1 || 0,
        preBuyProfitDown: (buyProfitDown / (buyNum - buyWinNum)).toFixed(1) * 1 || 0,
        preSaleProfit: (saleProfit / saleNum).toFixed(1) * 1 || 0,
        preSaleProfitUp: (saleProfitUp / saleWinNum).toFixed(1) * 1 || 0,
        preSaleProfitDown: (saleProfitDown / (saleNum - saleWinNum)).toFixed(1) * 1 || 0,

        saleProfit: bigNumTransform(saleProfit, { merge: false }),
        saleProfitUp: bigNumTransform(saleProfitUp, { merge: false }),
        saleProfitDown: bigNumTransform(saleProfitDown, { merge: false }),
        buyProfit: bigNumTransform(buyProfit, { merge: false }),
        buyProfitUp: bigNumTransform(buyProfitUp, { merge: false }),
        buyProfitDown: bigNumTransform(buyProfitDown, { merge: false }),
        totalProfit: totalProfit.toFixed(2) * 1 || 0,

        chFutureMap,
    }
}

export const formatCalendarData = (result, {
    calendarDataMap,
    dayCalendarShowStatus,
    yearMothKey,
    yearKey,
}) => {
    let dateMap = {}
    result.forEach(item => {
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
    if (dayCalendarShowStatus) dateMap[yearMothKey] = 1 // 表示月份数据已获取
    if (!dayCalendarShowStatus) {
        dateMap[yearMothKey] = 1 // 表示年和月份数据已获取
        dateMap[yearKey] = 1 // 表示年和月份数据已获取
    }
    dateMap = Object.assign(calendarDataMap, dateMap)
    return dateMap
}
