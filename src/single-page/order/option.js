import { genVH } from '@/libs/util'
import { CHUNJIE_YEAR_MAP } from '@/config/festivalMap'

const fillColor = ['#e82b42', '#11a642', '#ffb347']

const festivalMap = {
    0: '春节',
    1: '国庆',
    2: '五一',
}

const areaColorArr = [
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: fillColor[0]
        },
        {
            offset: 1,
            color: '#f23a69'
        }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: fillColor[1]
        },
        {
            offset: 1,
            color: '#0e8936'
        }
    ]),
]

const fontSize = genVH(10)

function yAxisMax(maxValue) {
    if (isNaN(maxValue / 1) || maxValue / 1 < 10) {
        return 10
    }
    const max = Math.ceil(maxValue) + '';
    const itemValue = Math.ceil(max / 5) + '';
    const mins = Math.ceil((itemValue / Math.pow(10, itemValue.length - 1)))
    const item = mins * Math.pow(10, itemValue.length - 1) + '';
    // item 需要是5的整数倍
    const res = Math.ceil(item / 5) * 5 * 5;
    return res
}

// 获取y轴 数值，上部分割数，下部分割数
function getYAxisConfig(dataSource, serieIndexs = []) {
    // y轴数值
    let yData = []
    dataSource.forEach((item, index) => {
        if (index > 0) { // 第一行数据不取值
            serieIndexs.forEach(serie => {
                yData.push(item[serie + 1] || 0)
            })
        }
    })
    // 绝对值最大值
    let absMax = yData.reduce((num1, num2) => {
        return Math.abs(num1) > Math.abs(num2) ? Math.abs(num1) : Math.abs(num2)
    })
    // 间隔值：默认分割段数 5
    let interval = yAxisMax(Math.abs(absMax)) / 5

    // 取最大值
    let max = Math.max(...yData)
    // 取最小值
    let min = Math.min(...yData)

    let topSplitNumber = max > 0 ? Math.ceil(max / interval) : 0
    let downSplitNumber = min < 0 ? Math.ceil(Math.abs(min) / interval) : 0
    return {
        interval: interval,
        yData: interval,
        topSplitNumber: topSplitNumber,
        downSplitNumber: downSplitNumber
    }

}

// 解决分割线不对齐
function splitLineAlign(dataSource, yAxisIndexSeries, option) {
    let applyObj = {}
    let topSplitNumbers = []
    let downSplitNumbers = []
    for (let key in yAxisIndexSeries) {
        applyObj[key] = getYAxisConfig(dataSource, yAxisIndexSeries[key])
        topSplitNumbers.push(applyObj[key].topSplitNumber)
        downSplitNumbers.push(applyObj[key].downSplitNumber)
    }
    let topSplitNumber = Math.max(...topSplitNumbers)
    let downSplitNumber = Math.max(...downSplitNumbers)

    for (let key in applyObj) {
        if (option.yAxis[key]) {
            option.yAxis[key]['max'] = applyObj[key].interval * topSplitNumber
            option.yAxis[key]['min'] = applyObj[key].interval * downSplitNumber * (-1) // x轴下部分 负数
            option.yAxis[key]['interval'] = applyObj[key].interval
        }
    }
}

// 获取各y轴对应的serie
function getYAxisIndexSeries(series, dataSource, option) {
    let yAxisIndexSeries = {}
    series.forEach((item, index) => {
        if (!item.yAxisIndex) { // 默认y轴
            if (!yAxisIndexSeries.hasOwnProperty("0")) {
                yAxisIndexSeries['0'] = [index]
            } else {
                yAxisIndexSeries['0'].push(index)
            }
        } else if (item.yAxisIndex) {
            let key = item.yAxisIndex + ""
            if (!yAxisIndexSeries.hasOwnProperty(key)) {
                yAxisIndexSeries[key] = [index]
            } else {
                yAxisIndexSeries[key].push(index)
            }
        }
    })

    if (Object.keys(yAxisIndexSeries).length > 1) { // 存在多条y轴
        splitLineAlign(dataSource, yAxisIndexSeries, option)
    }
}

function circleDom(color, size, left = 0, right = 4) {
    return `<span style="display: inline-block; width: ${size}px; height: ${size}px; border-radius: 50%; background: ${color}; margin: 0 ${right}px 0 ${left}px;vertical-align: middle;"></span>`
}

export const getBarOption = (data) => {
    let sourceData = []
    Object.keys(data).forEach(key => {
        sourceData.push([key, data[key].totalProfit, data[key].winNum / data[key].totalNum * 100])
    })
    sourceData = [
        ['product', '盈亏', '胜率'],
        ...sourceData,
    ]

    if (sourceData.length <= 1) {
        sourceData = [
            ['product', '盈亏', '胜率'],
            ['', 0, 0],
        ]
    }

    const option = {
        legend: {
            show: false,
        },
        grid: {
            top: 60,
            bottom: 35,
            left: 0,
            right: 5,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            padding: 0,
            textStyle: {
                fontSize: genVH(12),
            },
            alwaysShowContent: true,
            triggerOn: 'click',
            className: 'analyse-bar-tooltip',
            formatter: function(data) {
                const color = data[0].data[1] > 0 ? fillColor[0] : fillColor[1]
                return `<div style="border: 1px solid #eeeeee;padding: 12px;border-radius: 4px;color: #000;display: flex;align-items: center;font-size: 14px;line-height: 14px;">
                            ${data[0].data[0]}
                            
                            <div style="width: 11px;margin: 0 4px 0 12px;">
                                <div style="width: 100%;height: 3px;background: ${fillColor[0]};border-radius: 3px;margin-bottom: 2px;"></div>
                                <div style="width: 100%;height: 3px;background: ${fillColor[1]};border-radius: 3px;margin-top: 2px;"></div>
                            </div>
                            ${data[0].dimensionNames[1]}
                            <span style="color: ${color};font-weight: bold;margin-left: 4px;">${Math.round(data[0].data[1])}</span>

                            <div style="width: 6px;height: 6px;border-radius: 10px;background: ${fillColor[2]};margin: 0 4px 0 12px;"></div>
                            ${data[0].dimensionNames[2]}
                            <span style="color: ${color};font-weight: bold;margin-left: 4px;">${data[0].data[2].toFixed(2)}%</span>
                        </div>`
            },
            position: [0, 0],
        },
        xAxis: {
            type: 'category',
            interval: 0,
            axisPointer: {
                show: true,
                type: 'line',
                lineStyle: {
                    color: '#222',
                    type: 'solid',
                },
            },
            axisTick: {
                show: false,
            },
            axisLine: {
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
        yAxis: [
            {
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#f1f3f8',
                        type: 'dashed',
                    },
                },
                axisLabel: {
                    show: true,
                    // *$修改 axisTick 颜色
                    textStyle: {
                        color: (value) => {
                            // *$隐藏0坐标
                            return value !== '0' ? '#8e8e8e' : 'rgba(0, 0, 0, 0)'
                        },
                        fontSize,
                    },
                },
            },
            {
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#f1f3f8',
                        type: 'dashed',
                    },
                },
                axisLabel: {
                    formatter: '{value}%',
                    show: true,
                    // *$修改 axisTick 颜色
                    textStyle: {
                        color: (value) => {
                            // *$隐藏0坐标
                            return value !== '0' ? '#8e8e8e' : 'rgba(0, 0, 0, 0)'
                        },
                        fontSize,
                    },
                },
            }
        ],
        dataZoom: [{
            type: 'slider',
            brushSelect: false,
            showDetail: false,
            height: 12,
            bottom: 10,
            handleIcon: 'path://M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z,M663.703704 325.982363v371.734274a26.788948 26.788948 0 0 1-53.276896 0V325.982363a26.788948 26.788948 0 0 1 53.276896 0z m-132.740741 0v371.734274a26.788948 26.788948 0 0 1-53.276896 0V325.982363a26.788948 26.788948 0 0 1 53.276896 0z m-132.740741 0v371.734274a26.788948 26.788948 0 0 1-53.276896 0V325.982363a26.788948 26.788948 0 0 1 53.276896 0z',
            handleSize: 24,
            handleStyle: {
                color: 'white',
                borderWidth: 1,
                borderColor: '#dedede',
            },
            textStyle: {
                fontSize,
            },
            backgroundColor: "#f6f7f8",
            dataBackground: {
                lineStyle: {
                    color: 'transparent',
                },
                areaStyle: {
                    color: 'transparent',
                },
            },
            selectedDataBackground: {
                lineStyle: {
                    color: 'transparent',
                },
                areaStyle: {
                    color: 'transparent',
                },
            },
            fillerColor: '#d5dee6',
            borderColor: 'transparent',
            emphasis: {
                handleStyle: {
                    color: 'white',
                    borderColor: '#dedede',
                },
            },
        }],
        series: [
            {
                type: 'bar',
                barWidth: '50%',
                barMaxWidth: 40,
                animationDuration: 500,
                itemStyle: {
                    color: (params) => params.data[1] > 0 ? areaColorArr[0] : areaColorArr[1],
                },
                label: {
                    show: false,
                    fontSize,
                },
            },
            {
                type: 'scatter',
                animationDuration: 500,
                itemStyle: {
                    color: fillColor[2],
                },
                label: {
                    show: false,
                    fontSize,
                },
                yAxisIndex: 1,
            }
        ],
        dataset: {
            source: sourceData,
        },
    }

    getYAxisIndexSeries(option.series, sourceData, option)

    return option
}

export const getDoubleKLineOption = (params, config) => {
    const {
        lineXAxis1,
        lineXAxis2,
        lineYAxis1,
        lineYAxis2,
        totalPrice,
        lineXAxisInfo1,
        lineXAxisInfo2,
    } = params

    let combineArr = new Set(totalPrice)
    combineArr.delete(null)
    let min = Math.min(...combineArr)
    const minLength = String(min).length
    let formatRate = Math.pow(10, (minLength - 2))
    formatRate = formatRate < 1 ? 1 : formatRate
    min = Math.floor(min / formatRate) * formatRate

    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false
            },
            className: 'k-line-tooltip',
            formatter: function(data) {
                let buyItem = {}
                let saleItem = {}
                if (data[0].seriesName === '多单') {
                    buyItem = data[0]
                    saleItem = data[1]
                } else {
                    buyItem = data[1]
                    saleItem = data[0]
                }

                let buyDate1 = ''
                let buyDate2 = ''
                let saleDate1 = ''
                let saleDate2 = ''
                if (lineXAxisInfo1[buyItem.data[0]]) {
                    buyDate1 = `(${lineXAxisInfo1[buyItem.data[0]][1].date.slice(5)})`
                    buyDate2 = `(${lineXAxisInfo1[buyItem.data[0]][0].date.slice(5)})`
                }

                if (lineXAxisInfo2[saleItem.data[0]]) {
                    saleDate1 = `(${lineXAxisInfo2[saleItem.data[0]][1].date.slice(5)})`
                    saleDate2 = `(${lineXAxisInfo2[saleItem.data[0]][0].date.slice(5)})`
                }

                return `
                        <div style="border: 1px solid rgb(255, 255, 255);">
                            <div style="line-height: 1; margin-top: 4px;">${circleDom('#eb5454', 10)}<span>多单</span></div>          
                            <div style="line-height: 1; margin-top: 10px;">${circleDom('#eb5454', 4, 3, 7)}买开${buyDate1}
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${buyItem.data[1] || ''}</span>
                            </div>
                            <div style="line-height: 1; margin-top: 10px;">${circleDom('#eb5454', 4, 3, 7)}卖平${buyDate2}
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${buyItem.data[2] || ''}</span>
                            </div>
                            <div style="line-height: 1; margin-top: 10px;">
                                ${circleDom('#eb5454', 4, 3, 7)}每手盈亏
                                <span style="color: ${buyItem.data[2] - buyItem.data[1] > 0 ? fillColor[0] : fillColor[1]};font-weight: bold;margin-left: 20px; float: right;">
                                    ${(buyItem.data[2] - buyItem.data[1]) * config.num || ''}
                                </span>
                            </div>
                            
                            <div style="line-height: 1; margin-top: 16px;">${circleDom('#47b262', 10)}<span>空单</span></div>  
                            <div style="line-height: 1; margin-top: 10px;">${circleDom('#47b262', 4, 3, 7)}卖开${saleDate1}
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${saleItem.data[2] || ''}</span>
                            </div>        
                            <div style="line-height: 1; margin-top: 10px;">${circleDom('#47b262', 4, 3, 7)}买平${saleDate2}
                                <span style="font-weight: bold;margin-left: 20px; float: right;">${saleItem.data[1] || ''}</span>
                            </div>
                            <div style="line-height: 1; margin-top: 10px;">
                                ${circleDom('#47b262', 4, 3, 7)}每手盈亏
                                <span style="color: ${saleItem.data[2] - saleItem.data[1] > 0 ? fillColor[0] : fillColor[1]};font-weight: bold;margin-left: 20px; float: right;">
                                    ${(saleItem.data[2] - saleItem.data[1]) * config.num || ''}
                                </span>
                            </div>
                        </div>
                `
            },
            position: function (pos, params, dom, rect, size) {
                // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                var obj = { top: 100 }
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
                left: 20,
                right: 40,
                top: '5%',
                height: '40%',
                containLabel: false,
            },
            {
                left: 20,
                right: 40,
                top: '55%',
                height: '40%',
                containLabel: false,
            }
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
                data: lineXAxis1,
            },
            {
                gridIndex: 1,
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
                data: lineXAxis2,
                position: 'top'
            }
        ],
        yAxis: [
            {
                name: '',
                type: 'value',
                position: 'right',
                min,
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
            },
            {
                name: '',
                gridIndex: 1,
                type: 'value',
                inverse: true,
                position: 'right',
                min,
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
            }
        ],
        series: [
            {
                name: '多单',
                type: 'candlestick',
                data: lineYAxis1,
            },
            {
                name: '空单',
                type: 'candlestick',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: lineYAxis2,
            },
        ]
    }
}

export const getOrderLineOption = (data) => {
    return {
        tooltip: {
            trigger: 'axis',
            formatter: `{c}`
        },
        grid: {
            top: 10,
            bottom: 10,
            left: 0,
            right: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: data.x,
            interval: 0,
            axisPointer: {
                show: true,
                type: 'line',
                lineStyle: {
                    color: '#222',
                    type: 'solid',
                },
            },
            axisTick: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: '#d0d0d0',
                    width: 1,
                },
            },
            axisLabel: {
                textStyle: {
                    color: '#8e8e8e',
                    fontSize: 10,
                },
            },
        },
        yAxis: {
            type: 'value',
            min: Math.round(Math.min(...data.y) * 0.95 / 100) * 100,
            max: Math.ceil(Math.max(...data.y) * 1.05 / 100) * 100,
            axisTick: {
                show: false,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#f1f3f8',
                    type: 'dashed',
                },
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#d0d0d0',
                    width: 1,
                },
            },
            axisPointer: {
                show: true,
                type: 'line',
                lineStyle: {
                    color: '#222',
                    type: 'solid',
                },
            },
            axisLabel: {
                show: true,
                // *$修改 axisTick 颜色
                textStyle: {
                    color: (value) => {
                        // *$隐藏0坐标
                        return value !== '0' ? '#8e8e8e' : 'rgba(0, 0, 0, 0)'
                    },
                    fontSize: 10,
                },
            },
        },
        series: [
            {
                data: data.y,
                type: 'line',
                itemStyle: {
                    color: '#ef97b2',
                },
                label: {
                    show: true,
                    fontSize: 8,
                },
                animation: true,
                animationDuration: 300,
            }
        ]
    }
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
                            <div style="line-height: 1;">${circleDom(color, 9, 3, 7)}开盘
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
            text: `${year.slice(0, 4)}年${festivalMap[type]}`,
            subtext: `${name.slice(name.length - 2, name.length)}合约`,
            x: 'center',
            itemGap: 5,
        },
        grid: [
            {
                left: 40,
                right: 20,
                bottom: '10%',
                top: 50,
                containLabel: false,
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

export const getArrLineOption = (data, name) => {
    const series = []
    let xAxis = []
    let totalPrice = []
    Object.keys(data).forEach(key => {
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
        grid: [{
            left: 45,
            right: 10,
            top: 30,
            containLabel: false,
        }],
        legend: {
            bottom: 10,
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
                    fontSize: 10,
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
