<template>
    <div class="analyse-wrap">
        <div class="search-input-wrap">
            <div class="search-item-wrap">
                <span style="margin-right: 8px;">日期</span>
                <el-date-picker
                    v-model="analyseDate"
                    type="daterange"
                    unlink-panels
                    range-separator="To"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :clearable="false"
                    :editable="false"
                    :shortcuts="shortcuts"
                    @change="changeAnalyseDateHandle"
                    class="date-picker"
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
                        {{addCommas(analyseResult.totalProfit)}}
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
                <div class="card-row-wrap">
                    <div id="barChart" :style="{ maxWidth: `${barChartMaxWidth}px` }"></div>
                </div>
            </el-card>
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="card-title">多单统计<span class="card-title-date">({{displayTime}})</span></div>
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
                <div class="card-title">空单统计<span class="card-title-date">({{displayTime}})</span></div>
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
            <el-card class="analyse-card" style="margin: 12px;">
                <div class="analyse-calendar-header">
                    <div class="date-picker-wrap" v-if="showMonthCalendar">
                        <el-button  type="text" 
                                    :icon="DArrowLeft" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="selectDate('prev')">
                        </el-button>
                        <el-date-picker v-model="calendarDate" 
                                        type="month"
                                        value-format="YYYY-MM-DD"
                                        placeholder="日期选择"
                                        style="width: 120px;" 
                                        :clearable="false" 
                                        :editable="false"
                                        @change="selectDate('')">
                        </el-date-picker>
                        <el-button  type="text" 
                                    :icon="DArrowRight" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="selectDate('next')">
                        </el-button>
                    </div>
                    <div class="date-picker-wrap" v-else>
                        <el-button  type="text" 
                                    :icon="DArrowLeft" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="selectYear(-1)">
                        </el-button>
                        <el-date-picker v-model="calendarYear" 
                                        type="year"
                                        value-format="YYYY-MM-DD"
                                        placeholder="日期选择"
                                        style="width: 120px;" 
                                        :clearable="false" 
                                        :editable="false"
                                        @change="selectYear">
                        </el-date-picker>
                        <el-button  type="text" 
                                    :icon="DArrowRight" 
                                    class="header-icon-btn change-date-icon" 
                                    @click="selectYear(1)">
                        </el-button>
                    </div>
                    <el-switch
                        @change="changeSwitch"
                        v-model="showMonthCalendar"
                        inline-prompt
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: var(--el-color-primary)"
                        active-text="月"
                        inactive-text="年"/>
                </div>
                <el-calendar v-if="showMonthCalendar" class="analyse-calendar" v-model="calendarInnerDate" @input="getAnalyseCalendarHandle">
                    <template #header><div></div></template>
                    <template #dateCell="{ data }">
                        <div class="date-cell" :class="getDateCellClass(data)">
                            <p>{{ Number(data.day.slice(8, 10)) }}</p>
                            <p>{{ fromatDateCellData(data) }}</p>
                        </div>
                    </template>
                </el-calendar>
                <monthly-calendar class="analyse-monthly-calendar" v-else :year="calendarYear" @on-click="clickMonCalHandle">
                    <template #dateCell="{ data }">
                        <div class="date-cell month-date-cell" :class="getDateCellClass(data)">
                            <p>{{ data.label }}</p>
                            <p>{{ fromatDateCellData(data) }}</p>
                        </div>
                    </template>
                </monthly-calendar>
            </el-card>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { formatNumUnit, parseDateParams, getGapDate, getMonthShortcuts, dateFormat, getMonthByStep, addCommas } from '@/libs/util'
import festivalMap, { festivalList } from '@/config/festivalMap'
import { getBarOption } from './option'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import MonthlyCalendar from '@/components/monthly-calendar.vue'

export default {
    name: 'order',
    components: {
        MonthlyCalendar,
    },
    setup() {
        const store = new useStore()
        let barChart = null

        const analyseResult = reactive({
            buyRate: 0,
            saleRate: 0,
            totalRate: 0,
            totalProfit: 0,
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
        const calendarIsLoading = ref(false)
        const showMonthCalendar = ref(true)
        const calendarDate = ref(dateFormat(new Date()))
        const calendarYear = ref(dateFormat(new Date()))
        const calendarInnerDate = computed({
            get() {
                return new Date(calendarDate.value)
            },
            set(value) {
                calendarDate.value = dateFormat(value)
            },
        })
        const monthShortcuts = getMonthShortcuts()
        const shortcuts = [
            { text: '今日', value: () => getGapDate() },
            { text: '近7天', value: () => getGapDate(7) },
            { text: '近30天', value: () => getGapDate(30) },
            { text: '近365天', value: () => getGapDate(365) },
            ...monthShortcuts,
        ]
        const analyseDate = ref(monthShortcuts[0].value)
        const barChartMaxWidth = ref(0)

        const getAnalyseData = (params) => store.dispatch('order/getAnalyseData', params)
        const getAnalyseCalendar = (params) => store.dispatch('order/getAnalyseCalendar', params)
        const setAnalyseList = (value) => store.commit('order/setAnalyseList', value)
        const setAnalyseCalendarData = (value) => store.commit('order/setAnalyseCalendarData', value)
        const analyseList = computed(() => store.state.order.analyseList)
        const activeOrderTab = computed(() => store.state.app.activeOrderTab)
        const analyseCalendarData = computed(() => store.state.order.analyseCalendarData)
        const enFutureMap = computed(() => store.getters['order/enFutureMap'])
        const isLogin = computed(() => store.getters['app/isLogin'])

        const displayTime = computed(() => {
            return dateFormat(analyseDate.value[0]) + ' To ' + dateFormat(analyseDate.value[1])
        })

        const getAnalyseDataHandle = async () => { // 所有平仓订单
            if (!isLogin.value) return
            const params = parseDateParams(analyseDate.value)
            params.openOrClose = 0
            await getAnalyseData(params)
        }

        const getAnalyseCalendarHandle = async (date) => {
            if (!isLogin.value) return
            let params = {}
            if (showMonthCalendar.value) {
                const dateParam = date && dateFormat(date) || calendarDate.value
                const day = new Date(dateParam.slice(0, 4), dateParam.slice(6, 7), 0).getDate()
                params = parseDateParams([dateParam.slice(0, 8) + '01', `${dateParam.slice(0, 8)}${day}`])
            } else {
                const year = date || new Date(calendarYear.value).getFullYear()
                params = parseDateParams([`${year}-01-01`, `${year}-12-31`])
            }
            params.openOrClose = 0 // 取所有平仓
            calendarIsLoading.value = true
            await getAnalyseCalendar({ params, type: showMonthCalendar.value ? 'M' : 'Y' })
            calendarIsLoading.value = false
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
            let totalProfit = 0

            const chFutureMap = {}
            analyseList.value.forEach(item => {
                if (!chFutureMap[enFutureMap.value[item.name.replace(/[^a-zA-Z]/g, '')]]) {
                    chFutureMap[enFutureMap.value[item.name.replace(/[^a-zA-Z]/g, '')]] = {
                        winNum: 0,
                        totalNum: 0,
                        totalProfit: 0,
                    }
                }
                if (item.totalProfit > 0) {
                    chFutureMap[enFutureMap.value[item.name.replace(/[^a-zA-Z]/g, '')]].winNum ++
                } 
                chFutureMap[enFutureMap.value[item.name.replace(/[^a-zA-Z]/g, '')]].totalNum ++
                chFutureMap[enFutureMap.value[item.name.replace(/[^a-zA-Z]/g, '')]].totalProfit += item.totalProfit

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
                totalProfit += item.totalProfit
            })

            barChartMaxWidth.value = Object.keys(chFutureMap).length * 50
            
            nextTick(() => {
                destroyBarChart()
                barChart = echarts.init(document.getElementById('barChart'))
                const barOption = getBarOption(chFutureMap)
                barChart.setOption(barOption)
                barChart.dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: 0,
                })
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
            analyseResult.totalProfit = totalProfit.toFixed(2) * 1 || 0
        }

        const destroyBarChart = () => {
            if (barChart) {
                barChart.clear()
                barChart.dispose()
                barChart = null
                document.getElementById('barChart').removeAttribute('_echarts_instance_')
            }
        }

        const changeAnalyseDateHandle = () => {
            analyseAccount()
        }

        const selectDate = (type) => {
            calendarDate.value = getMonthByStep(calendarDate.value, type)
            getAnalyseCalendarHandle()
        }

        const selectYear = (value) => {
            if (typeof value === 'number') {
                const year = new Date(calendarYear.value).getFullYear()
                calendarYear.value = `${year + value}-01-01`
            }
            getAnalyseCalendarHandle()
        }

        const getDateCellClass = (data) => {
            let itemData = analyseCalendarData.value[data.day.slice(0, 7)]
            if (showMonthCalendar.value) {
                itemData = analyseCalendarData.value[data.day]
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

            if (calendarIsLoading.value) return ''

            let className = ''
            if (itemData) {
                if (itemData > 0) {
                    className = 'red-calendar-cell'
                } else {
                    className = 'green-calendar-cell'
                }
            } else if (showMonthCalendar.value) {
                className = 'normal-calendar-cell'
            } else {
                className = 'no-data-month-cell'
            }
            return className
        }

        const fromatDateCellData = (data) => {
            if (calendarIsLoading.value) return ''

            let itemData = analyseCalendarData.value[data.day.slice(0, 7)]
            if (showMonthCalendar.value) {
                itemData = analyseCalendarData.value[data.day]
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

        const changeSwitch = () => {
            if (!showMonthCalendar.value) { // 切换为年，立即请求数据
                getAnalyseCalendarHandle()
            }
        }

        const clickMonCalHandle = (value) => {
            showMonthCalendar.value = true
            calendarDate.value = value.day + '-01'
            getAnalyseCalendarHandle()
        }

        const initAnalyseData = () => {
            if (activeOrderTab.value === 'analyse' && isLogin.value) {
                analyseAccount()
                getAnalyseCalendarHandle()
            }
        }

        watch(isLogin, (value) => {
            if (value) {
                initAnalyseData()
            } else {
                setAnalyseList([]) // 清空数据
                setAnalyseCalendarData({}) // 清空数据
                analyseAccount()
                getAnalyseCalendarHandle()
            }
        })

        watch(activeOrderTab, () => {
            initAnalyseData()
        })

        onMounted(() => {
            initAnalyseData()
        })

        onBeforeUnmount(() => {
            destroyBarChart()
        })

        return {
            DArrowLeft,
            DArrowRight,
            shortcuts,
            analyseDate,
            analyseResult,
            calendarDate,
            calendarYear,
            calendarInnerDate,
            analyseCalendarData,
            displayTime,
            showMonthCalendar,
            barChartMaxWidth,
            selectDate,
            selectYear,
            changeAnalyseDateHandle,
            getDateCellClass,
            fromatDateCellData,
            addCommas,
            getAnalyseCalendarHandle,
            changeSwitch,
            clickMonCalHandle,
        }
    },
}
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
    width: 100%;
    height: 37.5vh;
    min-width: 500px;
    background: white;
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
</style>
