<template>
    <div class="festival-wrap">
        <el-card class="analyse-card" style="margin: 12px;">
            <div class="line-chart-wrap">
                <div id="FestivalLineChart" :class="`${prevClassName}-${index}`" v-for="(item, index) in kLineChartArr"></div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getKLineOption } from './option'
import { fetchFutureFestivalInfo } from '@/api'
import { formatFutureFestivalData } from '@/libs/data-processing'

const store = new useStore()

const prevClassName = 'k-line-chart'
const kLineChartIns = ref([])
const kLineChartArr = ref([])
const activeDataTab = computed(() => store.state.app.activeDataTab)

const destroyKLineChart = () => {
    if (kLineChartIns.value.length) {
        kLineChartIns.value.forEach((item, index) => {
            item.clear()
            item.dispose()
            document.getElementsByClassName(`${prevClassName}-${index}`)[0].removeAttribute('_echarts_instance_')
        })
        kLineChartIns.value = []
    }
}

const initFestivalKLine = async () => { // 获取节假日k线
    const res = await fetchFutureFestivalInfo()
    const { data = [] } = res
    const formatData = formatFutureFestivalData(data)
    kLineChartArr.value = formatData
    nextTick(() => {
        destroyKLineChart()
        kLineChartArr.value.forEach((item, index) => {
            const option = getKLineOption(item)
            const chartIns = echarts.init(document.getElementsByClassName(`${prevClassName}-${index}`)[0])
            chartIns.setOption(option)
            kLineChartIns.value.push(chartIns)
        })
    })
}

const getDataWhileActive = () => {
    if (activeDataTab.value === 'festival') {
        initFestivalKLine()
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
#FestivalLineChart {
    width: calc(50% - 14px);
    height: 300px;
    margin-bottom: 1.5vh;
}
</style>
