<template>
    <div class="analyse-wrap">
        <div class="table-search-input-wrap">
            <div class="search-item-wrap">
                <span>起止日期：</span>
                <el-date-picker
                    v-model="analyseDate"
                    type="daterange"
                    unlink-panels
                    range-separator="To"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :clearable="false"
                    :shortcuts="shortcuts"
                    @change="changeAnalyseDateHandle"
                    class="date-picker"
                    popper-class="date-picker-popper"
                    style="width: 260px;" />
            </div>
        </div>
        <el-card class="analyse-card" style="margin: 0 12px;">
            <div class="card-title">总览</div>
            <div class="card-row-wrap">
                <div class="card-item-wrap">
                    <div class="card-item-title">多单胜率</div>
                    <div class="card-item-value">{{analyseResult.buyRate}}%</div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">空单胜率</div>
                    <div class="card-item-value">{{analyseResult.saleRate}}%</div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">总胜率</div>
                    <div class="card-item-value">{{analyseResult.totalRate}}%</div>
                </div>
            </div>
        </el-card>
        <el-card class="analyse-card" style="margin: 12px;">
            <el-calendar class="analyse-calendar" ref="calendarRef">
                <template #header>
                    <div class="date-picker-wrap">
                        <el-button  type="text" 
                                    :icon="DArrowLeft" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="selectDate('prev')">
                        </el-button>
                        <el-date-picker v-model="calendarDate" 
                                        type="month"
                                        placeholder="日期选择"
                                        style="width: 120px;" 
                                        :clearable="false" 
                                        @change="selectDate('')">
                        </el-date-picker>
                        <el-button  type="text" 
                                    :icon="DArrowRight" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="selectDate('next')">
                        </el-button>
                    </div>
                </template>
                <template #dateCell="{ data }">
                    <div class="date-cell" :class="getDateCellClass(data)">
                        <p>{{ Number(data.day.slice(8, 10)) }}</p>
                        <p>{{ fromatDateCellData(data) }}</p>
                    </div>
                </template>
            </el-calendar>
        </el-card>
        <el-card class="analyse-card" style="margin: 12px;">
            <div class="card-title">多单统计</div>
            <div class="card-column-wrap">
                <div class="card-item-wrap">
                    <div class="card-item-title">总盈利</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(235, 68, 54);">
                            {{analyseResult.buyProfitUp.num}}
                            <span class="card-item-unit">{{analyseResult.buyProfitUp.unit}}元</span>
                        </div>
                    </div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">每手盈利</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(235, 68, 54);">
                            {{analyseResult.preBuyProfitUp}}
                            <span class="card-item-unit">元/手</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-column-wrap">
                <div class="card-item-wrap">
                    <div class="card-item-title">总亏损</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(14, 157, 88);">
                            {{analyseResult.buyProfitDown.num}}
                            <span class="card-item-unit">{{analyseResult.buyProfitDown.unit}}元</span>
                        </div>
                    </div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">每手亏损</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(14, 157, 88);">
                            {{analyseResult.preBuyProfitDown}}
                            <span class="card-item-unit">元/手</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-column-wrap">
                <div class="card-item-wrap">
                    <div class="card-item-title">净盈亏</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" 
                            :style="analyseResult.buyProfit.num >= 0 ?
                            { color: 'rgb(235, 68, 54)' } :
                            { color: 'rgb(14, 157, 88)' }">
                            {{analyseResult.buyProfit.num}}
                            <span class="card-item-unit">{{analyseResult.buyProfit.unit}}元</span>
                        </div>
                    </div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">每手净盈亏</div>
                    <div class="card-item-value"
                        :style="analyseResult.preBuyProfit >= 0 ?
                        { color: 'rgb(235, 68, 54)' } :
                        { color: 'rgb(14, 157, 88)' }">
                        {{analyseResult.preBuyProfit}}
                        <span class="card-item-unit">元/手</span>
                    </div>
                </div>
            </div>
        </el-card>
        <el-card class="analyse-card" style="margin: 12px;">
            <div class="card-title">空单统计</div>
            <div class="card-column-wrap">
                <div class="card-item-wrap">
                    <div class="card-item-title">总盈利</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(235, 68, 54);">
                            {{analyseResult.saleProfitUp.num}}
                            <span class="card-item-unit">{{analyseResult.saleProfitUp.unit}}元</span>
                        </div>
                    </div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">每手盈利</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(235, 68, 54);">
                            {{analyseResult.preSaleProfitUp}}
                            <span class="card-item-unit">元/手</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-column-wrap">
                <div class="card-item-wrap">
                    <div class="card-item-title">总亏损</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(14, 157, 88);">
                            {{analyseResult.saleProfitDown.num}}
                            <span class="card-item-unit">{{analyseResult.saleProfitDown.unit}}元</span>
                        </div>
                    </div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">每手亏损</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" style="color: rgb(14, 157, 88);">
                            {{analyseResult.preSaleProfitDown}}
                            <span class="card-item-unit">元/手</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-column-wrap">
                <div class="card-item-wrap">
                    <div class="card-item-title">净盈亏</div>
                    <div class="card-item-combine-value">
                        <div class="card-item-value" 
                            :style="analyseResult.saleProfit.num >= 0 ?
                            { color: 'rgb(235, 68, 54)' } :
                            { color: 'rgb(14, 157, 88)' }">
                            {{analyseResult.saleProfit.num}}
                            <span class="card-item-unit">{{analyseResult.saleProfit.unit}}元</span>
                        </div>
                    </div>
                </div>
                <div class="card-item-wrap">
                    <div class="card-item-title">每手净盈亏</div>
                    <div class="card-item-value"
                        :style="analyseResult.preSaleProfit >= 0 ?
                        { color: 'rgb(235, 68, 54)' } :
                        { color: 'rgb(14, 157, 88)' }">
                        {{analyseResult.preSaleProfit}}
                        <span class="card-item-unit">元/手</span>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { formatNumUnit, parseDateParams, getGapDate, getMonthShortcuts, dateFormat } from '@/libs/util'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import { getMonth } from '@/libs/util'

export default {
    name: 'order',
    setup() {
        var dayjs = require('dayjs')
        const store = new useStore()

        const calendarRef = ref()
        const calendarDate = ref(dateFormat(new Date(), 'yyyy-MM-dd'))
        const getAnalyseData = (params) => store.dispatch('order/getAnalyseData', params)
        const getAnalyseCalendar = (date) => store.dispatch('order/getAnalyseCalendar', date)
        const setAnalyseList = (value) => store.commit('order/setAnalyseList', value)
        const setAnalyseCalendarData = (value) => store.commit('order/setAnalyseCalendarData', value)
        const analyseList = computed(() => store.state.order.analyseList)
        const activeOrderTab = computed(() => store.state.app.activeOrderTab)
        const analyseCalendarData = computed(() => store.state.order.analyseCalendarData)

        const monthShortcuts = getMonthShortcuts()

        const analyseResult = reactive({
            buyRate: 0,
            saleRate: 0,
            totalRate: 0,
            buyProfit: { num: 0, unit: '' },
            buyProfitUp: { num: 0, unit: '' },
            buyProfitDown: { num: 0, unit: '' },
            saleProfit: { num: 0, unit: '' },
            saleProfitUp: { num: 0, unit: '' },
            saleProfitDown: { num: 0, unit: '' },
            preBuyProfit: 0,
            preBuyProfitUp: 0,
            preBuyProfitDown: 0,
            preSaleProfit: 0,
            preSaleProfitUp: 0,
            preSaleProfitDown: 0,
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

        const analyseDate = ref(monthShortcuts[0].value)
        const isLogin = computed(() => store.getters['app/isLogin'])

        const getAnalyseDataHandle = async () => {
            if (!isLogin.value) return
            const params = parseDateParams(analyseDate.value)
            await getAnalyseData(params)
        }

        const getAnalyseCalendarHandle = async () => {
            if (!isLogin.value) return
            const day = new Date(calendarDate.value.slice(0, 4), calendarDate.value.slice(6, 7), 0).getDate()
            const params = parseDateParams([calendarDate.value.slice(0, 8) + '01', `${calendarDate.value.slice(0, 8)}${day}`])
            setAnalyseCalendarData({}) // 清空数据
            await getAnalyseCalendar(params)
        }

        const analyseAccount = async () => {
            await getAnalyseDataHandle()

            let buyNum = 0
            let buyWinNum = 0
            let saleNum = 0
            let saleWinNum = 0
            let saleProfit = 0
            let saleProfitUp = 0
            let saleProfitDown = 0
            let buyProfit = 0
            let buyProfitUp = 0
            let buyProfitDown = 0
            analyseList.value.forEach(item => {
                if (!item.openOrClose) { // 平单
                    if (item.buyOrSale === 1) { // 平空单
                        saleNum ++
                        if (item.totalProfit > 0) {
                            saleWinNum ++
                            saleProfitUp += item.totalProfit
                        } else {
                            saleProfitDown += item.totalProfit
                        }
                        saleProfit += item.totalProfit
                    } else { // 平多单
                        buyNum ++
                        if (item.totalProfit > 0) { // 盈利
                            buyWinNum ++
                            buyProfitUp += item.totalProfit
                        } else {
                            buyProfitDown += item.totalProfit
                        }
                        buyProfit += item.totalProfit
                    }
                }
            })

            analyseResult.buyRate = (buyWinNum / buyNum * 100).toFixed(2) * 1 || 0
            analyseResult.saleRate = (saleWinNum / saleNum * 100).toFixed(2) * 1 || 0
            analyseResult.totalRate = ((saleWinNum + buyWinNum) / (buyNum + saleNum) * 100).toFixed(2) * 1 || 0
            analyseResult.preBuyProfit = (buyProfit / buyNum).toFixed(1) * 1 || 0
            analyseResult.preBuyProfitUp = (buyProfitUp / buyWinNum).toFixed(1) * 1 || 0
            analyseResult.preBuyProfitDown = (buyProfitDown / (buyNum - buyWinNum)).toFixed(1) * 1 || 0
            analyseResult.preSaleProfit = (saleProfit / saleNum).toFixed(1) * 1 || 0
            analyseResult.preSaleProfitUp = (saleProfitUp / saleWinNum).toFixed(1) * 1 || 0
            analyseResult.preSaleProfitDown = (saleProfitDown / (saleNum - saleWinNum)).toFixed(1) * 1 || 0

            analyseResult.saleProfit = formatNumUnit(saleProfit.toFixed(2) * 1 || 0)
            analyseResult.saleProfitUp = formatNumUnit(saleProfitUp.toFixed(2) * 1 || 0)
            analyseResult.saleProfitDown = formatNumUnit(saleProfitDown.toFixed(2) * 1 || 0)
            analyseResult.buyProfit = formatNumUnit(buyProfit.toFixed(2) * 1 || 0)
            analyseResult.buyProfitUp = formatNumUnit(buyProfitUp.toFixed(2) * 1 || 0)
            analyseResult.buyProfitDown = formatNumUnit(buyProfitDown.toFixed(2) * 1 || 0)
        }

        const changeAnalyseDateHandle = () => {
            analyseAccount()
        }

        const selectDate = (type) => {
            if (type) {
                calendarDate.value = getMonth(calendarDate.value, type)
            }
            calendarRef.value.pickDay(dayjs(calendarDate.value))
            getAnalyseCalendarHandle()
        }

        const getDateCellClass = (data) => {
            let className = ''
            const cellDay = (new Date(data.day)).getDay()
            const itemData = analyseCalendarData.value[data.day.slice(0, 10)]
            if (cellDay === 0 || cellDay === 6) {
                return 'weekend-day-cell'
            }
            if (data.day.slice(0, 7) !== calendarDate.value.slice(0, 7) || cellDay === 0 || cellDay === 6) {
                return ''
            }
            if (itemData) {
                if (itemData > 0) {
                    className = 'red-calendar-cell'
                } else {
                    className = 'green-calendar-cell'
                }
            } else {
                className = 'normal-calendar-cell'
            }
            return className
        }

        const fromatDateCellData = (data) => {
            const cellDay = (new Date(data.day)).getDay()
            const itemData = analyseCalendarData.value[data.day.slice(0, 10)]
            if (data.day.slice(0, 7) !== calendarDate.value.slice(0, 7) || cellDay === 0 || cellDay === 6) {
                return ''
            }
            if (itemData) {
                return Math.ceil(itemData)
            } else {
                return '--'
            }
        }

        watch(isLogin, (value) => {
            if (value) {
                analyseAccount()
                getAnalyseCalendarHandle()
            } else {
                setAnalyseList([]) // 清空数据
                setAnalyseCalendarData({}) // 清空数据
                analyseAccount()
                getAnalyseCalendarHandle()
            }
        })

        watch(activeOrderTab, async (value) => {
            if (value === 'analyse') {
                analyseAccount()
                getAnalyseCalendarHandle()
            }
        })

        onMounted(() => {
            if (activeOrderTab.value === 'analyse') {
                analyseAccount()
                getAnalyseCalendarHandle()
            }
        })

        return {
            DArrowLeft,
            DArrowRight,
            shortcuts,
            analyseDate,
            analyseResult,
            calendarRef,
            calendarDate,
            analyseCalendarData,
            selectDate,
            changeAnalyseDateHandle,
            getDateCellClass,
            fromatDateCellData,
        }
    },
}
</script>

<style scoped>
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
.card-item-unit {
    font-size: 12px;
}
.date-picker-wrap {
    width: 100%;
    display: flex;
    align-items: center;
}
.header-icon-btn {
    font-size: 16px;
    cursor: pointer;
    transition: color .2s ease,background-color .2s ease;
    height: 16px;
}
.change-date-icon {
    color: #DCDFE6;
}
.change-date-icon:hover {
    color: #C0C4CC;
}
.change-date-icon:first-of-type {
    margin-right: 6px;
}
.change-date-icon:last-of-type {
    margin-left: 6px;
}
.date-cell {
    height: 100%;
    font-size: 12px;
}
.date-cell p:first-of-type {
    padding: 8px;
    font-size: 16px;
}
.red-calendar-cell p:first-of-type, .green-calendar-cell p:first-of-type {
    color: #222;
}
.red-calendar-cell {
    background: #fae6e7;
    color: rgb(235, 68, 54);
    font-weight: bold;
}
.green-calendar-cell {
    background: #e8f3eb;
    color: rgb(14, 157, 88);
    font-weight: bold;
}
.weekend-day-cell {
    color: #a8ade3;
}
.normal-calendar-cell {
    font-weight: bold;
}
.analyse-calendar {
    max-width: 500px;
}
</style>

<style>
.analyse-card .el-card__body {
    padding-right: 0;
    padding-bottom: 8px;
    overflow: hidden;
}
.analyse-calendar .el-calendar__header {
    padding-left: 0;
    padding-top: 0;
}
.analyse-calendar .el-calendar__body {
    padding-left: 0;
    padding-right: 0;
}
.analyse-calendar .el-calendar-day {
    padding: 0;
    text-align: center;
    height: 60px;
}
.analyse-calendar .el-calendar-table .el-calendar-day:hover {
    background-color: white;
}
.analyse-calendar .el-calendar-table td, .analyse-calendar .el-calendar-table tr td:first-child,
.analyse-calendar .el-calendar-table tr:first-child td {
    border: none;
}
.analyse-calendar .el-calendar-table td.is-selected {
    background-color: white;
}
</style>
