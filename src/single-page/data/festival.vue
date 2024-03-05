<template>
    <div class="festival-wrap">
        <div class="search-input-wrap">
            <el-select class="analyse-select" v-model="dataFutureBreed">
                <el-option label="苯乙烯" value="eb"></el-option>
            </el-select>
        </div>
        <el-card class="analyse-card" style="margin: 12px;">
            <div class="line-chart-wrap">
                <div id="FestivalLineChart"
                    :style="config.ltMinWidth ? { width: '100%' } : {} "
                    :class="`${prevClassName}-${index}`"
                    v-for="(item, index) in kLineChartArr">
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getFestivalKLineOption } from './option'
import { fetchFutureFestivalInfo } from '@/api'
import { formatFutureFestivalData } from '@/libs/data-processing'
import config from '@/config'

const store = new useStore()

const prevClassName = 'k-line-chart'
const kLineChartIns = ref([])
const kLineChartArr = ref([])
const activeDataTab = computed(() => store.state.app.activeDataTab)
const dataFutureBreed = computed({
    get() {
        return store.state.order.dataFutureBreed
    },
    set(value) {
        setDataFutureBreed(value)
    },
})

const setDataFutureBreed = (data) => store.commit('order/setDataFutureBreed', data)

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
    const res = await fetchFutureFestivalInfo({ name: dataFutureBreed.value })
    const { data = [] } = res
    const formatData = formatFutureFestivalData(data)
    kLineChartArr.value = formatData
    nextTick(() => {
        destroyKLineChart()
        kLineChartArr.value.forEach((item, index) => {
            const option = getFestivalKLineOption(item)
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
#FestivalLineChart {
    width: calc(50% - 14px);
    height: 300px;
    margin-bottom: 1.5vh;
}
</style>
