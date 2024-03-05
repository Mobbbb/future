<template>
    <div class="closing-price-wrap">
        <div class="search-input-wrap">
            <el-select class="analyse-select" v-model="dataFutureBreed">
                <el-option label="苯乙烯" value="eb"></el-option>
            </el-select>
        </div>
        <div class="analyse-content-wrap">
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="line-chart-wrap">
                    <div id="ClosingLineChart"
                        :style="config.ltMinWidth ? { width: '100%' } : {}"
                        :class="`${prevClassName}-${index}`"
                        v-for="(item, index) in lineChartArr">
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getCloseLineOption } from './option'
import config from '@/config'

const store = new useStore()

const prevClassName = 'close-line-chart'
const lineChartIns = ref([])
const lineChartArr = ref([])
const activeDataTab = computed(() => store.state.app.activeDataTab)
const futureDayShareInfo = computed(() => store.state.order.futureDayShareInfo)
const dataFutureBreed = computed({
    get() {
        return store.state.order.dataFutureBreed
    },
    set(value) {
        setDataFutureBreed(value)
    },
})

const setDataFutureBreed = (data) => store.commit('order/setDataFutureBreed', data)
const getFutureDayShareInfo = (params) => store.dispatch('order/getFutureDayShareInfo', params)

const destroyLineChart = () => {
    if (lineChartIns.value.length) {
        lineChartIns.value.forEach((item, index) => {
            item.clear()
            item.dispose()
            document.getElementsByClassName(`${prevClassName}-${index}`)[0].removeAttribute('_echarts_instance_')
        })
        lineChartIns.value = []
    }
}

const initLineChart = async () => {
    nextTick(() => {
        destroyLineChart()
        lineChartArr.value.forEach((item, index) => {
            const option = getCloseLineOption(item, index + 1)
            const chartIns = echarts.init(document.getElementsByClassName(`${prevClassName}-${index}`)[0])
            chartIns.setOption(option)
            lineChartIns.value.push(chartIns)
        })
    })
}

const formatData = () => {
    let cursor = null
    let yearMonthMap = {}
    futureDayShareInfo.value.reduce((prevReturnVal, cur) => {
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
}

const initAnalyseData = async () => { // 获取收盘价
    await getFutureDayShareInfo({ name: dataFutureBreed.value })
    formatData()
    initLineChart()
}

const getDataWhileActive = () => {
    if (activeDataTab.value === 'close') {
        initAnalyseData()
    }
}

watch(activeDataTab, () => {
    getDataWhileActive()
})

onMounted(() => {
    getDataWhileActive()
})

onBeforeUnmount(() => {
    destroyLineChart()
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
.line-chart-wrap {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
}
#ClosingLineChart {
    width: calc(50% - 14px);
    height: 300px;
    margin-bottom: 1.5vh;
}
</style>
