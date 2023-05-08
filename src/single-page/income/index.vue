<template>
    <div class="income-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="chart-tab" v-if="isLogin">
            <el-tab-pane label="日收益" name="day">
                <div id="incomeChart1" v-if="isShowChart"></div>
                <div class="no-data-class" v-if="!isShowChart">
                    <div><blockquote>暂无数据</blockquote></div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="累计收益" name="add">
                <div id="incomeChart2" v-if="isShowChart"></div>
                <div class="no-data-class" v-if="!isShowChart">
                    <div><blockquote>暂无数据</blockquote></div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="收益列表" name="table">
                <div class="table-wrap">
                    <el-table class="income-table" :data="showListData" height="100%" :show-summary="isAdministrator"
                        :summary-method="getSummaries" :row-class-name="tableRowClassName" style="font-size: 12px;">
                        <el-table-column prop="id" label="编号" width="60" align="center" fixed="left" />
                        <el-table-column prop="date" label="日期" />
                        <el-table-column prop="dNum" label="大号收益" v-if="isAdministrator" />
                        <el-table-column prop="xNum" label="小号收益" v-if="isAdministrator" />
                        <el-table-column prop="num" label="收益" />
                        <el-table-column prop="name" label="角色" />
                        <el-table-column prop="remark" min-width="140" label="备注" show-overflow-tooltip />
                        <el-table-column label="操作" width="60" align="center">
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
                </div>
                <el-pagination small background layout="prev, jumper, next, total" 
                    v-model:currentPage="currentPage"
                    :page-size="pageSize"
                    :total="tableData.length"
                    class="gc-pagination" />
            </el-tab-pane>
        </el-tabs>
        <div class="no-data-class login-wrap" v-else>
            <div>
                <blockquote>您当前还未登录</blockquote>
                <div class="no-data-btn" @click="showLoginHandle">前往登录</div>
            </div>
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
    </div>
</template>

<script>
import { ref, nextTick, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { getOption } from './option'
import { useWatchUserSwitch } from '@/composables/watch'
import { fetchIncomeInfo, fetchDeleteIncome } from '@/api'
import { getDateBetween, dateFormat, extractStringBetween } from '@/libs/util'
import { festivalList } from '@/config/festivalMap'

export default {
    name: 'income',
    setup() {
        const store = new useStore()
        const tableData = ref([])
        const chartDataArr = ref([])
        const chartDataTotalArr = ref([])
        const currentPage = ref(1)
        const centerDialogVisible = ref(false)

        const pageSize = 40
        let myChart1 = null
        let myChart2 = null
        let subTotalNum = 0
        let dtotalNum = 0
        let totalNum = 0

        const setActiveIncomeTab = (value) => store.commit('app/setActiveIncomeTab', value)
        const isLogin = computed(() => store.getters['app/isLogin'])
        const isAdministrator = computed(() => store.getters['app/isAdministrator'])
        const activeName = computed({
            get() {
                return store.state.app.activeIncomeTab
            },
            set(value) {
                setActiveIncomeTab(value)
            },
        })

        const showListData = computed(() => {
            const startNum = (currentPage.value - 1) * pageSize
            return tableData.value.slice(startNum, startNum + pageSize)
        })

        onBeforeUnmount(() => {
            if (myChart1) {
                myChart1.clear()
                myChart1.dispose()
                myChart1 = null
            }
            if (myChart2) {
                myChart2.clear()
                myChart2.dispose()
                myChart2 = null
            }
        })

        const isShowChart = computed(() => chartDataArr.value.length)

        const getDayIncome = () => {
            if (!isShowChart.value) return
            nextTick(() => {
                document.getElementById('incomeChart1').removeAttribute('_echarts_instance_')
                myChart1 = echarts.init(document.getElementById('incomeChart1'))
                myChart1.setOption(getOption(chartDataArr.value, 2))
            })
        }

        const getTotalIncome = () => {
            if (!isShowChart.value) return
            nextTick(() => {
                document.getElementById('incomeChart2').removeAttribute('_echarts_instance_')
                myChart2 = echarts.init(document.getElementById('incomeChart2'))
                myChart2.setOption(getOption(chartDataTotalArr.value, 1))
            })
        }

        const handleClick = async () => {
            if (activeName.value === 'add') {
                getTotalIncome()
            } else if (activeName.value === 'table') {
                getTableData()
            } else {
                getDayIncome()
            }
        }

        const getTableData = async () => {
            const res = await fetchIncomeInfo()
            const data = res.data || []
            data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            subTotalNum = 0
            dtotalNum = 0
            totalNum = 0
            const dateObj = {}
            data.forEach(item => {
                const length = item.name.split(',').length
                let subItemNum = 0
                let itemNum = (item.num * length)
                if (item.remark) {
                    subItemNum = Number(extractStringBetween(item.remark, '{', '}')) * 2
                    subTotalNum += subItemNum
                    item.remark = item.remark.replaceAll('{', '')
                    item.remark = item.remark.replaceAll('}', '')
                }
                if (typeof dateObj[item.date] === 'undefined') {
                    dateObj[item.date] = 0
                }
                
                totalNum += itemNum
                dateObj[item.date] += (itemNum - subItemNum)
                dtotalNum += (itemNum - subItemNum)
                if (item.name !== '其他') item.xNum = subItemNum
            })
            data.forEach(item => {
                if (item.name === '其他') return
                if (typeof dateObj[item.date] !== 'undefined') {
                    item.dNum = Number(dateObj[item.date].toFixed(2))
                    delete dateObj[item.date]
                } else {
                    item.dNum = '--'
                }
            })

            let nameArr = [] // 维度
            // 横坐标全部日期
            let dateArr = []
            if (data[data.length - 1]) {
                dateArr = getDateBetween(data[data.length - 1].date, dateFormat(new Date()))
            }
            // 过滤节假日
            dateArr = dateArr.filter(item => !festivalList.includes(item))
            data.forEach(item => {
                if (!Array.isArray(item.name)) {
                    item.name = item.name.split(',')
                }
                nameArr = nameArr.concat(item.name)
                nameArr = [...new Set(nameArr)]
            })
            chartDataArr.value = []
            chartDataTotalArr.value = []
            nameArr.forEach(nameItem => {
                chartDataArr.value.push({
                    name: nameItem,
                    data: [],
                })
                chartDataTotalArr.value.push({
                    name: nameItem,
                    data: [],
                })
            })
            chartDataArr.value.forEach(item => { // 装填数据
                data.forEach(cell => {
                    if (cell.name.includes(item.name)) {
                        item.data.push(cell)
                    }
                })
            })
            
            dateArr.forEach(dateItem => { // 补全横坐标
                // 过滤周末
                const dateTime = new Date(dateItem)
                if (dateTime.getDay() === 0 || dateTime.getDay() === 6) return

                chartDataArr.value.forEach(item => {
                    const lineItemDateArr = item.data.map(cell => cell.date)
                    if (!lineItemDateArr.includes(dateItem)) {
                        item.data.push({
                            date: dateItem,
                            num: 0,
                        })
                    }
                })
            })
            chartDataArr.value.forEach(item => {
                item.data.sort((a, b) => Date.parse(new Date(a.date)) - Date.parse(new Date(b.date)))
            })
            chartDataArr.value.forEach((item, index) => {
                item.data.forEach((cell, cellIndex) => {
                    if (cellIndex) {
                        chartDataTotalArr.value[index].data.push({
                            // 当前项 + 上一项
                            num: cell.num + chartDataTotalArr.value[index].data[cellIndex - 1].num,
                            date: cell.date,
                        })
                    } else {
                        chartDataTotalArr.value[index].data.push(cell)
                    }
                })
            })
            tableData.value = data
        }

        let currentDeleteItem = null
        const deleteRow = async (data) => {
            currentDeleteItem = data
            centerDialogVisible.value = true
        }

        const confirmDelete = async () => {
            if (currentDeleteItem) {
                await fetchDeleteIncome(currentDeleteItem.row.id)
                getTableData()
            }
            centerDialogVisible.value = false
        }

        const setLoginDrawerStatus = (status) => store.commit('app/setLoginDrawerStatus', status)
        const showLoginHandle = () => {
            setLoginDrawerStatus(true)
        }

        const initData = async () => {
            if (isLogin.value) {
                await getTableData()
                if (activeName.value === 'add') {
                    getTotalIncome()
                } else if (activeName.value === 'day') {
                    getDayIncome()
                }
            }
        }

        const tableRowClassName = ({ row }) => {
            if (row.name && row.name[0] === '其他') {
                return 'others-row'
            }
        }

        const getSummaries = (param) => {
            const { columns } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '总计'
                } else if (column.property === 'dNum') {
                    sums[index] = dtotalNum.toFixed(2)
                } else if (column.property === 'xNum') {
                    sums[index] = subTotalNum.toFixed(2)
                } else if (column.property === 'num') {
                    sums[index] = totalNum.toFixed(2)
                } else {
                    sums[index] = '--'
                }
            })
            return sums
        }

        watch(isLogin, async (value) => {
            if (value) {
                initData()
            } else {
                tableData.value = []
                chartDataArr.value = []
                chartDataTotalArr.value = []
            }
        })
        useWatchUserSwitch(initData)

        onMounted(() => {
            initData()
        })

        return {
            centerDialogVisible,
            isLogin,
            isAdministrator,
            tableData,
            showListData,
            activeName,
            pageSize,
            currentPage,
            isShowChart,
            tableRowClassName,
            deleteRow,
            handleClick,
            showLoginHandle,
            confirmDelete,
            getSummaries,
        }
    },
}
</script>

<style scoped>
.income-wrap {
    background: #f5f5f5;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}
#incomeChart1, #incomeChart2 {
    width: 100%;
    height: 100%;
    background: white;
    padding: 0 4px 0 16px;
    box-sizing: border-box;
}
.table-wrap {
    height: calc(100% - 48px);
    margin-bottom: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
.no-data-class {
    height: calc(100% - 36px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 25vh;
    box-sizing: border-box;
}
.no-data-class blockquote {
    font-size: 16px;
    color: #999;
    border-left: 4px solid #dfe2e5;
    margin: 12px 0;
    padding: 8px 0 8px 12px;
}
.no-data-class .no-data-btn {
    color: #3eaf7c;
    font-weight: 500;
    font-size: 16px;
    transition: color .2s ease;
}
.no-data-class .no-data-btn:hover {
    cursor: pointer;
    color: #79cea8;
}
.login-wrap {
    padding-bottom: 30vh;
}
</style>

<style>
.chart-tab {
    height: 100%;
}
.chart-tab .el-tabs__item {
    padding: 0 16px;
}
.chart-tab .el-tabs__content {
    height: calc(100% - 42px)!important;
}
.chart-tab .el-tabs__header {
    margin-bottom: 1px;
    background: white;
}
.chart-tab .el-tabs__nav-scroll {
    padding-left: 12px;
}
.chart-tab .el-tab-pane {
    height: 100%!important;
}
.el-table .cell {
    padding: 0 6px!important;
}
.el-table-fixed-column--right .cell {
    padding-left: 0!important;
    padding-right: 0!important;
}
.income-table .el-table__footer .el-table__cell:nth-of-type(3) {
    color: rgb(235, 68, 54);
    font-weight: bold;
}
.income-table .el-table__footer .el-table__cell:nth-of-type(4) {
    color: rgb(235, 68, 54);
    font-weight: bold;
}
.income-table .el-table__footer .el-table__cell:nth-of-type(5) {
    color: rgb(235, 68, 54);
    font-weight: bold;
}
.income-table .others-row .el-table__cell {
    background: var(--el-color-info-light-9);
}
</style>
