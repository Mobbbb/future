import { genVH } from '@/libs/util'

const areaColorArr = [
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: '#e82b42'
        },
        {
            offset: 1,
            color: '#f23a69'
        }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: '#11a642'
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
    let interval = yAxisMax(absMax) / 5

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

export const getBarOption = (data) => {
    let sourceData = []
    Object.keys(data).forEach(key => {
        sourceData.push([key, data[key].totalProfit, data[key].winNum / data[key].totalNum * 100])
    })
    sourceData = [
        ['product', '盈亏', '胜率'],
        ...sourceData,
    ]

    const option = {
        legend: {
            show: false,
        },
        grid: {
            top: 60,
            bottom: '3%',
            left: 0,
            right: '3%',
            containLabel: true,
        },
        axisPointer: {
            lineStyle: {
                color: '#222',
                type: 'solid',
            },
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
                return `<div style="border: 1px solid #eeeeee;padding: 12px;border-radius: 4px;color: #222;">
                            ${data[0].data[0]}
                            ${data[0].dimensionNames[1]} ${data[0].data[1]}
                            ${data[0].dimensionNames[2]} ${data[0].data[2]}
                        </div>`
            },
            position: [0, 0],
        },
        xAxis: {
            type: 'category',
            axisPointer: {
                show: true,
                type: 'line',
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
                    color: '#333',
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
                            return value !== '0' ? '#333' : 'rgba(0, 0, 0, 0)'
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
                            return value !== '0' ? '#333' : 'rgba(0, 0, 0, 0)'
                        },
                        fontSize,
                    },
                },
            }
        ],
        series: [
            {
                type: 'bar',
                barWidth: '22%',
                animationDuration: 500,
                itemStyle: {
                    color: (params) => params.data[1] > 0 ? areaColorArr[0]: areaColorArr[1],
                },
                label: {
                    show: false,
                    fontSize,
                },
            },
            {
                type: 'scatter',
                animationDuration: 500,
                lineStyle: {
                    color: '#ffb347',
                },
                itemStyle: {
                    color: '#ffb347',
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
