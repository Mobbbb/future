<template>
    <div class="order-page-wrap">
        <el-tabs v-model="activeName" class="order-tab">
            <el-tab-pane label="开 / 平仓" name="order">
                <Order></Order>
            </el-tab-pane>
            <el-tab-pane label="交易记录" name="table">
                <Record></Record>
            </el-tab-pane>
            <el-tab-pane label="账户分析" name="analyse">
                <Analyse></Analyse>
            </el-tab-pane>
            <el-tab-pane label="数据分析" name="data">
                <Data></Data>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Order from './order.vue'
import Analyse from './analyse.vue'
import Record from './record.vue'
import Data from './data.vue'

export default {
    name: 'order',
    components: {
        Order,
        Analyse,
        Record,
        Data,
    },
    setup() {
        const store = new useStore()
        const setActiveOrderTab = (value) => store.commit('app/setActiveOrderTab', value)

        const activeName = computed({
            get() {
                return store.state.app.activeOrderTab
            },
            set(value) {
                setActiveOrderTab(value)
            },
        })

        return {
            activeName,
        }
    },
}
</script>

<style scoped>
#pane-add {
    overflow: auto;
}
.order-page-wrap {
    background: #fff;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}
.order-table {
    width: 100%;
    background: white;
    font-size: 12px;
}
.opening-order-table {
    width: calc(100% - 48px);
    max-height: 200px;
    font-size: 12px;
    margin: 16px 24px;
}
.table-search-input-wrap {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-left: 12px;
    font-size: 12px;
}
.search-item-wrap {
    display: flex;
    align-items: center;
    color: #606266;
    margin: 0 24px 12px 0;
}
.search-item-wrap span {
    flex-shrink: 0;
}
.card-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
}
.card-row-wrap {
    display: flex;
}
.card-column-wrap {
    display: flex;
    flex-direction: column;
    float: left;
}
.card-item-wrap {
    margin-right: 24px;
    margin-bottom: 12px;
}
.card-item-title {
    font-size: 12px;
    margin-bottom: 4px;
    color: var(--el-text-color-regular);
}
.card-item-value {
    font-size: 16px;
    font-weight: bold;
}
.card-item-combine-value {
    display: flex;
}
.card-item-combine-sign {
    margin: 0 2px;
    line-height: 20px;
}
.card-item-unit {
    font-size: 12px;
}
</style>

<style>
.order-table .el-table__body-wrapper {
    position: relative;
}
.order-table .el-table__empty-block {
    position: absolute;
    max-height: 60px;
    max-width: 100px;
    left: 0;
    right: 0;
    margin: 0 auto;
}
.order-tab {
    height: 100%;
}
.order-tab .el-tabs__content {
    height: calc(100% - 55px);
}
.order-tab .el-tab-pane {
    height: 100%;
    overflow-y: auto;
}
.order-tab .el-tabs__nav-scroll {
    padding-left: 12px;
}
.order-tab .el-table .positive-row .el-table__cell {
    color: rgb(255, 36, 54);
}
.order-tab .el-table .negative-row .el-table__cell {
    background: var(--el-color-success-light-9);
}
.order-tab .el-table .disable-row .el-table__cell {
    background: var(--el-color-info-light-9);
    color: var(--el-color-info-light-5);
}
.order-table.el-table.has-footer .el-table__inner-wrapper::before {
    bottom: 0;
}
.order-date-input .el-input__inner {
    padding-right: 12px;
    width: 180px;
}
</style>
