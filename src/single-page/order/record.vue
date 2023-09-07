<template>
    <div class="record-wrap" ref="tableTabWrap">
        <div class="table-search-input-wrap" ref="searchInputWrap">
            <div class="search-item-wrap">
                <span>起止日期：</span>
                <el-button  type="text" 
                            :icon="DArrowLeft" 
                            class="header-icon-btn change-date-icon" 
                            @click="selectDate(-1)">
                </el-button>
                <el-date-picker
                    v-model="searchParams.date"
                    type="daterange"
                    unlink-panels
                    range-separator="To"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :clearable="false"
                    :editable="false"
                    :shortcuts="shortcuts"
                    @change="selectDate"
                    class="date-picker"
                    popper-class="date-picker-popper"
                    style="width: 260px;" />
                <el-button  type="text" 
                            :icon="DArrowRight" 
                            class="header-icon-btn change-date-icon" 
                            @click="selectDate(1)">
                </el-button>
            </div>
            <div class="search-item-wrap">
                <span>合约名：</span>
                <el-input v-model="searchParams.name" clearable placeholder="请输入合约名" style="width: 120px;" />
            </div>
            <div class="search-item-wrap">
                <span>开/平：</span>
                <el-select v-model="searchParams.openOrClose" @change="changeInputHandle" clearable style="width: 90px;">
                    <el-option label="平" :value="0"></el-option>
                    <el-option label="开" :value="1"></el-option>
                </el-select>
            </div>
            <div class="search-item-wrap">
                <span>买/卖：</span>
                <el-select v-model="searchParams.buyOrSale" @change="changeInputHandle" clearable style="width: 90px;">
                    <el-option label="买" :value="1"></el-option>
                    <el-option label="卖" :value="0"></el-option>
                </el-select>
            </div>
            <div class="search-item-wrap">
                <span>状态：</span>
                <el-select v-model="searchParams.status" @change="changeInputHandle" style="width: 80px;">
                    <el-option label="全部" :value="0"></el-option>
                    <el-option label="已平" :value="1"></el-option>
                    <el-option label="未平" :value="2"></el-option>
                </el-select>
            </div>
            <div class="search-item-wrap">
                <el-button type="primary" @click="autoSubmit">一键录入</el-button>
                <el-button type="primary" @click="showSubmitViewHandle">收益录入</el-button>
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
            <el-table-column prop="buyOrSale" label="买/卖" width="60">
                <template #default="scope">
                    <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                        {{scope.row.buyOrSale ? '买' : '卖'}}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="price" label="成交价" width="90" />
            <el-table-column prop="hands" label="手数" width="60" />
            <el-table-column prop="commission" label="手续费" width="90" />
            <el-table-column prop="openOrClose" label="开/平" width="60">
                <template #default="scope">
                    <span>{{scope.row.openOrClose ? '开' : '平'}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="date" label="交易时间" min-width="140" />
            <el-table-column prop="id" label="成交序号" width="90" />
            <el-table-column prop="linkId" label="关联序号" :width="maxColunmWidth" />
            <el-table-column prop="closeHands" label="状态" width="60">
                <template #default="scope">
                    <span v-if="(scope.row.closeHands === null)">--</span>
                    <span v-else-if="scope.row.closeHands === 0">未平</span>
                    <span v-else-if="scope.row.closeHands === scope.row.hands">已平</span>
                    <span v-else>已平{{scope.row.closeHands}}手</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="right" width="142">
                <template #default="scope">
                    <el-button link
                        type="warning"
                        size="small"
                        v-if="!scope.row.openOrClose"
                        @click.prevent="cancelRow(scope)">
                        撤销
                    </el-button>
                    <el-button link
                        type="danger"
                        size="small"
                        @click.prevent="deleteRow(scope)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="profit" label="平仓盈亏" width="90" :fixed="overMediaCritical ? false : 'right'" align="center">
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
        </el-table>
        <div class="pagination-wrap">
            <el-pagination small background layout="total, prev, jumper, next"
                @current-change="onPageChange"
                :currentPage="searchParams.currentPage"
                :page-size="searchParams.pageSize"
                :total="orderCountNum.total"
                class="gc-pagination" />
            <div>{{ searchParams.pageSize }} 条/页</div>
        </div>
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
        <el-dialog v-model="importDialogVisible" title="收益录入" width="320px" :close-on-click-modal="false">
            <div class="table-input-wrap">
                <div class="table-input-item-wrap">
                    <span>日期：</span>
                    <el-date-picker v-model="submitData.date" type="date" placeholder="请选择日期" :editable="false" :clearable="false" />
                </div>
                <div class="table-input-item-wrap">
                    <span>收益：</span>
                    <el-input-number v-model="submitData.num" :controls="false" style="width: 80px;" />
                    <el-tag effect="plain" round v-if="isAdministrator" class="is-round" @click="formatSubmitNum">rate</el-tag>
                    <el-tag type="warning" effect="plain" round v-if="isAdministrator" class="is-round" @click="formatSubmitRestNum">rest</el-tag>
                    <el-input-number v-model="submitData.subNum" @input="inputSubNumHandle" v-if="isAdministrator || submitData.subNum" :controls="false" style="width: 70px;" />
                </div>
                <div class="table-input-item-wrap">
                    <span>角色：</span>
                    <el-select v-model="submitData.name" multiple placeholder="请选择角色" style="width: 240px;">
                        <el-option :label="item" :value="item" v-for="item in accountName" :key="item"></el-option>
                    </el-select>
                </div>
                <div class="table-input-item-wrap">
                    <span>备注：</span>
                    <el-input v-model="submitData.remark" class="ios-textarea" type="textarea" />
                </div>
            </div>
            <template #footer>
                <el-button type="primary" @click="submitHandle">录入</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fetchDeleteOrder, fetchCancelOrder, fetchInsertIncome, fetchIncomeLatestInfo, 
    fetchfutureLatestInfo, fetchOrderInfoHandle, fetchOrderInfoByUserIdHandle } from '@/api'
import { parseDateParams, getGapDate, getMonthShortcuts, getDateByStep, getBelongDealDate } from '@/libs/util'
import { ElMessage } from 'element-plus'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import { dateFormat } from 'umob'

const _rate_ = 11 / 26
const monthShortcuts = getMonthShortcuts(5)
const store = new useStore()
const searchInputWrap = ref()
const tableTabWrap = ref()
const orderTableHeight = ref(0)
const loading = ref(false)
const centerDialogVisible = ref(false)
const importDialogVisible = ref(false)
const maxColunmWidth = ref(80)
const orderCountNum = ref({ total: 0 })
const submitData = reactive({
    date: new Date(),
    num: 0,
    subNum: 0,
    name: '',
    remark: '',
})
const searchParams = reactive({
    date: [new Date(), new Date()],
    name: '',
    openOrClose: '',
    buyOrSale: '',
    startDate: '',
    endDate: '',
    status: 0,
    pageSize: 30,
    currentPage: 1,
})

const shortcuts = [
    { text: '今日', value: () => [new Date(), new Date()] },
    { text: '近7天', value: () => getGapDate(7) },
    { text: '近30天', value: () => getGapDate(30) },
    { text: '近365天', value: () => getGapDate(365) },
    ...monthShortcuts,
]

const orderList = computed(() => store.state.order.orderList)
const activeOrderTab = computed(() => store.state.app.activeOrderTab)
const isLogin = computed(() => store.getters['app/isLogin'])
const isAdministrator = computed(() => store.getters['app/isAdministrator'])
const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])

const accountName = computed(() => {
    const { account = '' } = store.state.app.USER_INFO
    if (account) return account.split(',')
    return []
})

const getOrderData = (params) => store.dispatch('order/getOrderData', params)
const setOrderList = (value) => store.commit('order/setOrderList', value)

const tableRowClassName = ({ row }) => {
    if (!row.openOrClose) {
        return 'negative-row'
    } else if (row.closeHands === row.hands) { // 已被全平
        return 'disable-row'
    }
}

const onPageChange = (value) => {
    searchParams.currentPage = value
    getTableData()
}

const getTableData = async () => {
    if (!isLogin.value) return
    const params = parseDateParams(searchParams.date)
    searchParams.startDate = params.startDate
    searchParams.endDate = params.endDate
    loading.value = true
    orderCountNum.value = await getOrderData(searchParams)
    let strLength = 0
    orderList.value.forEach(item => {
        if (item.linkId.length > strLength && item.linkId) {
            strLength = item.linkId.length
        }
    })
    if (strLength) maxColunmWidth.value = strLength * 9 < 80 ? 80 : strLength * 9
    loading.value = false
    submitData.num = orderCountNum.value.totalProfit || 0
}

let currentDeleteItem = null
const deleteRow = async (data) => {
    currentDeleteItem = data
    centerDialogVisible.value = true
}

const cancelRow = async (data) => {
    loading.value = true
    await fetchCancelOrder(data.row) // 回退开仓单
    getTableData()
}

const confirmDelete = async () => {
    if (currentDeleteItem) {
        loading.value = true
        await fetchDeleteOrder(currentDeleteItem.row.id)
        getTableData()
    }
    centerDialogVisible.value = false
}

const getSummaries = (param) => {
    const { columns } = param
    const sums = []
    const calcPropertyArr = ['totalProfit', 'commission', 'profit']
    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = '总计'
        } else if (!calcPropertyArr.includes(column.property)) {
            sums[index] = '--'
        } else {
            sums[index] = orderCountNum.value[column.property] || '--'
        }
        // const values = data.map((item) => Number(item[column.property]))
        // if (!values.every((value) => Number.isNaN(value))) {
        //     sums[index] = values.reduce((prev, curr) => {
        //         const value = Number(curr)
        //         if (!Number.isNaN(value)) {
        //             return prev + curr
        //         } else {
        //             return prev
        //         }
        //     }, 0)
        //     sums[index] = sums[index].toFixed(2)
        // } else {
        //     sums[index] = '--'
        // }
    })
    return sums
}

const searchHandle = () => {
    getTableData()
}

const changeInputHandle = () => {
    getTableData()
}

const selectDate = (num) => {
    if (typeof num === 'number') {
        searchParams.date = [getDateByStep(searchParams.date[0], num), getDateByStep(searchParams.date[1], num)]
    }
    getTableData()
}

const resetHandle = () => {
    searchParams.name = ''
    searchParams.openOrClose = ''
    searchParams.buyOrSale = ''
    searchParams.date = [new Date(), new Date()]
    searchParams.startDate = ''
    searchParams.endDate = ''
    searchParams.status = 0
    getTableData()
}

const submitHandle = async () => {
    if (!submitData.name.length) {
        ElMessage.error('请选择角色')
        return
    }
    const params = {
        date: dateFormat(new Date(submitData.date), 'yyyy-MM-dd'),
        num: Number((submitData.num + submitData.subNum).toFixed(5)) || 0,
        name: submitData.name.join(','),
        remark: submitData.remark,
    }
    const res = await fetchInsertIncome(params)
    if (res.success) {
        submitData.name = [...accountName.value]
        submitData.num = 0
        submitData.subNum = 0
        submitData.remark = ''
        ElMessage.success('录入成功')
    }
}

const formatSubmitNum = () => {
    submitData.name = accountName.value.slice(0, 2)
    const num = orderCountNum.value.totalProfit || 0
    submitData.num = Number((num * _rate_).toFixed(2))
    submitData.remark = `大号${submitData.num}，小号{${submitData.subNum}}`
}
const formatSubmitRestNum = () => {
    submitData.name = [accountName.value[accountName.value.length - 1]]
    const num = orderCountNum.value.totalProfit || 0
    submitData.num = Number((num - Number((num * _rate_).toFixed(2)) * 2).toFixed(2))
    submitData.subNum = 0
    submitData.remark = ''
}
const inputSubNumHandle = () => {
    if (submitData.name.length > 1) {
        submitData.remark = `大号${submitData.num}，小号{${submitData.subNum}}`
    }
}

const showSubmitViewHandle = () => {
    importDialogVisible.value = true
    submitData.name = accountName.value.slice(0, 2) // 默认选择账户前2位角色
    submitData.date = Date.parse(searchParams.date[0]) === Date.parse(searchParams.date[1]) ? searchParams.date[0] : new Date()
}

const autoSubmit = async () => {
    const latestIncomeRes = await fetchIncomeLatestInfo()
    const latestFutureRes = await fetchfutureLatestInfo()
    let latestIncomeDate = latestIncomeRes.data.date
    let latestFutureDate = latestFutureRes.data.date ? getBelongDealDate(latestFutureRes.data.date) : latestFutureRes.data.date
    async function submitIncomeItem () {
        if (latestIncomeDate && latestFutureDate && (latestIncomeDate < latestFutureDate)) {
            latestIncomeDate = getDateByStep(latestIncomeDate, 1)

            const params = parseDateParams([latestIncomeDate, latestIncomeDate])
            const result = await fetchOrderInfoHandle(params)
            const totalProfit = result.totalProfit || 0

            if (accountName.value.length) {
                if (isAdministrator.value) {
                    params.uid = '654321'
                    const subResult = await fetchOrderInfoByUserIdHandle(params) // 获取小号数据
                    if (!subResult.success) return

                    const subTotalProfit = subResult.totalProfit || 0
                    let incomeParams1 = null
                    let incomeParams2 = null
                    let res1 = { success: true }
                    let res2 = { success: true }
                    const num1 = Number((totalProfit * _rate_).toFixed(2))
                    const num2 = subTotalProfit / 2

                    if (!totalProfit && !subTotalProfit) { // 当天无数据，录入下一条
                        await submitIncomeItem()
                    } else if (!totalProfit && subTotalProfit) { // 仅有小号数据
                        incomeParams1 = { // 账户前2角色
                            date: latestIncomeDate,
                            num: num2,
                            name: accountName.value.slice(0, 2).join(','),
                            remark: `大号0，小号{${num2}}`,
                        }
                    } else {
                        incomeParams1 = { // 账户前2角色
                            date: latestIncomeDate,
                            num: Number((num1 + num2).toFixed(5)),
                            name: accountName.value.slice(0, 2).join(','),
                            remark: `大号${num1}，小号{${num2}}`,
                        }
                        incomeParams2 = { // 账户末尾角色
                            date: latestIncomeDate,
                            num: Number((totalProfit - num1 * 2).toFixed(2)),
                            name: accountName.value[accountName.value.length - 1],
                            remark: '',
                        }
                    }

                    if (incomeParams1) res1 = await fetchInsertIncome(incomeParams1)
                    if (incomeParams2) res2 = await fetchInsertIncome(incomeParams2)

                    if (res1.success && res2.success) {
                        ElMessage.success(`${latestIncomeDate} 录入成功`)
                        await submitIncomeItem()
                    } else {
                        ElMessage.error(`${latestIncomeDate} 录入失败`)
                    }
                } else {
                    if (!totalProfit) { // 当天无数据，录入下一条
                        await submitIncomeItem()
                    } else {
                        const incomeParams = {
                            date: latestIncomeDate,
                            num: totalProfit,
                            name: accountName.value[0],
                            remark: '',
                        }
                        const res = await fetchInsertIncome(incomeParams)
                        if (res.success) { // 录入下一条
                            ElMessage.success(`${latestIncomeDate} 录入成功`)
                            await submitIncomeItem()
                        } else {
                            ElMessage.error(`${latestIncomeDate} 录入失败`)
                        }
                    }
                }
            } else {
                ElMessage.error('角色信息错误')
            }
        } else {
            setTimeout(() => {
                ElMessage.success('录入完成')
            })
        }
    }
    submitIncomeItem()
}

window._rerenderRecordTable_ = () => {
    getTableData()
}

const initTable = () => {
    if (activeOrderTab.value === 'table') {
        nextTick(() => {
            if (!orderTableHeight.value) {
                orderTableHeight.value = tableTabWrap.value.getBoundingClientRect().height
                    - searchInputWrap.value.getBoundingClientRect().height
                    - 48
                // searchParams.pageSize = Math.ceil((orderTableHeight.value - 80) / 40)
                // searchParams.pageSize = searchParams.pageSize < 0 ? 10 : searchParams.pageSize
            }
            getTableData()
        })
    }
}

watch(isLogin, (value) => {
    if (value) {
        initTable()
    } else {
        setOrderList([]) // 清空数据
    }
})

watch(activeOrderTab, () => {
    initTable()
})

onMounted(() => {
    initTable()
})
</script>

<style scoped>
.record-wrap {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
}
.order-table {
    width: 100%;
    background: white;
    font-size: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
.table-search-input-wrap {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-left: 12px;
    font-size: 12px;
    background: white;
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
.table-input-wrap {
    background: #fff;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}
.table-input-item-wrap {
    display: flex;
    align-items: center;
    padding-top: 16px;
    font-size: 12px;
    color: #606266;
}
.table-input-item-wrap:first-of-type {
    padding-top: 0;
}
.table-input-item-wrap span {
    flex-shrink: 0;
}
.el-tag--default.is-round {
    border-radius: 9999px;
    height: 20px;
    padding: 0 6px;
    margin: 0 4px;
    cursor: pointer;
}
.pagination-wrap { 
    display: flex;
    margin-top: 12px;
    align-items: center;
    color: #606266;
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
.order-table.el-table.has-footer .el-table__inner-wrapper::before {
    bottom: 0;
}
.table-input-item-wrap .el-input-number.is-without-controls .el-input__inner {
    padding: 0 6px;
}
.pagination-wrap .el-pagination__total {
    margin-right: 4px;
}
</style>
