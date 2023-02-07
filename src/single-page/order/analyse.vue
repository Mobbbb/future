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
import { formatNumUnit, parseDateParams, getGapDate, getMonthShortcuts } from '@/libs/util'

export default {
    name: 'order',
    setup() {
        const store = new useStore()

        const getAnalyseData = (params) => store.dispatch('order/getAnalyseData', params)
        const setAnalyseList = (value) => store.commit('order/setAnalyseList', value)
        const analyseList = computed(() => store.state.order.analyseList)
        const activeOrderTab = computed(() => store.state.app.activeOrderTab)

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

        watch(isLogin, (value) => {
            if (value) {
                analyseAccount()
            } else {
                setAnalyseList([]) // 清空数据
                analyseAccount()
            }
        })

        watch(activeOrderTab, async (value) => {
            if (value === 'analyse') {
                analyseAccount()
            }
        })

        onMounted(() => {
            if (activeOrderTab.value === 'analyse') {
                analyseAccount()
            }
        })

        return {
            shortcuts,
            analyseDate,
            analyseResult,
            changeAnalyseDateHandle,
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
</style>

<style>
.analyse-card .el-card__body {
    padding-right: 0;
    padding-bottom: 8px;
    overflow: hidden;
}
</style>
