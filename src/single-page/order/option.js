import { genVH, circleDom } from '@/libs/util'

const fillColor = ['#e82b42', '#11a642', '#ffb347']

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

export const getBarOption = (data, openDataMap) => {
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
            top: 90,
            bottom: 35,
            left: 0,
            right: 5,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            padding: 0,
            alwaysShowContent: true,
            triggerOn: 'click',
            className: 'analyse-bar-tooltip',
            formatter: function(params) {
                const name = params[0].data[0]
                const itemOpenData = openDataMap[name] || {}
                const buyOpenHands = itemOpenData.buyOpenHands || 0
                const saleOpenHands = itemOpenData.saleOpenHands || 0
                const color = params[0].data[1] > 0 ? fillColor[0] : fillColor[1]
                return `<div style="border: 1px solid #eeeeee;padding: 12px;border-radius: 4px;color: #000;font-size: 14px;line-height: 14px;">
                            <div style="display: flex;align-items: center;">
                                ${name}
                                <div style="width: 11px;margin: 0 4px 0 12px;">
                                    <div style="width: 100%;height: 3px;background: ${fillColor[0]};border-radius: 3px;margin-bottom: 2px;"></div>
                                    <div style="width: 100%;height: 3px;background: ${fillColor[1]};border-radius: 3px;margin-top: 2px;"></div>
                                </div>
                                ${params[0].dimensionNames[1]}
                                <span style="color: ${color};font-weight: bold;margin-left: 4px;">${Math.round(params[0].data[1])}</span>

                                <div style="width: 6px;height: 6px;border-radius: 10px;background: ${fillColor[2]};margin: 0 4px 0 12px;"></div>
                                ${params[0].dimensionNames[2]}
                                <span style="color: ${color};font-weight: bold;margin-left: 4px;">${params[0].data[2].toFixed(2)}%</span>
                            </div>
                            <div style="display: flex;align-items: center;margin-top: 10px;font-size: 12px;">
                                <span>多</span>
                                <span style="font-weight: bold;margin: 0 14px 0 4px;">${buyOpenHands}手</span>
                                <span>空</span>
                                <span style="font-weight: bold;margin: 0 14px 0 4px;">${saleOpenHands}手</span>
                                <span>多空比</span>
                                <span style="font-weight: bold;margin-left: 4px;">
                                    ${saleOpenHands ? (buyOpenHands / saleOpenHands).toFixed(2) : '-'}
                                </span>
                            </div>
                        </div>
                        `
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
                    fontSize: 10,
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
                        fontSize: 10,
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
                        fontSize: 10,
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
                fontSize: 10,
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
                    fontSize: 10,
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
                    fontSize: 10,
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
                        fontSize: 10,
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
                        fontSize: 10,
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
