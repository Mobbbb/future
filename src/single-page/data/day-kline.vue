<template>
    <div class="closing-price-wrap">
        <div class="search-input-wrap">
            <el-select class="analyse-select" v-model="weekDay" @change="changeWeekday">
                <el-option :label="item" :value="Number(key)" v-for="(item, key) in weekdayMap"></el-option>
            </el-select>
            <el-select class="analyse-select" v-model="dataFutureBreed">
                <el-option label="苯乙烯" value="eb"></el-option>
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
                <div id="TotalLineChart"></div>
            </el-card>
            <el-card class="analyse-card" style="margin: 12px;">
                <div id="DayLineChart" :style="{ height: `${dayLineChartHeight}px`, marginBottom: '1.5vh', }"></div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getArrLineOption, getDayKLineOption, dayLineGirdHeight, dayLineGirdGap, getTotalKLineOption } from './option'
import { weekdayMap } from '@/config/festivalMap'
import { getBelongDealDateD, calculatePearsonCorrelation } from '@/libs/util'
import { sortCallback } from 'umob'

const store = new useStore()

let kLineChartIns = null
let totalLineChartIns = null
const weekDay = ref(getBelongDealDateD(new Date()).getDay())
const upRate = ref(50)
const dayLineChartHeight = ref(0)
const activeDataTab = computed(() => store.state.app.activeDataTab)
const futureDayLineInfo = computed(() => store.state.order.futureDayLineInfo)

const barWidth = computed(() => {
    return parseFloat(upRate.value) < 20 ? 20 : upRate.value
})

const dataFutureBreed = computed({
    get() {
        return store.state.order.dataFutureBreed
    },
    set(value) {
        setDataFutureBreed(value)
    },
})

const setDataFutureBreed = (data) => store.commit('order/setDataFutureBreed', data)
const getFutureDayLineInfo = (params) => store.dispatch('order/getFutureDayLineInfo', params)

const changeWeekday = () => {
    formatUnDownRate()
}

const destroyKLineChart = () => {
    if (kLineChartIns) {
        kLineChartIns.clear()
        kLineChartIns.dispose()
        document.getElementById('DayLineChart').removeAttribute('_echarts_instance_')
        kLineChartIns = null
    }
    if (totalLineChartIns) {
        totalLineChartIns.clear()
        totalLineChartIns.dispose()
        document.getElementById('TotalLineChart').removeAttribute('_echarts_instance_')
        totalLineChartIns = null
    }
}

const initDayKLine = async () => {
    await getFutureDayLineInfo({ name: dataFutureBreed.value, startDate: '2020-01-01' })
    
    destroyKLineChart()

    const totalLineData = []
    const yearMap = {}
    const dateSet = new Set()
    futureDayLineInfo.value.forEach(item => dateSet.add(item.date.slice(5, 10)))
    const dateArr = [...dateSet].sort((a, b) => a > b ? 1 : -1)

    futureDayLineInfo.value.forEach(item => {
        if (!yearMap[item.date.slice(0, 4)]) {
            yearMap[item.date.slice(0, 4)] = [[
                item.open,
                item.close,
                item.min,
                item.max,
                item.date.slice(5, 10),
            ]]
        } else {
            yearMap[item.date.slice(0, 4)].push([
                item.open,
                item.close,
                item.min,
                item.max,
                item.date.slice(5, 10),
            ])
        }
        totalLineData.push([
            item.date,
            item.open,
            item.max,
            item.min,
            item.close,
            item.volume,
            item.open > item.close ? 1 : -1,
        ])
    })

    dateArr.forEach((itemDate, index) => {
        Object.keys(yearMap).forEach(key => {
            if (!yearMap[key][index] || yearMap[key][index][4] !== itemDate) {
                yearMap[key].splice(index, 0, [
                    null,
                    null,
                    null,
                    null,
                    itemDate,
                ])
            }
        })
    })

    dayLineChartHeight.value = (dayLineGirdHeight + dayLineGirdGap) * Object.keys(yearMap).length + 60

    const option = getTotalKLineOption(totalLineData)
    totalLineChartIns = echarts.init(document.getElementById('TotalLineChart'))
    totalLineChartIns.setOption(option)

    nextTick(() => {
        const option = getDayKLineOption(dateArr, yearMap)
        kLineChartIns = echarts.init(document.getElementById('DayLineChart'))
        kLineChartIns.setOption(option)
    })
}

const formatUnDownRate = () => {
    let countUp = 0
    let countDown = 0
    futureDayLineInfo.value.forEach((item, index) => {
        const day = new Date(item.date).getDay()
        if (day === weekDay.value) {
            if (item.open > item.close) {
                countDown ++ // 跌
            } else if (item.open < item.close) {
                countUp ++ // 涨
            }
        }
    })
    upRate.value = (countUp / (countUp + countDown) * 100).toFixed(1)
}

const getDataWhileActive = async () => {
    if (activeDataTab.value === 'dayKline') {
        await initDayKLine()
        formatUnDownRate()
    }
}

watch(activeDataTab, () => {
    getDataWhileActive()
})

onMounted(() => {
    getDataWhileActive()
})

onBeforeUnmount(() => {
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
.analyse-select {
    width: 120px;
    margin-right: 12px;
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
#TotalLineChart {
    height: 300px;
    margin-bottom: 1.5vh;
}
</style>
