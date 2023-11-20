import { dateFormat, dateGap, calculateDate } from 'umob'

export const genVH = (length) => {
    let clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    if (!clientHeight) return length
    return length * clientHeight / 800
}

export const parseDateParams = (dateParams) => {
    const params = {}
    if (dateParams[0]) {
        let prevDay = Date.parse(new Date(dateParams[0])) - 24 * 60 * 60 * 1000
        if (new Date(prevDay).getDay() === 0) { // 前一天是周日
            prevDay -= 2 * 24 * 60 * 60 * 1000
        }
        if (new Date(prevDay).getDay() === 6) { // 前一天是周六
            prevDay -= 1 * 24 * 60 * 60 * 1000
        }
        params.startDate = dateFormat(prevDay) + ' 20:55:00'
    }
    if (dateParams[1]) {
        let endDay = Date.parse(new Date(dateParams[1]))
        
        if (dateParams[0] === dateParams[1]) {
            if (new Date(endDay).getDay() === 0) { // 周日
                endDay += 1 * 24 * 60 * 60 * 1000
            } else if (new Date(endDay).getDay() === 6) { // 周六
                endDay += 2 * 24 * 60 * 60 * 1000
            }
        }

        params.endDate = dateFormat(endDay) + ' 20:54:59'
    }
    return params
}

export const getGapDate = (gap = 1) => {
    const end = new Date()
    const start = new Date()

    let deltaDay = 0
    if (end.getHours() >= 21) { // 9点之后，区间往后延一天
        deltaDay ++
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 1)
    }
    if (new Date(end).getDay() === 0) { // 明天是周日
        deltaDay ++
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 1)
    } else if (new Date(end).getDay() === 6) { // 明天是周六
        deltaDay = deltaDay + 2
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 2)
    }

    start.setTime(start.getTime() - 3600 * 1000 * 24 * (gap - deltaDay - 1))
    return [start, end]
}

/**
 * @description 获取归属的交易日期
 * @param {String} time yyyy-MM-dd hh:mm:ss 实际交易日期
 * @returns date yyyy-MM-dd 归属日期
 */
export const getBelongDealDate = (time) => {
    const date = new Date(time)
    const hours = Number(time.slice(11, 13))

    if (hours >= 21) { // 9点之后，区间往后延一天
        date.setTime(date.getTime() + 3600 * 1000 * 24 * 1)
    }
    if (new Date(date).getDay() === 0) { // 明天是周日
        date.setTime(date.getTime() + 3600 * 1000 * 24 * 1)
    } else if (new Date(date).getDay() === 6) { // 明天是周六
        date.setTime(date.getTime() + 3600 * 1000 * 24 * 2)
    }

    return dateFormat(date)
}

/**
 * @description 获取归属的交易日期区间
 * @param {String} time yyyy-MM-dd hh:mm:ss
 * @returns {Array} yyyy-MM-dd
 */
export const getBelongDealDateGap = (time) => {
    const date = new Date(time)
    const hours = Number(time.slice(11, 13))
    const strDate = time.slice(0, 10)

    if (hours >= 21) { // 9点之后，区间往后延一天
        date.setTime(date.getTime() + 3600 * 1000 * 24 * 1)

        if (new Date(date).getDay() === 0) { // 明天是周日
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 1)
        } else if (new Date(date).getDay() === 6) { // 明天是周六
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 2)
        }

        return [`${strDate} 20:55:00`, `${dateFormat(date)} 20:54:59`]
    } else {
        date.setTime(date.getTime() - 3600 * 1000 * 24 * 1)

        if (new Date(date).getDay() === 0) { // 前一天是周日
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 2)
        } else if (new Date(date).getDay() === 6) { // 前一天是周六
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 1)
        }

        return [`${dateFormat(date)} 20:55:00`, `${strDate} 20:54:59`]
    }
}

export const getMonthShortcuts = (num = 5) => {
    const now = dateFormat(new Date(), 'yyyy-MM')
    return dateGap(calculateDate(now, -num + 1), now).map(item => ({
        text: item.split('-').join('.'),
        value: [`${item}-01`, dateFormat(new Date(...item.split('-'), 0))],
    })).reverse()
}

export const getDateByStep = (date, num) => {
    let currentDate = calculateDate(date, num)

    const day = new Date(currentDate).getDay()
    
    if (day === 0 || day === 6) { // 跳过周末
        currentDate = getDateByStep(currentDate, num)
    }

    return currentDate
}
