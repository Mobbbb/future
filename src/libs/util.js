/**
 * @description 数组或对象的深度克隆
 * @param {*} obj
 * @returns {*} 返回新的克隆数组或对象
 */
export const deepClone = function (obj) {
    const newObj = Array.isArray(obj) ? [] : {}

    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = (obj && typeof obj[key] === 'object') ? deepClone(obj[key]) : obj[key]
            }
        }
    }
    return newObj
}

/**
 * @description 降序 3,2,1
 * @param {String} key
 * @returns
 */
export const descendingOrder = (key = '') => {
    return function (a, b) {
        if (key) {
            return b[key] - a[key]
        } else {
            return b - a
        }
    }
}

/**
 * @description 升序 1,2,3
 * @param {String} key
 * @returns
 */
export const ascendingOrder = (key = '') => {
    return function (a, b) {
        if (key) {
            return a[key] - b[key]
        } else {
            return a - b
        }
    }
}

// cdn - https://code.jquery.com/jquery-3.6.0.min.js
export async function getMsgBoard() {
    let arr = []
    let start = 0
    let request = (start) => {
        return new Promise((resolve) => {
            $.ajax({
                url: `//user.qzone.qq.com/proxy/domain/m.qzone.qq.com/cgi-bin/new/get_msgb?uin=491450147&hostUin=737436264&start=${start}&s=0.20934140455035966&format=jsonp&num=10&inCharset=utf-8&outCharset=utf-8&g_tk=440174541&g_tk=440174541`,
                dataType: 'jsonp',
                success: function (response) {
                    let data = response.data || {}
                    let commentList = data.commentList || []
                    resolve(commentList)
                },
                jsonpCallback: '_Callback',
            })
        })
    }

    let wait = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 500)
        })
    }

    let dg = async () => {
        let result = await request(start)
        arr = arr.concat(result)
        start += 10
        console.log(arr)
        if (arr.length < 1166) {
            await wait()
            await dg()
        }
    }

    await dg()

    return arr
}

export function getQueryVariable(variable) {
    let query = window.location.search.substring(1)
    let vars = query.split("&")
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=")
        if (pair[0] == variable) {
            return pair[1]
        }
    }
    return null
}

export function getCurrentTime() {
    var date = new Date() // 当前时间
    var year = date.getFullYear() // 年
    var month = repair(date.getMonth() + 1) // 月
    var day = repair(date.getDate()) // 日
    var hour = repair(date.getHours()) // 时
    var minute = repair(date.getMinutes()) // 分
    var second = repair(date.getSeconds()) // 秒

    // 当前时间 
    var curTime = year + "-" + month + "-" + day
        + " " + hour + ":" + minute + ":" + second;
    return curTime
}

// 若是小于10就加个0
function repair(i) {
    if (i >= 0 && i <= 9) {
        return "0" + i;
    } else {
        return i;
    }
}

export function getDateBetween(startTime, endTime) {

    let dateArr = [];
    let i = 0;

    while (startTime <= endTime) {
        dateArr[i] = startTime;

        let timestamp = new Date(startTime).getTime();
        let nDate = timestamp + (24 * 60 * 60 * 1000);

        let Y = new Date(nDate).getFullYear() + '-';
        let m = (new Date(nDate).getMonth() + 1 < 10) ? '0' + (new Date(nDate).getMonth() + 1) + '-' : (new Date(nDate).getMonth() + 1) + '-';
        let d = (new Date(nDate).getDate() < 10) ? '0' + new Date(nDate).getDate() : new Date(nDate).getDate();

        startTime = Y + m + d;
        i++;
    }

    return dateArr;
}

export const dateFormat = (date, fmt = 'yyyy-MM-dd') => {
    if (!(date instanceof Date)) {
        date = new Date(date)
    }
    var a = ['日', '一', '二', '三', '四', '五', '六']
    var o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds(), // 毫秒
        'w': date.getDay(), // 周
        'W': a[date.getDay()], // 大写周
        'T': 'T'
    }
    if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
    }
    return fmt
}

export const genVH = (length) => {
    let clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    if (!clientHeight) return length
    return length * clientHeight / 800
}

export const getCookie = (name) => {
    const cookieArr = document.cookie.split(';')
    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=')
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1])
        }
    }
    return null
}

export const delCookie = (name) => {
    const domain = location.hostname
    // ios中需要添加max-age=0
    document.cookie = `${name}=${getCookie(name)};expires=${new Date(1)};max-age=0;domain=${domain};path=/`
}

export const formatNumUnit = (num, float = 2) => {
    let flag = false
    if (num === null || num === '' || typeof num === 'undefined') return {
        num: 0,
        unit: '',
    }

    if (/[^0-9\.\-]/.test(num)) return {
        num,
        unit: '',
    }

    if (num < 0) {
        num = 0 - num
        flag = true
    }

    let arr = num.toString().split('.')

    let length = arr[0].length
    let result = arr[0]
    let unit = ''
    if (length < 5) { // 0 - 9,999
        result = arr[0]
        unit = ''
        if (arr.length > 1) {
            result = Number(num).toFixed(float)
        }
    } else if (length >= 5 && length <= 8) { // 10,000 - 99,999,999
        result = (arr[0] / 10000).toFixed(float)
        unit = '万'
    } else {
        result = (arr[0] / 100000000).toFixed(float)
        unit = '亿'
    }

    if (flag) result = '-' + result
    return {
        num: result,
        unit,
    }
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
        params.startDate = dateFormat(prevDay, 'yyyy-MM-dd') + ' 21:00:00'
    }
    if (dateParams[1]) {
        params.endDate = dateFormat(dateParams[1], 'yyyy-MM-dd') + ' 20:59:59'
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

export const getMonthShortcuts = () => {
    const date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    const monthShortcuts = []
    for (let i = 0; i < 5; i++) {
        year = month < 1 ? year - 1 : year
        month = month < 1 ? month + 12 : month
        let nMonth = (month + 1) > 12 ? (month + 1) - 12 : (month + 1)
        let nYear = (month + 1) > 12 ? year + 1 : year

        const nextMonth = new Date(nYear, nMonth - 1, 1)
        let nPrevDay = Date.parse(nextMonth) - 24 * 60 * 60 * 1000
        
        monthShortcuts.push({
            text: month < 10 ? `${year}.${'0' + month}` : `${year}.${month}`,
            value: [new Date(year, month - 1, 1), dateFormat(nPrevDay, 'yyyy-MM-dd')],
        })
        month--
    }
    return monthShortcuts
}

export const getMonth = (date, direction) => {
    // 将输入的日期字符串转换为日期对象
    let currentDate = date

    if (!(date instanceof Date)) {
        currentDate = new Date(date)
    }
  
    // 获取目标月份的年份和月份
    let year, month
    if (direction === 'prev') {
      year = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()
      month = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1
    } else if (direction === 'next') {
      year = currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()
      month = currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1
    } else {
      throw new Error('Direction argument must be either "prev" or "next"')
    }
  
    // 创建一个新的日期对象，表示目标月份的同一天
    const targetMonthDate = new Date(year, month, currentDate.getDate())
  
    // 将新日期对象转换为字符串，格式为yyyy-mm-dd
    const formattedDate = targetMonthDate.toISOString().slice(0, 10)
  
    // 返回目标月份的日期字符串
    return formattedDate
  }
  
