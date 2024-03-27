<template>
    <div class="festival-wrap">
        <div class="search-input-wrap">
            <el-select class="analyse-select" v-model="dataFutureBreed">
                <el-option label="苯乙烯" value="eb"></el-option>
            </el-select>
        </div>
        <el-card class="analyse-card" style="margin: 12px;">
            <div id="PositionChart" :style="config.ltMinWidth ? { width: '100%' } : {} "></div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getFestivalKLineOption, getPositionOption } from './option'
import { fetchFuturePositionInfo } from '@/api'
import { formatFutureFestivalData } from '@/libs/data-processing'
import config from '@/config'

const store = new useStore()

const prevClassName = 'k-line-chart'
let chartIns = null
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
    if (chartIns) {
        chartIns.clear()
        chartIns.dispose()
        document.getElementById('PositionChart').removeAttribute('_echarts_instance_')
        chartIns = null
    }
}

const initFestivalKLine = async () => { // 获取节假日k线
    const res = await fetchFuturePositionInfo({ name: dataFutureBreed.value })
    const { data = [] } = res

    const option = getPositionOption(data)
    chartIns = echarts.init(document.getElementById('PositionChart'))
    chartIns.setOption(option)
}

const getDataWhileActive = () => {
    if (activeDataTab.value === 'position') {
        initFestivalKLine()
    }
}

watch(activeDataTab, () => {
    if (!chartIns) {
        getDataWhileActive()
    }
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
    padding: 12px 0 12px 12px;
    font-size: 12px;
    border-bottom: 2px solid #e4e7ed;
    box-sizing: border-box;
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
#PositionChart {
    width: 100%;
    height: 300px;
}
</style>
