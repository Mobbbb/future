import { genVH } from '@/libs/util'

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
            right: '3%',
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
                return `<div style="border: 1px solid #eeeeee;padding: 12px;border-radius: 4px;color: #000;display: flex;align-items: center;">
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
