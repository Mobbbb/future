<template>
    <div class="analyse-wrap">
        <div class="search-input-wrap">
            <div class="search-item-wrap">
                <span style="margin-right: 8px;">日期</span>
                <el-date-picker
                    v-model="basicDate"
                    type="daterange"
                    unlink-panels
                    range-separator="To"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :clearable="false"
                    :editable="false"
                    :shortcuts="shortcuts"
                    @change="changeBasicDate"
                    class="analyse-date-picker"
                    popper-class="date-picker-popper"
                    style="width: 260px;" />
            </div>
        </div>
        <div class="analyse-content-wrap">
            <div :style="analyseResult.totalProfit >= 0 ?
                { background: 'linear-gradient(#fff, rgba(243, 63, 109, 0.1) 120px, #fff 120px, #fff 100%)' } :
                { background: 'linear-gradient(#fff, rgba(17, 166, 66, 0.1) 120px, #fff 120px, #fff 100%)' }">
                <div class="total-analyse-wrap">
                    <div class="total-analyse-title">盈亏</div>
                    <div class="total-analyse-value" 
                        :style="analyseResult.totalProfit >= 0 ?
                        { color: 'rgb(235, 68, 54)' } :
                        { color: 'rgb(14, 157, 88)' }">
                        {{analyseResult.totalProfit.toLocaleString()}}
                    </div>
                </div>
                <el-card class="analyse-card" style="margin: 12px;">
                    <div class="card-title">交易统计<span class="card-title-date">({{displayTime}})</span></div>
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
            </div>
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="card-title">品种盈亏及胜率<span class="card-title-date">({{displayTime}})</span></div>
                <div id="barChart" :style="{ width: `${barChartMaxWidth}px` }"></div>
            </el-card>
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="card-title">多单统计<span class="card-title-date">({{displayTime}})</span></div>
                <div class="card-column-wrap">
                    <div class="card-item-wrap">
                        <div class="card-item-title">总盈利</div>
                        <div class="card-item-combine-value">
                            <div class="card-item-value" style="color: rgb(235, 68, 54);">
                                {{analyseResult.buyProfitUp[0]}}
                                <span class="card-item-unit">{{analyseResult.buyProfitUp[1]}}元</span>
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
                                {{analyseResult.buyProfitDown[0]}}
                                <span class="card-item-unit">{{analyseResult.buyProfitDown[1]}}元</span>
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
                                :style="analyseResult.buyProfit[0] >= 0 ?
                                { color: 'rgb(235, 68, 54)' } :
                                { color: 'rgb(14, 157, 88)' }">
                                {{analyseResult.buyProfit[0]}}
                                <span class="card-item-unit">{{analyseResult.buyProfit[1]}}元</span>
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
                <div class="card-title">空单统计<span class="card-title-date">({{displayTime}})</span></div>
                <div class="card-column-wrap">
                    <div class="card-item-wrap">
                        <div class="card-item-title">总盈利</div>
                        <div class="card-item-combine-value">
                            <div class="card-item-value" style="color: rgb(235, 68, 54);">
                                {{analyseResult.saleProfitUp[0]}}
                                <span class="card-item-unit">{{analyseResult.saleProfitUp[1]}}元</span>
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
                                {{analyseResult.saleProfitDown[0]}}
                                <span class="card-item-unit">{{analyseResult.saleProfitDown[1]}}元</span>
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
                                :style="analyseResult.saleProfit[0] >= 0 ?
                                { color: 'rgb(235, 68, 54)' } :
                                { color: 'rgb(14, 157, 88)' }">
                                {{analyseResult.saleProfit[0]}}
                                <span class="card-item-unit">{{analyseResult.saleProfit[1]}}元</span>
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
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="analyse-calendar-header">
                    <div class="date-picker-wrap" v-if="dayCalendarShowStatus">
                        <el-button  type="text" 
                                    :icon="DArrowLeft" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="changeCalendarDate(-1)">
                        </el-button>
                        <el-date-picker v-model="calendarDate" 
                                        type="month"
                                        value-format="YYYY-MM-DD"
                                        placeholder="日期选择"
                                        style="width: 120px;" 
                                        :clearable="false" 
                                        :editable="false"
                                        class="analyse-date-picker"
                                        popper-class="date-picker-popper month-picker-popper"
                                        @change="changeCalendarDate('')">
                        </el-date-picker>
                        <el-button  type="text" 
                                    :icon="DArrowRight" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="changeCalendarDate(1)">
                        </el-button>
                    </div>
                    <div class="date-picker-wrap" v-else>
                        <el-button  type="text" 
                                    :icon="DArrowLeft" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="changeCalendarYear(-1)">
                        </el-button>
                        <el-date-picker v-model="calendarYear" 
                                        type="year"
                                        value-format="YYYY-MM-DD"
                                        placeholder="日期选择"
                                        style="width: 120px;" 
                                        :clearable="false" 
                                        :editable="false"
                                        @change="changeCalendarYear">
                        </el-date-picker>
                        <el-button  type="text" 
                                    :icon="DArrowRight" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="changeCalendarYear(1)">
                        </el-button>
                    </div>
                    <el-switch
                        @change="changeCalendarDim"
                        v-model="dayCalendarShowStatus"
                        inline-prompt
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: var(--el-color-primary)"
                        active-text="月"
                        inactive-text="年"/>
                </div>
                <el-calendar v-if="dayCalendarShowStatus" class="analyse-calendar" v-model="calendarInnerDate" @input="initCalendar">
                    <template #header><div></div></template>
                    <template #dateCell="{ data }">
                        <div class="date-cell" :class="getCalendarCellClass(data)">
                            <p>{{ Number(data.day.slice(8, 10)) }}</p>
                            <p>{{ formatCalendarCellData(data) }}</p>
                        </div>
                    </template>
                </el-calendar>
                <monthly-calendar class="analyse-monthly-calendar" v-else :year="calendarYear" @on-click="drillingMonthCalendar">
                    <template #dateCell="{ data }">
                        <div class="date-cell month-date-cell" :class="getCalendarCellClass(data)">
                            <p>{{ data.label }}</p>
                            <p>{{ formatCalendarCellData(data) }}</p>
                        </div>
                    </template>
                </monthly-calendar>
            </el-card>
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="line-chart-filter-wrap">
                    <el-select class="analyse-select" v-model="dayLineFutureNameBindValue" @change="changeDayLineFuture">
                        <el-option :label="item.chName" :value="item.name" v-for="item in futuresList"></el-option>
                    </el-select>
                    <el-date-picker
                        v-model="kLineDate"
                        type="month"
                        format="YYMM"
                        :clearable="false"
                        :editable="false"
                        @change="changeKLineDate"
                        class="analyse-date-picker contract-picker"
                        popper-class="date-picker-popper month-picker-popper"
                        style="width: 50px;" />
                </div>
                <div id="lineChart"></div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { parseDateParams, getGapDate, getMonthShortcuts } from '@/libs/util'
import festivalMap, { festivalList } from '@/config/festivalMap'
import { getBarOption, getLineOption } from './option'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import MonthlyCalendar from '@/components/monthly-calendar.vue'
import { dateFormat, calculateDate, toMonth } from 'umob'
import { formatPriceLineData, formatBasicData, formatCalendarData } from '@/libs/data-processing'
import { fetchOrderInfoHandle  } from '@/api'

const store = new useStore()

const K_LINE_DATE_KEY_NAME = computed(() => `K-LINE-DATE-${store.state.app.USER_INFO.userId}`)

let barChartIns = null
let lineChartIns = null
const monthShortcuts = getMonthShortcuts(4)
const shortcuts = [
    { text: '今日', value: () => getGapDate() },
    { text: '近7天', value: () => getGapDate(7) },
    { text: '近30天', value: () => getGapDate(30) },
    { text: '近365天', value: () => getGapDate(365) },
    ...monthShortcuts,
    { text: '全部', value: () => getGapDate(365 * ((new Date()).getFullYear() - 2018)) },
]
const analyseResult = reactive({
    buyRate: 0,
    saleRate: 0,
    totalRate: 0,
    totalProfit: 0,
    buyProfit: [],
    buyProfitUp: [],
    buyProfitDown: [],
    saleProfit: [],
    saleProfitUp: [],
    saleProfitDown: [],
    preBuyProfit: 0,
    preBuyProfitUp: 0,
    preBuyProfitDown: 0,
    preSaleProfit: 0,
    preSaleProfitUp: 0,
    preSaleProfitDown: 0,
})
const calendarDate = ref(dateFormat(new Date()))
const calendarYear = ref(dateFormat(new Date()))
const basicDate = ref(monthShortcuts[0].value)
const kLineDate = localStorage.getItem(K_LINE_DATE_KEY_NAME.value) 
    ? ref(localStorage.getItem(K_LINE_DATE_KEY_NAME.value))
    : ref(calculateDate(dateFormat(new Date(), 'yyyy-MM'), 1))

const calendarLoadingStatus = ref(false)
const dayCalendarShowStatus = ref(true)
const barChartMaxWidth = ref(0)
const dayLineFutureName = ref('')
const closeFutureLists = ref([])
const calendarDataMap = ref({})

const activeOrderTab = computed(() => store.state.app.activeOrderTab)
const enFutureNameMap = computed(() => store.getters['order/enFutureNameMap'])
const enFutureMap = computed(() => store.getters['order/enFutureMap'])
const isLogin = computed(() => store.getters['app/isLogin'])
const futuresList = computed(() => store.getters['order/futuresList'])
const displayTime = computed(() => dateFormat(basicDate.value[0]) + ' To ' + dateFormat(basicDate.value[1]))
const calendarInnerDate = computed({
    get() {
        return new Date(calendarDate.value)
    },
    set(value) {
        calendarDate.value = dateFormat(value)
    },
})
const dayLineFutureNameBindValue = computed({
    get() {
        const firstFuturesItem = futuresList.value[0] || {}
        if (!dayLineFutureName.value) {
            dayLineFutureName.value = firstFuturesItem.name || ''
        }
        return dayLineFutureName.value
    },
    set(value) {
        dayLineFutureName.value = value
    },
})

const getCloseFutureByDate = async (dateParams) => { // 所有平仓订单
    const response = await fetchOrderInfoHandle({
        ...dateParams,
        openOrClose: 0,
    })
    return response.result
}

const getFutureByName = async () => { // 指定品种的全部订单
    if (!isLogin.value) return []
    const formatDayLineDate = toMonth(kLineDate.value)
    const res = await fetchOrderInfoHandle({
        name: `${dayLineFutureName.value}${formatDayLineDate.slice(2, 4)}${formatDayLineDate.slice(5, 7)}`,
        orderBy: 'ASC',
    })
    return res.result || []
}

const initCalendar = async (date) => {
    if (!isLogin.value) return
    let dateRange = []
    if (dayCalendarShowStatus.value) {
        const dateParam = date && dateFormat(date) || calendarDate.value
        const day = new Date(dateParam.slice(0, 4), dateParam.slice(6, 7), 0).getDate()
        dateRange = [dateParam.slice(0, 8) + '01', `${dateParam.slice(0, 8)}${day}`]
    } else {
        const year = date || new Date(calendarYear.value).getFullYear()
        dateRange = [`${year}-01-01`, `${year}-12-31`]
    }

    const yearMothKey = `${dateRange[1].slice(0, 7)}-status`
    const yearKey = `${dateRange[1].slice(0, 4)}-status`
    if (calendarDataMap.value[yearMothKey] && dayCalendarShowStatus.value) return // 如果该月份数据已获取，不再重新请求
    if (calendarDataMap.value[yearKey] && !dayCalendarShowStatus.value) return // 如果该年份数据已获取，不再重新请求

    calendarLoadingStatus.value = true
    const params = parseDateParams(dateRange)
    const result = await getCloseFutureByDate(params)
    calendarLoadingStatus.value = false

    formatCalendarData(result, {
        calendarDataMap: calendarDataMap.value,
        dayCalendarShowStatus: dayCalendarShowStatus.value,
        yearMothKey,
        yearKey,
    })
}

const initDayLineChart = async () => {
    const designatedFutureLists = await getFutureByName()

    nextTick(() => {
        const params = formatPriceLineData(designatedFutureLists)
        const option = getLineOption(params, enFutureMap.value[dayLineFutureName.value])

        destroyLineChart()
        lineChartIns = echarts.init(document.getElementById('lineChart'))
        lineChartIns.setOption(option)
    })
}

const initBasicInfo = async () => {
    if (!isLogin.value) return
    const requestParams = parseDateParams(basicDate.value)
    closeFutureLists.value = await getCloseFutureByDate(requestParams)

    const params = formatBasicData(enFutureNameMap.value, closeFutureLists.value)

    barChartMaxWidth.value = Object.keys(params.chFutureMap).length * 60 < 500 ?  500 : Object.keys(params.chFutureMap).length * 60
    
    nextTick(() => {
        destroyBarChart()
        barChartIns = echarts.init(document.getElementById('barChart'))
        barChartIns.setOption(getBarOption(params.chFutureMap))
        barChartIns.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: 0,
        })
    })
    analyseResult.buyRate = params.buyRate
    analyseResult.saleRate = params.saleRate
    analyseResult.totalRate = params.totalRate
    analyseResult.preBuyProfit = params.preBuyProfit
    analyseResult.preBuyProfitUp = params.preBuyProfitUp
    analyseResult.preBuyProfitDown = params.preBuyProfitDown
    analyseResult.preSaleProfit = params.preSaleProfit
    analyseResult.preSaleProfitUp = params.preSaleProfitUp
    analyseResult.preSaleProfitDown = params.preSaleProfitDown

    analyseResult.saleProfit = params.saleProfit
    analyseResult.saleProfitUp = params.saleProfitUp
    analyseResult.saleProfitDown = params.saleProfitDown
    analyseResult.buyProfit = params.buyProfit
    analyseResult.buyProfitUp = params.buyProfitUp
    analyseResult.buyProfitDown = params.buyProfitDown
    analyseResult.totalProfit = params.totalProfit
}

const destroyBarChart = () => {
    if (barChartIns) {
        barChartIns.clear()
        barChartIns.dispose()
        barChartIns = null
        document.getElementById('barChart').removeAttribute('_echarts_instance_')
    }
}

const destroyLineChart = () => {
    if (lineChartIns) {
        lineChartIns.clear()
        lineChartIns.dispose()
        lineChartIns = null
        document.getElementById('lineChart').removeAttribute('_echarts_instance_')
    }
}

const changeBasicDate = () => {
    initBasicInfo()
}

const changeKLineDate = () => {
    localStorage.setItem(K_LINE_DATE_KEY_NAME.value, toMonth(kLineDate.value))
    initDayLineChart()
}

const changeDayLineFuture = () => {
    initDayLineChart()
}

const changeCalendarDate = (num) => {
    if (num) {
        calendarDate.value = calculateDate(dateFormat(calendarDate.value, 'yyyy-MM'), num) + '-01'
    }
    
    initCalendar()
}

const changeCalendarYear = (value) => {
    if (typeof value === 'number') {
        const year = new Date(calendarYear.value).getFullYear()
        calendarYear.value = `${year + value}-01-01`
    }
    initCalendar()
}

const getCalendarCellClass = (data) => {
    let itemData = calendarDataMap.value[data.day.slice(0, 7)]
    if (dayCalendarShowStatus.value) {
        itemData = calendarDataMap.value[data.day]
        const cellDay = (new Date(data.day)).getDay()
        if (cellDay === 0 || cellDay === 6) { // 周末
            return 'weekend-day-cell'
        }
        if (festivalList.includes(data.day) || festivalMap[data.day] || festivalMap[data.day.slice(5, 10)]) { // 节假日
            return 'festival-day-cell'
        }
        if (data.day.slice(0, 7) !== calendarDate.value.slice(0, 7)) { // 其他月份
            return ''
        }
    }

    if (calendarLoadingStatus.value) return ''

    let className = ''
    if (itemData) {
        if (itemData > 0) {
            className = 'red-calendar-cell'
        } else {
            className = 'green-calendar-cell'
        }
    } else if (dayCalendarShowStatus.value) {
        className = 'normal-calendar-cell'
    } else {
        className = 'no-data-month-cell'
    }
    return className
}

const formatCalendarCellData = (data) => {
    if (calendarLoadingStatus.value) return ''

    let itemData = calendarDataMap.value[data.day.slice(0, 7)]
    if (dayCalendarShowStatus.value) {
        itemData = calendarDataMap.value[data.day]
        const cellDay = (new Date(data.day)).getDay()
        if (festivalList.includes(data.day) || festivalMap[data.day] || festivalMap[data.day.slice(5, 10)]) {
            return festivalMap[data.day] || festivalMap[data.day.slice(5, 10)] || '休'
        }
        // 周末、其他月份
        if (data.day.slice(0, 7) !== calendarDate.value.slice(0, 7) || cellDay === 0 || cellDay === 6) {
            return ''
        }
    }

    if (typeof itemData !== 'undefined') {
        return Math.round(itemData)
    } else {
        return '--'
    }
}

const changeCalendarDim = () => {
    if (!dayCalendarShowStatus.value) { // 切换为年，立即请求数据
        initCalendar()
    }
}

const drillingMonthCalendar = (value) => {
    dayCalendarShowStatus.value = true
    calendarDate.value = value.day + '-01'
    initCalendar()
}

const initAnalyseData = () => {
    initBasicInfo()
    initCalendar()
    initDayLineChart()
}

const getDataWhileActive = () => {
    if (activeOrderTab.value === 'analyse' && isLogin.value) {
        initAnalyseData()
    }
}

watch(isLogin, (value) => {
    if (value) {
        getDataWhileActive()
    } else {
        closeFutureLists.value = [] // 清空数据
        calendarDataMap.value = {} // 清空数据
        initAnalyseData()
    }
})

watch(activeOrderTab, () => {
    getDataWhileActive()
})

onMounted(() => {
    getDataWhileActive()
})

onBeforeUnmount(() => {
    destroyBarChart()
    destroyLineChart()
})
</script>

<style scoped>
.analyse-wrap {
    height: 100%;
}
.search-input-wrap {
    color: #606266;
    padding: 0 0 0 12px;
    font-size: 12px;
    border-bottom: 2px solid #e4e7ed;
    box-sizing: border-box;
    height: 42px;
}
.search-item-wrap {
    display: flex;
    align-items: center;
}
.analyse-content-wrap {
    height: calc(100% - 42px);
    overflow: auto;
}
.analyse-calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 500px;
}
.search-item-wrap span {
    flex-shrink: 0;
}
.total-analyse-wrap {
    text-align: center;
    padding: 16px 0 4px 0;
}
.total-analyse-title {
    font-size: 13px;
    margin-bottom: 8px;
}
.total-analyse-value {
    font-size: 24px;
    font-weight: bold;
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
.card-column-wrap:last-child .card-item-wrap {
    margin-right: 0;
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
.month-date-cell p:first-of-type {
    font-weight: normal;
}
.weekend-day-cell {
    color: #a8ade3;
}
.festival-day-cell p:first-of-type {
    font-weight: bold;
}
.festival-day-cell p:last-of-type {
    color: #a8ade3;
}
.normal-calendar-cell p:first-of-type {
    font-weight: bold;
}
.no-data-month-cell {
    color: #c0c4cc;
}
.card-title-date {
    font-weight: normal;
    font-size: 12px;
    margin-left: 4px;
}
.analyse-calendar {
    max-width: 500px;
}
.analyse-monthly-calendar {
    max-width: 512px;
}
#barChart {
    height: 37.5vh;
    max-width: 100%;
    background: white;
}
#lineChart {
    height: 460px;
    width: 100%;
    max-width: 100%;
    background: white;
}
.line-chart-filter-wrap {
    display: flex;
}
.analyse-select {
    width: 120px;
    margin-right: 12px;
}
</style>

<style>
.analyse-card .el-card__body {
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
    padding-bottom: 0;
}
.analyse-calendar .el-calendar-table .el-calendar-day {
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
.analyse-bar-tooltip {
    box-shadow: none!important;
    border: 1px solid #333;
    z-index: 100!important;
}
.analyse-date-picker.el-input__inner {
    height: 28px;
}
.analyse-date-picker.el-input__suffix {
    height: 28px;
}
.analyse-date-picker .el-input__inner {
    height: 28px;
}
.analyse-select.el-select .el-input__inner {
    height: 28px;
}
.contract-picker .el-input__inner {
    height: 28px;
    padding: 0 0 0 10px!important;
}
.contract-picker .el-input__prefix {
    display: none;
}
</style>
