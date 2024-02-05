<template>
    <div class="day-kline-wrap">
        <el-card class="analyse-card" style="margin: 12px;">
            <div id="DayLineChart"></div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getDayKLineOption } from './option'
import { fetchFutureFestivalInfo } from '@/api'
import { formatFutureFestivalData } from '@/libs/data-processing'

const store = new useStore()

let kLineChartIns = null
const activeDataTab = computed(() => store.state.app.activeDataTab)
const futureDayLineInfo = computed(() => store.state.order.futureDayLineInfo)

const getFutureDayLineInfo = (params) => store.dispatch('order/getFutureDayLineInfo', params)

const destroyKLineChart = () => {
    if (kLineChartIns) {
        kLineChartIns.clear()
        kLineChartIns.dispose()
        document.getElementById('DayLineChart').removeAttribute('_echarts_instance_')
        kLineChartIns = null
    }
}

const initDayKLine = async () => { // 获取节假日k线
    await getFutureDayLineInfo({ name: 'eb' })
    
    destroyKLineChart()
    const optionData = []
    futureDayLineInfo.value.forEach(item => {
        optionData.push([
            item.date,
            item.open,
            item.close,
            item.min,
            item.max,
            item.volume,
        ])
    })
    const option = getDayKLineOption(optionData)
    kLineChartIns = echarts.init(document.getElementById('DayLineChart'))
    kLineChartIns.setOption(option)
}

const getDataWhileActive = () => {
    if (activeDataTab.value === 'dayKLine') {
        initDayKLine()
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
.line-chart-wrap {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
}
#DayLineChart {
    width: 100%;
    height: 400px;
    margin-bottom: 1.5vh;
}
</style>
