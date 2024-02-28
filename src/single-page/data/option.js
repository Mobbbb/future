import { genVH } from '@/libs/util'
import { CHUNJIE_YEAR_MAP, festivalTypeMap, weekdayMap } from '@/config/festivalMap'

const fontSize = genVH(10)

function circleDom(color, size, left = 0, right = 4) {
    return `<span style="display: inline-block; width: ${size}px; height: ${size}px; border-radius: 50%; background: ${color}; margin: 0 ${right}px 0 ${left}px;vertical-align: middle;"></span>`
}

export const getKLineOption = (params) => {
    const { x, y, year, name, type } = params

    let totalPrice = []
    y.forEach(item => totalPrice = totalPrice.concat(item))
    
    let compareDate = ''
    if (type === 0) {
        compareDate = CHUNJIE_YEAR_MAP[year]
    } else if (type === 1) {
        compareDate = '10-01'
    } else {
        compareDate = '05-01'
    }

    let chunjieDate = ''
    for (let i = 0; i < x.length; i++) {
        if (compareDate < x[i]) {
            chunjieDate = x[i - 1] || ''
            break
        }
    }

    let combineArr = new Set(totalPrice)
    combineArr.delete(null)
    let min = Math.min(...combineArr)
    const minLength = String(min).length
    let formatRate = Math.pow(10, (minLength - 2))
    formatRate = formatRate < 1 ? 1 : formatRate
    min = Math.floor(min / formatRate) * formatRate - formatRate

    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false
            },
            className: 'k-line-tooltip',
            formatter: function(data) {
                const color = data[0].value[2] > data[0].value[1] ? '#eb5454' : '#47b262'

                return `
                        <div style="border: 1px solid rgb(255, 255, 255);">
                            <div style="line-height: 1;">${data[0].name} - ${weekdayMap[new Date(`${year}-${data[0].name}`).getDay()]}</div>
                            <div style="line-height: 1; margin-top: 10px;">${circleDom(color, 9, 3, 7)}开盘
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${data[0].value[1]}</span>
                            </div>
                            <div style="line-height: 1; margin-top: 10px;">${circleDom(color, 9, 3, 7)}收盘
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${data[0].value[2]}</span>
                            </div>
                            <div style="line-height: 1; margin-top: 10px;">${circleDom(color, 9, 3, 7)}最低
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${data[0].value[3]}</span>
                            </div>
                            <div style="line-height: 1; margin-top: 10px;">${circleDom(color, 9, 3, 7)}最高
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${data[0].value[4]}</span>
                            </div>
                        </div>
                `
            },
            position: function (pos, params, dom, rect, size) {
                var obj = { top: 100 }
                if ((pos[0] < size.viewSize[0] / 2)) {
                    obj.right = 5
                } else {
                    obj.left = 44
                }
                return obj
            },
        },
        axisPointer: {
            show: true,
            label: {
                precision: 0,
                padding: [5, 5, 5, 5],
            },
        }, 
        title: {
            text: `${year.slice(0, 4)}年${festivalTypeMap[type]}`,
            subtext: `${name.slice(name.length - 2, name.length)}合约`,
            x: 'center',
            itemGap: 5,
        },
        grid: [
            {
                left: 5,
                right: 5,
                bottom: '10%',
                top: 50,
                containLabel: true,
            },
        ],
        xAxis: [
            {
                type: 'category',
                axisLine: {
                    onZero: true,
                    lineStyle: {
                        color: '#d0d0d0',
                        width: 1,
                    },
                },
                axisLabel: {
                    textStyle: {
                        color: '#8e8e8e',
                        fontSize,
                    },
                },
                data: x,
            },
        ],
        yAxis: [
            {
                name: '',
                type: 'value',
                nameGap: 20,
                boundaryGap: false,
                min,
                max: function (value) {
                    return parseInt((value.max / 100)) * 100 + 250
                },
                axisLabel: {
                    textStyle: {
                        color: '#8e8e8e',
                        fontSize: 12,
                    },
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#f1f3f8',
                        type: 'dashed',
                    },
                },
            },
        ],
        series: [
            {
                name: '多单',
                type: 'candlestick',
                data: y,
                markPoint: {
                    label: {
                        formatter: function (param) {
                            return param != null ? Math.round(param.value) + '' : '';
                        }
                    },
                    data: [
                        {
                            name: 'highest value',
                            type: 'max',
                            valueDim: 'highest',
                            itemStyle: {
                                color: 'transparent',
                            },
                            label: {
                                textStyle: {
                                    color: '#eb5454',
                                    fontSize: 10,
                                },
                                position: 'insideBottom',
                                distance: 0,
                            },
                        },
                        {
                            name: 'lowest value',
                            type: 'min',
                            valueDim: 'lowest',
                            itemStyle: {
                                color: 'transparent',
                            },
                            label: {
                                textStyle: {
                                    color: '#47b262',
                                    fontSize: 10,
                                },
                                position: 'insideBottom',
                                distance: -14,
                            },
                        },
                    ],
                },
                markLine: {
                  symbol: ['none', 'none'],
                  data: [
                        [
                            {
                                name: 'from lowest to highest',
                                type: 'min',
                                valueDim: 'lowest',
                                symbol: 'circle',
                                symbolSize: 0,
                                label: {
                                    show: false
                                },
                                emphasis: {
                                    label: {
                                        show: false
                                    }
                                }
                            },
                            {
                                type: 'max',
                                valueDim: 'highest',
                                symbol: 'circle',
                                symbolSize: 0,
                                label: {
                                    show: false
                                },
                                emphasis: {
                                    label: {
                                        show: false
                                    }
                                }
                            },
                        ],
                        {
                            xAxis: chunjieDate,
                            lineStyle: {
                                color: '#d0d0d0',
                                opacity: 0.5,
                            },
                            label: {
                                position: 'end',
                                distance: [0, -20],
                            },
                        },
                    ],
                },
            },
        ],
    }
}

const skipMap = {
    '5': '20',
    '6': '20',
    '7': '20',
    '8': '20',
    '9': '20',
    '10': '20',
    '11': '20',
    '12': '20',
    '1': '21',
    '2': '21',
}
export const getArrLineOption = (data, name) => {
    const series = []
    let xAxis = []
    let totalPrice = []
    Object.keys(data).forEach(key => {
        if (skipMap[name.toString()] !== key) {
            totalPrice = totalPrice.concat(data[key].map(item => item.value))
            xAxis = data[key].length > xAxis.length ? data[key].map(item => item.index) : xAxis
            series.push({
                name: key,
                type: 'line',
                data: data[key],
                smooth: true,
                connectNulls: true,
                symbol: 'none',
                lineStyle: {
                    width: 1,
                },
                itemStyle: {
                    // color: colorArr[index],
                },
                label: {
                    show: false,
                    position: 'insideTopRight'
                },
            })
        }
    })
    xAxis = xAxis.map(item => xAxis.length - item)
    
    let combineArr = new Set(totalPrice)
    combineArr.delete(null)
    let min = Math.min(...combineArr)
    const minLength = String(min).length
    let formatRate = Math.pow(10, (minLength - 2))
    formatRate = formatRate < 1 ? 1 : formatRate
    min = Math.floor(min / formatRate) * formatRate

    return {
        grid: [
            {
                left: 5,
                right: 5,
                bottom: '10%',
                top: 50,
                containLabel: true,
            },
        ],
        legend: {
            bottom: genVH(4),
        },
        axisPointer: {
            show: true,
            label: {
                precision: 0,
                padding: [5, 5, 5, 5],
            },
        },
        title: {
            text: `${name < 10 ? '0' + name : name}合约`,
            x: 'center',
            y: genVH(10),
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false
            },
            className: 'k-line-tooltip',
            formatter: function(data) {
                let str = ''
                for (let i = data.length - 2; i > -1; i --) {
                    const marginTop = i === data.length - 2 ? '' : 'margin-top: 10px;'
                    str += `<div style="line-height: 1;${marginTop}">${circleDom(data[i].color, 9, 3, 7)}${data[i].data.date}
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${data[i].value}</span>
                            </div>`
                }

                return `<div style="border: 1px solid rgb(255, 255, 255);">${str}</div>`
            },
            position: function (pos, params, dom, rect, size) {
                var obj = { top: 100 }
                if ((pos[0] < size.viewSize[0] / 2)) {
                    obj.right = 5
                } else {
                    obj.left = 44
                }
                return obj
            },
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: '#d0d0d0',
                    width: 1,
                },
            },
            axisLabel: {
                textStyle: {
                    color: '#8e8e8e',
                    fontSize: 12,
                },
                // rotate: 45,
            },
            data: xAxis,
        }],
        yAxis: [{
            name: '',
            min,
            nameTextStyle: {
                padding: [0, 0, 0, 0],
            },
            type: 'value',
            axisLabel: {
                textStyle: {
                    color: '#8e8e8e',
                    fontSize: 12,
                },
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#f1f3f8',
                    type: 'dashed',
                },
            },
        }],
        series,
    }
}

export const dayLineGirdHeight = 100
export const dayLineGirdGap = 20
export const getDayKLineOption = (dateArr, yearMap) => {
    const upColor = '#ec0000'
    const upBorderColor = '#8A0000'
    const downColor = '#00da3c'
    const downBorderColor = '#008F28'

    const gridArr = []
    const xAxisArr = []
    const yAxisArr = []
    const seriesArr = []
    const dataZoomArr = []

    Object.keys(yearMap).forEach((key, index) => {
        const isLastOne = Object.keys(yearMap).length - 1 === index
        dataZoomArr.push(index)
        gridArr.push({
            top: 12 + dayLineGirdHeight * index + dayLineGirdGap * index,
            left: '7%',
            right: 12,
            height: dayLineGirdHeight,
        })
        xAxisArr.push({
            gridIndex: index,
            type: 'category',
            boundaryGap: false,
            // inverse: true,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
            axisTick: {
                show: isLastOne,
            },
            axisLine: {
                show: isLastOne,
                onZero: true,
                lineStyle: {
                    color: '#d0d0d0',
                    width: 1,
                },
            },
            axisLabel: {
                show: isLastOne,
                textStyle: {
                    color: '#8e8e8e',
                    fontSize,
                },
            },
            data: dateArr,
        })
        yAxisArr.push({
            gridIndex: index,
            scale: true,
            axisLabel: {
                textStyle: {
                    color: '#8e8e8e',
                    fontSize,
                },
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#f1f3f8',
                    type: 'dashed',
                },
            },
        })
        seriesArr.push({
            type: 'candlestick',
            itemStyle: {
                color: upColor,
                color0: downColor,
                borderColor: upBorderColor,
                borderColor0: downBorderColor,
            },
            data: yearMap[key],
            xAxisIndex: index,
            yAxisIndex: index,
        })
    })

    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
            },
            show: true,
            position: function (pos, params, dom, rect, size) {
                // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                var obj = { top: 20 }
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5
                return obj
            }
        },
        axisPointer: {
            link: [
                {
                    xAxisIndex: 'all'
                }
            ],
        }, 
        grid: gridArr,
        xAxis: xAxisArr,
        yAxis: yAxisArr,
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: dataZoomArr,
                start: 0,
                end: 100,
            },
            {
                show: true,
                xAxisIndex: dataZoomArr,
                type: 'slider',
                bottom: 10,
                start: 0,
                end: 100,
            },
        ],
        series: seriesArr,
    }
}

export const getTotalKLineOption = (data) => {
    const upColor = '#ec0000'
    const upBorderColor = '#8A0000'
    const downColor = '#00da3c'
    const downBorderColor = '#008F28'

    return {
        dataset: {
            source: data,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
            },
            show: true,
            position: function (pos, params, dom, rect, size) {
                // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                var obj = { top: 20 }
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5
                return obj
            }
        },
        axisPointer: {
            link: [
                {
                    xAxisIndex: 'all'
                }
            ]
        }, 
        grid: [
            {
                top: 12,
                left: '7%',
                right: 12,
                bottom: 140,
            },
            {
                left: '7%',
                right: 12,
                height: 80,
                bottom: 50
            }
        ],
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                // inverse: true,
                axisLine: { onZero: false },
                splitLine: { show: false },
                min: 'dataMin',
                max: 'dataMax',
                axisLine: {
                    onZero: true,
                    lineStyle: {
                        color: '#d0d0d0',
                        width: 1,
                    },
                },
                axisLabel: {
                    textStyle: {
                        color: '#8e8e8e',
                        fontSize,
                    },
                },
            },
            {
                type: 'category',
                gridIndex: 1,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax',
            }
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: true,
                },
                axisLabel: {
                    textStyle: {
                        color: '#8e8e8e',
                        fontSize,
                    },
                },
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
            },
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 10,
                end: 100,
            },
            {
                show: true,
                xAxisIndex: [0, 1],
                type: 'slider',
                bottom: 10,
                start: 10,
                end: 100,
            },
        ],
        visualMap: {
            show: false,
            seriesIndex: 1,
            dimension: 6,
            pieces: [
                {
                    value: 1,
                    color: upColor,
                },
                {
                    value: -1,
                    color: downColor,
                },
            ],
        },
        series: [
            {
                type: 'candlestick',
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: upBorderColor,
                    borderColor0: downBorderColor,
                },
                encode: {
                    x: 0,
                    y: [1, 4, 3, 2],
                },
            },
            {
                name: 'Volumn',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    color: '#7fbe9e'
                },
                large: true,
                encode: {
                    x: 0,
                    y: 5,
                },
            },
        ],
    }
}
