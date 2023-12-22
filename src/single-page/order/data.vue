<template>
    <div class="future-wrap">
        <div class="search-input-wrap">
            <el-select class="analyse-select" v-model="weekDay" @change="changeWeekday">
                <el-option :label="item" :value="Number(key)" v-for="(item, key) in weekdayMap"></el-option>
            </el-select>
        </div>
        <div class="analyse-content-wrap">
            <div class="total-analyse-wrap">
                <div class="bar-wrap">
                    <div class="left-bar" :style="{ width: `${barWidth}%` }">
                        <div class="total-analyse-value"><span>{{upRate}}%</span></div>
                    </div>
                    <div class="right-bar" :style="{ width: `${100 - barWidth}%` }">
                        <div class="total-analyse-value total-analyse-value-right"><span>{{100 - upRate}}%</span></div>
                    </div>
                    <div class="parallelogram" :style="{ left: `calc(${barWidth}% - 27px / 2)` }"></div>
                </div>
            </div>
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="line-chart-wrap">
                    <div id="lineChart" :class="`k-line-chart-${index}`" v-for="(item, index) in kLineChartArr"></div>
                </div>
            </el-card>
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="line-chart-wrap">
                    <div id="lineChart" :class="`line-chart-${index}`" v-for="(item, index) in lineChartArr"></div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getArrLineOption, getKLineOption } from './option'
import { dateFormat, calculateDate, toMonth } from 'umob'
import { fetchFutureFestivalInfo } from '@/api'
import { formatFutureFestivalData } from '@/libs/data-processing'
import { weekdayMap } from '@/config/festivalMap'

const store = new useStore()

const lineChartIns = ref([])
const kLineChartIns = ref([])
const weekDay = ref((new Date()).getDay())
const upRate = ref(50)
const lineChartArr = ref([])
const kLineChartArr = ref([])
const activeOrderTab = computed(() => store.state.app.activeOrderTab)
const futureDayLineList = computed(() => store.state.order.futureDayLineList)

const barWidth = computed(() => {
    return parseFloat(upRate.value) < 20 ? 20 : upRate.value
})

const getFutureDayLineList = (params) => store.dispatch('order/getFutureDayLineList', params)

const changeWeekday = () => {
    formatData()
}

const destroyLineChart = () => {
    if (lineChartIns.value.length) {
        lineChartIns.value.forEach((item, index) => {
            item.clear()
            item.dispose()
            document.getElementsByClassName(`line-chart-${index}`)[0].removeAttribute('_echarts_instance_')
        })
        lineChartIns.value = []
    }
}

const destroyKLineChart = () => {
    if (kLineChartIns.value.length) {
        kLineChartIns.value.forEach((item, index) => {
            item.clear()
            item.dispose()
            document.getElementsByClassName(`k-line-chart-${index}`)[0].removeAttribute('_echarts_instance_')
        })
        kLineChartIns.value = []
    }
}

const initFestivalKLine = async () => {
    const res = await fetchFutureFestivalInfo()
    const { data = [] } = res
    const formatData = formatFutureFestivalData(data)
    kLineChartArr.value = formatData
    nextTick(() => {
        destroyKLineChart()
        kLineChartArr.value.forEach((item, index) => {
            const option = getKLineOption(item)
            const chartIns = echarts.init(document.getElementsByClassName(`k-line-chart-${index}`)[0])
            chartIns.setOption(option)
            kLineChartIns.value.push(chartIns)
        })
    })
}

const initLineChart = async () => {
    nextTick(() => {
        destroyLineChart()
        lineChartArr.value.forEach((item, index) => {
            const option = getArrLineOption(item, index + 1)
            const chartIns = echarts.init(document.getElementsByClassName(`line-chart-${index}`)[0])
            chartIns.setOption(option)
            lineChartIns.value.push(chartIns)
        })
    })
}

const formatData = () => {
    let countUp = 0
    let countDown = 0
    let cursor = null
    let yearMonthMap = {}
    futureDayLineList.value.reduce((prevReturnVal, cur) => {
        if (new Date(cur.date).getDay() === weekDay.value && prevReturnVal) {
            if (cur.rof === 0) {
                countDown ++ // 跌
            } else if (cur.rof === 1) {
                countUp ++ // 涨
            } else if (cur.rof === null) {
                if (cur.close > prevReturnVal.close) {
                    countUp ++ // 涨
                } else if (cur.close < prevReturnVal.close) {
                    countDown ++ // 跌
                } 
            }
        }
        
        if (cur.change) {
            cursor = cur.change
            if (cur.date > '2020-03-28') {
                yearMonthMap[cursor] = [cur]
            } else {
                yearMonthMap[cursor] = []
            }
        } else if (cursor && yearMonthMap[cursor]) {
            if (cur.date > '2020-03-28') {
                yearMonthMap[cursor].push(cur)
            }
        }
        
        return cur
    }, null)

    const lineMap = {}
    Object.keys(yearMonthMap).forEach(key => {
        const dateArr = yearMonthMap[key].map(item => item.date.slice(5, 10))
        if (lineMap[key.slice(2, 4)]) {
            lineMap[key.slice(2, 4)][key.slice(0, 2)] = yearMonthMap[key]
        } else {
            lineMap[key.slice(2, 4)] = {}
            lineMap[key.slice(2, 4)][key.slice(0, 2)] = yearMonthMap[key]
        }
    })
    Object.keys(lineMap).forEach(month => {
        Object.keys(lineMap[month]).forEach(year => {
            lineMap[month][year].forEach((item, index) => {
                item.value = item.close
                item.index = index
            })
        })
        lineChartArr.value[parseInt(month) - 1] = lineMap[month]
    })

    upRate.value = (countUp / (countUp + countDown) * 100).toFixed(1)
}

const initAnalyseData = async () => {
    await getFutureDayLineList({ name: 'eb' })
    formatData()
    initLineChart()
}

const getDataWhileActive = () => {
    if (activeOrderTab.value === 'data') {
        initAnalyseData()
        initFestivalKLine()
    }
}

watch(activeOrderTab, () => {
    getDataWhileActive()
})

onMounted(() => {
    getDataWhileActive()
})

onBeforeUnmount(() => {
    destroyLineChart()
    destroyKLineChart()
})
</script>

<style scoped>
.search-input-wrap {
    color: #606266;
    padding: 0 0 0 12px;
    font-size: 12px;
    border-bottom: 2px solid #e4e7ed;
    box-sizing: border-box;
    height: 42px;
}
.total-analyse-wrap {
    text-align: center;
    position: relative;
    box-sizing: border-box;
    margin-top: 12px;
}
.bar-wrap {
    position: relative;
    height: 50px;
    width: 100%;
    overflow: hidden;
}
.total-analyse-wrap .left-bar, .total-analyse-wrap .right-bar {
    position: absolute;
    z-index: 1;
    background: linear-gradient(90deg, #fff, rgba(243, 63, 109, 1) 100%);
    top: 0.5px;
    bottom: 0.5px;
    transition: .3s all ease-in-out;
}
.total-analyse-wrap .right-bar {
    right: 0;
    z-index: 2;
    background: linear-gradient(90deg, rgba(17, 166, 66, 1), #fff 100%);
    top: 0.5px;
    bottom: 0.5px;
}
.parallelogram {
    position: absolute;
    width: 27px;
    height: 100%;
    transform: skewX(-30deg);
    background: white;
    z-index: 3;
    transition: .3s all  ease-in-out;
}
.total-analyse-value {
    color: white;
    position: absolute;
    right: 30px;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    height: 100%;
    font-weight: bold;
}
.total-analyse-value-right {
    left: 30px;
    right: unset;
}
.analyse-select {
    width: 120px;
    margin-right: 12px;
}
.line-chart-wrap {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
}
#lineChart {
    width: calc(50% - 14px);
    height: 300px;
    margin-bottom: 1.5vh;
}
</style>
