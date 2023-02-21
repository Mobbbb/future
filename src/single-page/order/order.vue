<template>
    <div class="order-wrap">
        <div class="table-wrap">
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
            <div style="padding-left: 24px;">
                <el-button color="#eb4436" type="primary" @click="submitHandle(1, 1)">买入</el-button>
                <el-button color="#21a67a" type="primary" @click="submitHandle(0, 1)">卖出</el-button>
                <el-button type="primary" :disabled="!buySaleListNum.buyListNum" @click="submitHandle(0, 0)">平多</el-button>
                <el-button type="primary" :disabled="!buySaleListNum.saleListNum" @click="submitHandle(1, 0)">平空</el-button>
            </div>
        </div>
        <el-table class="opening-order-table" :data="openingOrderList" border @row-click="orderRowClick">
            <el-table-column prop="name" label="合约" width="70" fixed="left" />
            <el-table-column prop="buyOrSale" width="60" label="多/空">
                <template #default="scope">
                    <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                        {{scope.row.buyOrSale ? '多' : '空'}}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="price" label="开仓均价" />
            <el-table-column prop="hands" label="手数" />
            <el-table-column prop="commission" width="120" label="开仓总手续费" />
        </el-table>
        <el-drawer v-model="showOrderNameDrawer" 
            :direction="overMediaCritical ? 'btt' : 'ltr'" 
            :size="overMediaCritical ? 250 : 483" custom-class="order-name-drawer">
            <div :style="overMediaCritical ? { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' } : {}">
                <el-check-tag class="order-name-label" checked v-for="item in futuresConfigList" @click="selectOrderName(item)" :key="item">{{item}}</el-check-tag>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fetchInsertOrder } from '@/api'
import { dateFormat } from '@/libs/util'
import { ElMessage } from 'element-plus'

export default {
    name: 'order',
    setup() {
        const date = new Date()
        const store = new useStore()
        const ruleFormRef = ref()
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
        const activeOrderTab = computed(() => store.state.app.activeOrderTab)
        const setLoginDrawerStatus = (status) => store.commit('app/setLoginDrawerStatus', status)
        const setOpeningOrderList = (value) => store.commit('order/setOpeningOrderList', value)
        const getOpeningOrderData = () => store.dispatch('order/getOpeningOrderData')
        const getFutureConfigInfo = () => store.dispatch('order/getFutureConfigInfo')

        // 合约列表
        const futuresConfigList = computed(() => {
            const list = []
            const dateList = []
            let year = Number(dateFormat(date, 'yy'))
            let month = Number(dateFormat(date, 'MM'))
            
            for (let i = 0; i < 5; i++) {
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
                dateList.forEach(cell => {
                    list.push(`${item}${cell}`)
                })
            })
            return list
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
                    getOpeningOrderData()
                    formData.hands = NaN
                }
            }
        }

        const changeOrderName = () => { // 切换合约
            localStorage.setItem('default-order-name', formData.name)
        }

        const orderRowClick = (row) => {
            formData.name = row.name
            formData.hands = row.hands
            localStorage.setItem('default-order-name', formData.name)
        }

        const popOrderNameDrawer = () => {
            showOrderNameDrawer.value = true
        }

        const selectOrderName = (name) => {
            showOrderNameDrawer.value = false
            formData.name = name
        }

        watch(activeOrderTab, (value) => {
            if (value === 'order' && isLogin.value) {
                getOpeningOrderData()
            }
        })

        watch(isLogin, (value) => {
            if (value) {
                getOpeningOrderData()
            } else {
                setOpeningOrderList([]) // 清空数据
            }
        })

        onMounted(async () => {
            if (isLogin.value) {
                getOpeningOrderData()
            }
            await getFutureConfigInfo()
            // 设置默认选中的合约
            const defaultOrderName = localStorage.getItem('default-order-name')
            if (defaultOrderName) {
                formData.name = defaultOrderName
            } else {
                formData.name = futuresConfigList.value[0]
            }
        })

        return {
            overMediaCritical,
            futuresConfigList,
            formData,
            rules,
            openingOrderList,
            ruleFormRef,
            buySaleListNum,
            showOrderNameDrawer,
            submitHandle,
            changeOrderName,
            orderRowClick,
            popOrderNameDrawer,
            selectOrderName,
        }
    },
}
</script>

<style scoped>
.order-wrap {
    width: calc(100% - 48px);
}
.opening-order-table {
    width: 100%;
    max-height: 200px;
    font-size: 12px;
    margin: 16px 24px;
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
