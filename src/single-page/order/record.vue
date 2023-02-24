<template>
    <div class="record-wrap" ref="tableTabWrap">
        <div class="table-search-input-wrap" ref="searchInputWrap">
            <div class="search-item-wrap">
                <span>起止日期：</span>
                <el-date-picker
                    v-model="searchParams.date"
                    type="daterange"
                    unlink-panels
                    range-separator="To"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :clearable="false"
                    :shortcuts="shortcuts"
                    @change="changeInputHandle"
                    class="date-picker"
                    popper-class="date-picker-popper"
                    style="width: 260px;" />
            </div>
            <div class="search-item-wrap">
                <span>合约名：</span>
                <el-input v-model="searchParams.name" clearable placeholder="请输入合约名" style="width: 120px;" />
            </div>
            <div class="search-item-wrap">
                <span>开/平：</span>
                <el-select v-model="searchParams.openOrClose" @change="changeInputHandle" clearable style="width: 120px;">
                    <el-option label="平" :value="0"></el-option>
                    <el-option label="开" :value="1"></el-option>
                </el-select>
            </div>
            <div class="search-item-wrap">
                <span>状态：</span>
                <el-select v-model="searchParams.status" @change="changeInputHandle" style="width: 120px;">
                    <el-option label="全部" :value="0"></el-option>
                    <el-option label="已平" :value="1"></el-option>
                    <el-option label="未平" :value="2"></el-option>
                </el-select>
            </div>
            <div class="search-item-wrap">
                <el-button type="primary" @click="searchHandle">搜索</el-button>
                <el-button @click="resetHandle">重置</el-button>
            </div>
        </div>
        <el-table class="order-table" 
            v-loading="loading"
            show-summary 
            :height="orderTableHeight"
            :data="orderList"
            :summary-method="getSummaries"
            :row-class-name="tableRowClassName">
            <el-table-column prop="name" label="合约" width="70" fixed="left" />
            <el-table-column prop="buyOrSale" label="买/卖" width="60" align="center">
                <template #default="scope">
                    <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                        {{scope.row.buyOrSale ? '买' : '卖'}}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="price" label="成交价" />
            <el-table-column prop="hands" label="手数" />
            <el-table-column prop="commission" label="手续费" />
            <el-table-column prop="openOrClose" label="开/平">
                <template #default="scope">
                    <span>{{scope.row.openOrClose ? '开' : '平'}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="date" label="交易时间" width="180" />
            <el-table-column prop="closeHands" label="状态">
                <template #default="scope">
                    <span v-if="(scope.row.closeHands === null)">--</span>
                    <span v-else-if="scope.row.closeHands === 0">未平</span>
                    <span v-else-if="scope.row.closeHands === scope.row.hands">已平</span>
                    <span v-else>已平{{scope.row.closeHands}}手</span>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="成交序号" width="90" />
            <el-table-column prop="linkId" label="关联序号" />
            <el-table-column prop="profit" label="平仓盈亏" width="90" align="center">
                <template #default="scope">
                    <div v-if="(scope.row.profit || scope.row.profit === 0)"
                        :style="scope.row.profit > 0 ? { color: '#eb4436' } : { color: '#0e9d58' }">
                        <span style="font-weight: bold;">{{scope.row.profit}}</span>
                    </div>
                    <div v-else class="talbe-block-cell">--</div>
                </template>
            </el-table-column>
            <el-table-column prop="totalProfit" label="净盈亏" width="90" fixed="right" align="center">
                <template #default="scope">
                    <div v-if="(scope.row.totalProfit || scope.row.totalProfit === 0)"
                        :style="scope.row.totalProfit > 0 ? { color: '#eb4436' } : { color: '#0e9d58' }">
                        <span style="font-weight: bold;">{{scope.row.totalProfit}}</span>
                    </div>
                    <div v-else class="talbe-block-cell">--</div>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="72">
                <template #default="scope">
                    <el-button link
                        type="danger"
                        size="small"
                        @click.prevent="deleteRow(scope)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog v-model="centerDialogVisible"
            title="警告"
            width="280px">
            <span>确定要删除吗？</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="danger" @click="confirmDelete">确定</el-button>
                    <el-button @click="centerDialogVisible = false">取消</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fetchDeleteOrder } from '@/api'
import { parseDateParams, getGapDate, getMonthShortcuts } from '@/libs/util'

export default {
    name: 'record',
    setup() {
        const monthShortcuts = getMonthShortcuts()
        const store = new useStore()
        const orderList = computed(() => store.state.order.orderList)
        const activeOrderTab = computed(() => store.state.app.activeOrderTab)
        const isLogin = computed(() => store.getters['app/isLogin'])
        const searchInputWrap = ref()
        const tableTabWrap = ref()
        const orderTableHeight = ref(0)
        const loading = ref(false)
        const centerDialogVisible = ref(false)

        const searchParams = reactive({
            date: getGapDate(),
            name: '',
            openOrClose: '',
            startDate: '',
            endDate: '',
            status: 0,
        })

        const shortcuts = [
            {
                text: '今日',
                value: () => {
                    return getGapDate()
                },
            },
            {
                text: '近7天',
                value: () => {
                    return getGapDate(7)
                },
            },
            {
                text: '近30天',
                value: () => {
                    return getGapDate(30)
                },
            },
            {
                text: '近365天',
                value: () => {
                    return getGapDate(365)
                },
            },
            ...monthShortcuts,
        ]

        const getOrderData = (params) => store.dispatch('order/getOrderData', params)
        const setOrderList = (value) => store.commit('order/setOrderList', value)

        const tableRowClassName = ({ row }) => {
            if (!row.openOrClose) {
                return 'negative-row'
            } else if (row.closeHands === row.hands) { // 已被全平
                return 'disable-row'
            }
        }

        const getTableData = async () => {
            if (!isLogin.value) return
            const params = parseDateParams(searchParams.date)
            searchParams.startDate = params.startDate
            searchParams.endDate = params.endDate
            loading.value = true
            await getOrderData(searchParams)
            loading.value = false
        }

        let currentDeleteItem = null
        const deleteRow = async (data) => {
            currentDeleteItem = data
            centerDialogVisible.value = true
        }

        const confirmDelete = async () => {
            if (currentDeleteItem) {
                await fetchDeleteOrder(currentDeleteItem.row.id)
                getTableData()
            }
            centerDialogVisible.value = false
        }

        const getSummaries = (param) => {
            const { columns, data } = param
            const sums = []
            const calcPropertyArr = ['totalProfit', 'commission', 'profit']
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                    return
                }
                if (!calcPropertyArr.includes(column.property)) {
                    sums[index] = '--'
                    return
                }
                const values = data.map((item) => Number(item[column.property]))
                if (!values.every((value) => Number.isNaN(value))) {
                    sums[index] = values.reduce((prev, curr) => {
                        const value = Number(curr)
                        if (!Number.isNaN(value)) {
                            return prev + curr
                        } else {
                            return prev
                        }
                    }, 0)
                    sums[index] = sums[index].toFixed(2)
                } else {
                    sums[index] = '--'
                }
            })
            return sums
        }
        
        const searchHandle = () => {
            getTableData()
        }

        const changeInputHandle = () => {
            getTableData()
        }

        const resetHandle = () => {
            searchParams.name = ''
            searchParams.openOrClose = ''
            searchParams.date = monthShortcuts[0].value
            searchParams.startDate = ''
            searchParams.endDate = ''
            searchParams.status = 0
            getTableData()
        }

        window._rerenderRecordTable_ = () => {
            getTableData()
        }

        watch(isLogin, (value) => {
            if (value) {
                getTableData()
            } else {
                setOrderList([]) // 清空数据
            }
        })

        watch(activeOrderTab, (value) => {
            if (value === 'table') {
                nextTick(() => {
                    if (!orderTableHeight.value) {
                        orderTableHeight.value = tableTabWrap.value.getBoundingClientRect().height - searchInputWrap.value.getBoundingClientRect().height
                    }
                })
            }
            if (value === 'table' && isLogin.value) {
                getTableData()
            }
        })

        onMounted(() => {
            if (activeOrderTab.value === 'table') {
                nextTick(() => {
                    if (!orderTableHeight.value) {
                        orderTableHeight.value = tableTabWrap.value.getBoundingClientRect().height - searchInputWrap.value.getBoundingClientRect().height
                    }
                })
            }
            if (activeOrderTab.value === 'table' && isLogin.value) {
                getTableData()
            }
        })

        return {
            loading,
            centerDialogVisible,
            orderList,
            searchInputWrap,
            tableTabWrap,
            orderTableHeight,
            shortcuts,
            searchParams,
            tableRowClassName,
            deleteRow,
            getSummaries,
            searchHandle,
            resetHandle,
            changeInputHandle,
            confirmDelete,
        }
    },
}
</script>

<style scoped>
.record-wrap {
    width: 100%;
    height: 100%;
}
.order-table {
    width: 100%;
    background: white;
    font-size: 12px;
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
.order-table.el-table.has-footer .el-table__inner-wrapper::before {
    bottom: 0;
}
</style>
