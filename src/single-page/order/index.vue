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
        </el-tabs>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Order from './order.vue'
import Analyse from './analyse.vue'
import Record from './record.vue'

export default {
    name: 'order',
    components: {
        Order,
        Analyse,
        Record,
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
.order-page-wrap {
    background: #fff;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}
</style>

<style>
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
</style>
