<template>
    <div class="data-page-wrap">
        <el-tabs v-model="activeName" class="data-tab">
            <el-tab-pane label="日K" name="dayKline">
                <DayKline></DayKline>
            </el-tab-pane>
            <el-tab-pane label="节假日" name="festival">
                <Festival></Festival>
            </el-tab-pane>
            <el-tab-pane label="主力收盘价" name="close">
                <ClosingPrice></ClosingPrice>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Festival from './festival.vue'
import ClosingPrice from './closing-price.vue'
import DayKline from './day-kline.vue'

const store = new useStore()
const setActiveDataTab = (value) => store.commit('app/setActiveDataTab', value)

const activeName = computed({
    get() {
        return store.state.app.activeDataTab
    },
    set(value) {
        setActiveDataTab(value)
    },
})
</script>

<style scoped>
.data-page-wrap {
    background: #fff;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}
</style>

<style>
.data-tab {
    height: 100%;
}
.data-tab .el-tabs__content {
    height: calc(100% - 55px);
}
.data-tab .el-tab-pane {
    height: 100%;
    overflow-y: auto;
}
.data-tab .el-tabs__nav-scroll {
    padding-left: 12px;
}
.data-tab .el-table .positive-row .el-table__cell {
    color: rgb(255, 36, 54);
}
.data-tab .el-table .negative-row .el-table__cell {
    background: var(--el-color-success-light-9);
}
.data-tab .el-table .disable-row .el-table__cell {
    background: var(--el-color-info-light-9);
    color: var(--el-color-info-light-5);
}
</style>
