<template>
    <div>
        <el-switch  v-model="showNumber"
                    active-color="#690"
                    inactive-color="#905"
                    active-text="数值"
                    inactive-text="公式"
                    class="result-btn" />
        <span class="tips-text" v-if="isInPc">(按回车快速切换)</span>
        <el-radio-group v-model="currentGoodsType" style="display: block;margin-bottom: 4px;">
            <el-radio :label="item.name" v-for="item in futuresList" :key="item" style="height: 26px;">{{item.chName}}</el-radio>
        </el-radio-group>
        <template v-if="currentGoodsConfig.openCommissionType === 'percent'">
            <div v-show="showNumber">
                <div class="line-wrap">
                    <el-input-number @click="clickInput" type="number" v-model="lot" size="small" style="width: 100px;margin-right: 3px;" />
                    <span class="operator">x</span>
                    <span class="name-span" :class="spanNumberClass">{{currentGoodsConfig.num}}</span>
                    <span class="operator">x</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation line-punctuation">[</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;" v-if="saleOrBuy">
                    <span class="operator minus-operator">-</span>
                    <div style="display: inline-flex;">
                        <span class="number-tips">开仓价</span>
                        <el-input-number @click="clickInput" class="number-tips-input" type="number" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                    </div>
                    <span class="operator">x</span>
                    <span class="punctuation">(</span>
                    <span class="name-span" :class="spanNumberClass">1</span>
                    <span class="operator">+</span> 
                    <span class="name-span" :class="spanNumberClass">{{openCommission}}</span>
                    <span class="punctuation">)</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;">
                    <span class="operator" v-if="saleOrBuy">+</span>
                    <div style="display: inline-flex;">
                        <span class="number-tips" v-if="saleOrBuy">平仓价</span>
                        <span class="number-tips" v-else>开仓价</span>
                        <el-input-number @click="clickInput" v-if="saleOrBuy" class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                        <el-input-number @click="clickInput" v-else type="number" class="number-tips-input" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                    </div>
                    <span class="operator">x</span>
                    <span class="punctuation">(</span>
                    <span class="name-span" :class="spanNumberClass">1</span>
                    <span class="operator minus-operator">-</span>
                    <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">{{closeCommission}}</span>
                    <span class="name-span" :class="spanNumberClass" v-else>{{openCommission}}</span>
                    <span class="punctuation">)</span>
                    <span class="operator" v-if="!saleOrBuy">-</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;" v-if="!saleOrBuy">
                    <div style="display: inline-flex;">
                        <span class="number-tips">平仓价</span>
                        <el-input-number @click="clickInput" class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                    </div>
                    <span class="operator">x</span>
                    <span class="punctuation">(</span>
                    <span class="name-span" :class="spanNumberClass">1</span>
                    <span class="operator">+</span> 
                    <span class="name-span" :class="spanNumberClass">{{closeCommission}}</span>
                    <span class="punctuation">)</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation">]</span>
                </div>
                <div class="line-wrap">
                    <span class="operator">=</span>
                    <span class="name-span" :class="spanNumberClass">{{goodsResult}}</span>
                </div>
                <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="showToday" />
            </div>
            <div v-show="!showNumber">
                <div class="line-wrap">
                    <span class="name-span" :class="spanNumberClass">手数</span>
                    <span class="operator">x</span>
                    <span class="name-span" :class="spanNumberClass">交易单位</span>
                    <span class="operator">x</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation line-punctuation">[</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;" v-if="saleOrBuy">
                    <span class="operator minus-operator">-</span>
                    <span class="name-span" v-if="saleOrBuy" :class="spanNumberClass">开仓价</span>
                    <span class="name-span" v-else :class="spanNumberClass">平仓价</span>
                    <span class="operator">x</span>
                    <span class="punctuation">(</span>
                    <span class="name-span" :class="spanNumberClass">1</span>
                    <span class="operator">+</span> 
                    <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">开仓手续费</span>
                    <span class="name-span" :class="spanNumberClass" v-else>平仓手续费</span>
                    <span class="punctuation">)</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;">
                    <span class="operator" v-if="saleOrBuy">+</span>
                    <span class="name-span" v-if="saleOrBuy" :class="spanNumberClass">平仓价</span>
                    <span class="name-span" v-else :class="spanNumberClass">开仓价</span>
                    <span class="operator">x</span>
                    <span class="punctuation">(</span>
                    <span class="name-span" :class="spanNumberClass">1</span>
                    <span class="operator minus-operator">-</span>
                    <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">平仓手续费</span>
                    <span class="name-span" :class="spanNumberClass" v-else>开仓手续费</span>
                    <span class="punctuation">)</span>
                    <span class="operator" v-if="!saleOrBuy">-</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;" v-if="!saleOrBuy">
                    <span class="name-span" v-if="saleOrBuy" :class="spanNumberClass">开仓价</span>
                    <span class="name-span" v-else :class="spanNumberClass">平仓价</span>
                    <span class="operator">x</span>
                    <span class="punctuation">(</span>
                    <span class="name-span" :class="spanNumberClass">1</span>
                    <span class="operator">+</span> 
                    <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">开仓手续费</span>
                    <span class="name-span" :class="spanNumberClass" v-else>平仓手续费</span>
                    <span class="punctuation">)</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation">]</span>
                </div>
                <div class="line-wrap">
                    <span class="operator">=</span>
                    <span class="name-span" :class="spanNumberClass">收益</span>
                </div>
                <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="showToday" />
            </div>
        </template>
        <template v-else>
            <div v-show="showNumber">
                <div class="line-wrap">
                    <el-input-number @click="clickInput" type="number" v-model="lot" size="small" style="width: 100px;margin-right: 3px;" />
                    <span class="operator">x</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation line-punctuation">(</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;">
                    <span class="name-span" :class="spanNumberClass">{{currentGoodsConfig.num}}</span>
                    <span class="operator">*</span>
                    <div style="display: inline-flex;">
                        <span class="number-tips" v-if="saleOrBuy">平仓价</span>
                        <span class="number-tips" v-else>开仓价</span>
                        <el-input-number @click="clickInput" v-if="saleOrBuy" class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                        <el-input-number @click="clickInput" v-else type="number" class="number-tips-input" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                    </div>
                    <span class="operator">-</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;">
                    <span class="name-span" :class="spanNumberClass">{{currentGoodsConfig.num}}</span>
                    <span class="operator">*</span>
                    <div style="display: inline-flex;">
                        <span class="number-tips" v-if="saleOrBuy">开仓价</span>
                        <span class="number-tips" v-else>平仓价</span>
                        <el-input-number @click="clickInput" v-if="saleOrBuy" type="number" class="number-tips-input" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                        <el-input-number @click="clickInput" v-else class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                    </div>
                    <span class="operator">-</span>
                    <span class="name-span" :class="spanNumberClass">{{openCommission + closeCommission}}</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation">)</span> 
                </div>
                <div class="line-wrap">
                    <span class="operator">=</span>
                    <span class="name-span" :class="spanNumberClass">{{goodsResult}}</span>
                </div>
                <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="showToday" />
            </div>
            <div v-show="!showNumber">
                <div class="line-wrap">
                    <span class="name-span" :class="spanNumberClass">手数</span>
                    <span class="operator">x</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation line-punctuation">(</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;">
                    <span class="name-span" :class="spanNumberClass">交易单位</span>
                    <span class="operator">*</span>
                    <span class="name-span" :class="spanNumberClass">卖出价</span>
                    <span class="operator">-</span>
                </div>
                <div class="line-wrap" style="padding-left: 12px;">
                    <span class="name-span" :class="spanNumberClass">交易单位</span>
                    <span class="operator">*</span>
                    <span class="name-span" :class="spanNumberClass">买入价</span>
                    <span class="operator">-</span>
                    <span class="name-span" :class="spanNumberClass">手续费</span>
                </div>
                <div class="line-wrap">
                    <span class="punctuation">)</span> 
                </div>
                <div class="line-wrap">
                    <span class="operator">=</span>
                    <span class="name-span" :class="spanNumberClass">收益</span>
                </div>
            </div>
        </template>
        <el-radio-group v-model="saleOrBuy" style="display: block;margin-top: 6px;">
            <el-radio :label="1" style="height: 26px;">平多</el-radio>
            <el-radio :label="0" style="height: 26px;">平空</el-radio>
        </el-radio-group>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import config, { PC } from '@/config'

const store = new useStore()

const showNumber = ref(true)
const isToday = ref(false)
const saleOrBuy = ref(1)

const setGoodsLot = (value) => store.commit('app/setGoodsLot', value)
const setGoodsPricePrev = (value) => store.commit('app/setGoodsPricePrev', value)
const setGoodsPriceNext = (value) => store.commit('app/setGoodsPriceNext', value)
const setGoodsType = (value) => store.commit('app/setGoodsType', value)

const isInPc = computed(() => config.device === PC)
const spanNumberClass = computed(() => showNumber.value ? 'result-number' : '')
const goods = computed(() => store.state.app.goods)
const futuresList = computed(() => store.getters['order/futuresList'])

const lot = computed({
    get() {
        return goods.value.lot
    },
    set(value) {
        setGoodsLot(value)
    },
})

const pricePrev = computed({
    get() {
        return goods.value.pricePrev
    },
    set(value) {
        setGoodsPricePrev(value)
    },
})

const priceNext = computed({
    get() {
        return goods.value.priceNext
    },
    set(value) {
        setGoodsPriceNext(value)
    },
})

const currentGoodsType = computed({
    get() {
        return goods.value.type
    },
    set(value) {
        setGoodsType(value)
    },
})

const currentGoodsConfig = computed(() => {
    return futuresList.value.filter(item => item.activeName === currentGoodsType.value)[0] || {}
})

const goodsResult = computed(() => {
    const { openCommissionType, closeCommissionType, num } = currentGoodsConfig.value

    let totalOpenCommission = 0
    let totalCloseCommission = 0

    // 计算开仓总手续费
    if (openCommissionType === 'number') {
        totalOpenCommission += openCommission.value * goods.value.lot
    } else {
        totalOpenCommission += openCommission.value * goods.value.pricePrev * num * goods.value.lot
    }

    // 计算平仓总手续费
    if (closeCommissionType === 'number') {
        totalCloseCommission += closeCommission.value * goods.value.lot
    } else {
        totalCloseCommission += closeCommission.value * goods.value.priceNext * num * goods.value.lot
    }

    let deltaPrice = 0
    if (saleOrBuy.value) { // 平多
        // 平仓价 - 开仓价
        deltaPrice = goods.value.priceNext - goods.value.pricePrev
    } else {
        deltaPrice = goods.value.pricePrev - goods.value.priceNext
    }

    return goods.value.lot * num * deltaPrice - totalOpenCommission - totalCloseCommission
})

const showToday = computed(() => {
    const { closeCommission, dayCloseCommission } = currentGoodsConfig.value

    return closeCommission !== dayCloseCommission
})

const openCommission = computed(() => {
    const { dayOpenCommission } = currentGoodsConfig.value
    let { openCommission: commission } = currentGoodsConfig.value

    if (isToday.value) {
        commission = dayOpenCommission
    }

    return commission
})

const closeCommission = computed(() => {
    const { dayCloseCommission } = currentGoodsConfig.value
    let { closeCommission: commission } = currentGoodsConfig.value

    if (isToday.value) {
        commission = dayCloseCommission
    }

    return commission
})

watch(() => futuresList.value, () => {
    if (futuresList.value.length) {
        setGoodsType(futuresList.value[0].name)
    }
})

onMounted(async () => {
    if (isInPc.value) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                showNumber.value = !showNumber.value
            }
        })
    }

    try {
        // 禁用双击缩放
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault()
            }
        })
    } catch (error) {}

    if (futuresList.value.length) {
        setGoodsType(futuresList.value[0].name)
    }
})

const clickInput = (e) => {
    e.preventDefault()
}
</script>

<style scoped>
.line-wrap {
    height: 27px;
    line-height: 16px;
}
.tips-text {
    font-size: 12px;
    color: #bbb;
    margin-left: 8px;
}
.result-btn {
    height: 26px;
}
.name-span {
    display: inline-block;
    height: 23px;
    line-height: 1.92;
    padding: 0 6px;
    box-sizing: border-box;
    border: 1px solid #d9d9d9;
    color: #905;
    text-align: center;
    font-size: 12px;
    border-radius: 3px;
    margin: 2px;
}
.hover-name-span:hover {
    cursor: pointer;
    background: #f8f8f8;
}
.operator {
    color: #9a6e3a;
    background: hsla(0, 0%, 100%, .5);
    margin: 0 2px;
}
.minus-operator {
    padding: 0 2px;
}
.punctuation {
    color: #999;
    margin: 0 2px;
    margin-bottom: 1px;
}
.number {
    color: #905;
    margin: 0 2px;
}
.result-number {
    color: #690;
}
.number-tips {
    border-radius: 4px 0 0 4px;
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-right: none;
    line-height: 22px;
    display: inline-block;
    padding: 0 6px;
    color: #606266;
    font-size: 12px;
}
.line-punctuation {
    line-height: 27px;
}
</style>

<style>
.checkbox-tool {
    height: 14px;
    margin-top: 12px;
}
.number-tips-input .el-input-number__decrease {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
.number-tips-input .el-input__inner {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
</style>
