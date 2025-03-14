<!--交易 -> 下单页-->
<template>
    <div class="future-wrap" ref="tableTabWrap">
        <div class="form-wrap" ref="formWrap">
            <el-form 
                :model="formData"
                :rules="rules" 
                label-width="95px" 
                label-position="left"
                ref="ruleFormRef"
                style="width: 325px;padding-left: 24px;">
                <el-form-item label="交易日期" prop="date">
                    <el-date-picker v-model="formData.date" type="datetime" class="order-date-input" placeholder="请选择日期" :editable="false" :clearable="false" />
                </el-form-item>
                <el-form-item label="合约" prop="name">
                    <div class="drawer-input" @click="popOrderNameDrawer">{{formData.name}}</div>
                </el-form-item>
                <el-form-item label="成交价" prop="price">
                    <el-input-number v-model="formData.price" style="width: 180px;" placeholder="请输入成交价" />
                </el-form-item>
                <el-form-item label="手数" prop="hands">
                    <el-input-number v-model="formData.hands" style="width: 180px;" placeholder="请输入手数" />
                </el-form-item>
            </el-form>
            <div style="padding-left: 24px;padding-bottom: 12px;">
                <el-button color="#eb4436" type="primary" @click="submitHandle(1, 1)">买入</el-button>
                <el-button color="#21a67a" type="primary" @click="submitHandle(0, 1)">卖出</el-button>
                <el-button type="primary" :disabled="!buySaleListNum.buyListNum" @click="submitHandle(0, 0)">平多</el-button>
                <el-button type="primary" :disabled="!buySaleListNum.saleListNum" @click="submitHandle(1, 0)">平空</el-button>
            </div>
            <div class="recently-tag-wrap" v-if="recentlyFeatureNames.length">
                <span>最近合约：</span>
                <el-check-tag class="order-name-label" checked v-for="item in recentlyFeatureNames" @click="selectOrderName(item)" :key="item">{{item}}</el-check-tag>
            </div>
        </div>
        <el-table class="opening-order-table" :height="openingOrderTableHeight" :data="openingOrderList" border @row-click="orderRowClick">
            <el-table-column prop="name" label="合约" width="70" fixed="left" />
            <el-table-column prop="buyOrSale" width="60" label="多/空">
                <template #default="scope">
                    <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                        {{scope.row.buyOrSale ? '多' : '空'}}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="price" minWidth="90" label="开仓均价">
                <template #default="scope">
                    <el-popover placement="top" :width="340" trigger="click" @after-enter="orderPriceClick(scope.row, scope.$index)">
                        <template #reference>
                            <div class="price-cell">{{ scope.row.price }}</div>
                        </template>
                        <div :id="'lineChart' + scope.$index" class="line-chart"></div>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column prop="hands" label="手数" />
            <el-table-column prop="commission" width="120" label="开仓总手续费" />
        </el-table>
        <el-drawer v-model="showOrderNameDrawer" 
            :direction="overMediaCritical ? 'btt' : 'ltr'" 
            :size="overMediaCritical ? 250 : 400" custom-class="order-name-drawer">
            <div :style="overMediaCritical ? { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' } : {}">
                <div v-for="(item, index) in futuresConfigList" :key="index">
                    <el-check-tag class="order-name-label" checked v-for="cell in item" @click="selectOrderName(cell)" :key="cell">{{cell}}</el-check-tag>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { fetchInsertOrder, fetchRecentlyFeature } from '@/api'
import { ElMessage } from 'element-plus'
import { getOrderLineOption } from './option'
import { dateFormat } from 'umob'

const futuresNum = 6

const date = new Date()
const store = new useStore()
const ruleFormRef = ref()
const tableTabWrap = ref()
const formWrap = ref()
const recentlyFeatureNames = ref([])
const openingOrderTableHeight = ref(40)
const showOrderNameDrawer = ref(false)
const formData = reactive({
    date,
    name: '',
    buyOrSale: 0,
    openOrClose: 0,
    hands: NaN,
    price: NaN,
})

const rules = reactive({
    date: [{ required: true, message: '请选择日期', trigger: 'change' }],
    name: [{ required: true, message: '请选择合约', trigger: 'change' }],
    hands: [{ required: true,  message: '请输入手数', trigger: 'change', validator: (rule, value, callback) => {
        if (value) {
            callback()
        } else {
            callback(new Error())
        }
    }}],
    price: [{ required: true,  message: '请输入成交价', trigger: 'change', validator: (rule, value, callback) => {
        if (value) {
            callback()
        } else {
            callback(new Error())
        }
    }}],
})

const futuresList = computed(() => store.getters['order/futuresList'])
const isLogin = computed(() => store.getters['app/isLogin'])
const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])
const openingOrderList = computed(() => store.state.order.openingOrderList)
const openingOrderGroup = computed(() => store.state.order.openingOrderGroup)
const activeOrderTab = computed(() => store.state.app.activeOrderTab)
const setLoginDrawerStatus = (status) => store.commit('app/setLoginDrawerStatus', status)
const setOpeningOrderList = (value) => store.commit('order/setOpeningOrderList', value)
const getOpeningOrderData = () => store.dispatch('order/getOpeningOrderData')

// 合约列表
const futuresConfigList = computed(() => {
    const list = []
    const dateList = []
    let year = Number(dateFormat(date, 'yy'))
    let month = Number(dateFormat(date, 'MM'))
    
    for (let i = 0; i < futuresNum; i++) {
        month ++
        if (month > 12) {
            year ++
            month = 1
        }
        if (month < 10) {
            dateList.unshift(`${year}0${month}`)
        } else {
            dateList.unshift(`${year}${month}`)
        }
    }

    futuresList.value.forEach(item => {
        list.push([])
        dateList.forEach(cell => {
            list[list.length - 1].unshift(`${item.name}${cell}`)
        })
    })
    return list
})

const futuresConfigListMap = computed(() => {
    const obj = {}
    futuresList.value.forEach(item => {
        obj[item.name.toLowerCase()] = item.name
    })
    return obj
})

const buySaleListNum = computed(() => {
    const buyList = openingOrderList.value.filter(item => item.buyOrSale === 1 && formData.name === item.name) // 多单列表
    const saleList = openingOrderList.value.filter(item => item.buyOrSale === 0 && formData.name === item.name) // 空单列表
    return {
        buyListNum: buyList.length, // 多单列表为空
        saleListNum: saleList.length,
    }
})

/**
 * @param {*} buyOrSale 1买，0卖
 * @param {*} openOrClose 1开，0平
 */
const submitHandle = async (buyOrSale, openOrClose) => {
    if (!isLogin.value) {
        setLoginDrawerStatus(true)
    } else {    
        const valid = await ruleFormRef.value.validate().catch(e => e)
        if (valid !== true) return
        
        formData.buyOrSale = buyOrSale
        formData.openOrClose = openOrClose
        formData.date = dateFormat(formData.date, 'yyyy-MM-dd hh:mm:ss')
        const data = await fetchInsertOrder(formData) || {}
        const { success } = data
        if (success) {
            ElMessage.success('操作成功')
            rerenderTable()
            formData.hands = NaN
        }
    }
}

const getRecentlyFeature = async () => {
    const res = await fetchRecentlyFeature()
    recentlyFeatureNames.value = res.data || []
    recentlyFeatureNames.value = recentlyFeatureNames.value.slice(0, 6)
}

window._importOrder_ = async (params) => {
    const enName = futuresConfigListMap.value[params.enName]
    params.name = enName + params.numName
    const data = await fetchInsertOrder(params) || {}
    const { success = false } = data
    if (success) {
        ElMessage.success('操作成功')
    }
    return success
}
window._rerenderTable_ = () => {
    rerenderTable()
}

const popOrderNameDrawer = () => {
    showOrderNameDrawer.value = true
}

const selectOrderName = (name) => {
    showOrderNameDrawer.value = false
    formData.name = name
    localStorage.setItem('default-order-name', formData.name)
}

const orderRowClick = (row) => {
    formData.name = row.name
    formData.hands = row.hands
    localStorage.setItem('default-order-name', formData.name)
}

const orderPriceClick = (row, index) => {
    const echartLists = {
        x: [],
        y: [],
    }
    openingOrderGroup.value[`${row.name}${row.buyOrSale}`].forEach(item => {
        for (let i = 0; i < item.hands; i++) {
            echartLists.y.push(item.price)
            echartLists.x.push(dateFormat(item.date, 'MM.dd'))
        }
    })
    const lineChartIns = echarts.init(document.getElementById('lineChart' + index))
    lineChartIns.setOption(getOrderLineOption(echartLists))
}

const rerenderTable = async () => {
    await getOpeningOrderData()
    nextTick(() => {
        if (openingOrderList.value.length && tableTabWrap.value && formWrap.value) {
            const bottomRestHeight = tableTabWrap.value.getBoundingClientRect().height - formWrap.value.getBoundingClientRect().height - 16
            const tableTotalHeight = (openingOrderList.value.length + 1) * 40
            if (bottomRestHeight < tableTotalHeight) {
                openingOrderTableHeight.value = bottomRestHeight
            } else {
                openingOrderTableHeight.value = tableTotalHeight
            }
        } else {
            openingOrderTableHeight.value = 115
        }
    })
}

const initOpeningAndRecentlyFeature = async () => {
    if (activeOrderTab.value === 'order') {
        if (isLogin.value) {
            await getRecentlyFeature()
            rerenderTable()
        } else {
            nextTick(() => {
                openingOrderTableHeight.value = 115
            })
        }
    }
}

watch(isLogin, (value) => {
    if (value) {
        initOpeningAndRecentlyFeature()
    } else {
        setOpeningOrderList([]) // 清空数据
        recentlyFeatureNames.value = []
        openingOrderTableHeight.value = 115
    }
})

watch(activeOrderTab, () => {
    initOpeningAndRecentlyFeature()
})

onMounted(async () => {
    await initOpeningAndRecentlyFeature()
    // 设置默认选中的合约
    const defaultOrderName = localStorage.getItem('default-order-name')
    if (defaultOrderName) {
        formData.name = defaultOrderName
    } else {
        formData.name = futuresConfigList.value[0] && futuresConfigList.value[0][0] || ''
    }
})
</script>

<style scoped>
.opening-order-table {
    width: calc(100% - 48px);
    font-size: 12px;
    margin: 0 24px;
}
.drawer-input {
    background-color: var(--el-input-bg-color,var(--el-color-white));
    border-radius: var(--el-input-border-radius,var(--el-border-radius-base));
    box-sizing: border-box;
    color: var(--el-input-text-color,var(--el-text-color-regular));
    display: inline-block;
    font-size: inherit;
    width: 180px;
    height: 32px;
    line-height: 32px;
    outline: 0;
    padding: 0 11px;
    transition: var(--el-transition-box-shadow);
    box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color-base)) inset;
    cursor: pointer;
    transition: all .3s;
}
.drawer-input:hover {
    box-shadow: 0 0 0 1px #c0c4cc inset;
}
.drawer-input:active {
    outline: 0;
    box-shadow: 0 0 0 1px #409eff inset;
}
.order-name-label.is-checked {
    background-color: white;
    border: 1px solid var(--el-input-border-color,var(--el-border-color-base));
    padding: 4px 12px;
    font-weight: normal;
    color: #606266;
    margin: 0 8px 12px 0;
    transition: all .3s;
    width: 82px;
    text-align: center;
    padding-top: 5px;
    box-sizing: border-box;
}
.order-name-label.is-checked:hover {
    border: 1px solid #c0c4cc;
}
.order-name-label.is-checked:active {
    border: 1px solid #409eff;
}
.recently-tag-wrap .order-name-label.is-checked {
    margin: 0 8px 8px 0;
    width: 70px;
    padding: 4px 0px;
}
.recently-tag-wrap {
    padding: 0 16px 4px 24px;
}
.line-chart {
    width: 340px;
    height: 300px;
}
.price-cell {
    cursor: pointer;
}
</style>

<style>
.order-date-input .el-input__inner {
    padding-right: 12px!important;
    width: 180px;
}
.order-name-drawer .el-drawer__header{
    display: none;
}
.order-name-drawer .el-drawer__body {
    padding-right: 12px;
    padding-bottom: 8px;
}
</style>
