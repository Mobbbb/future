<template>
    <div class="calc-date-wrap">
        <el-card class="card-wrap" :style="style">
            <template #header><span>开始时间</span></template>
            <div class="input-item-wrap">
                <input type="radio" v-model="startType" name="startTime" value="1" class="calc-radio">
                <span class="input-text">日 期：</span>
                <el-date-picker class="calc-date-input" size="small" :clearable="false" v-model="startDate" placeholder="年 - 月 - 日"></el-date-picker>
                <input v-model="startTime" type="time" class="time-picker" v-show="!hideTime">
            </div>
            <div class="input-item-wrap">
                <input type="radio" v-model="startType" name="startTime" value="2" class="calc-radio">
                <span class="input-text">现 在：</span>
                <span>{{ hideTime ? nowDate : nowTime }}</span><RefreshIcon @on-click="updateTime" style="margin-left: 8px;"></RefreshIcon>
            </div>
        </el-card>
        <el-card class="card-wrap" :style="style">
            <template #header><span>结束时间</span></template>
            <div class="input-item-wrap">
                <input type="radio" v-model="endType" name="endTime" value="1" class="calc-radio">
                <span class="input-text">日 期：</span>
                <el-date-picker class="calc-date-input" size="small" :clearable="false" v-model="endDate" placeholder="年 - 月 - 日"></el-date-picker>
                <input v-model="endTime" type="time" class="time-picker" v-show="!hideTime">
            </div>
            <div class="input-item-wrap" style="margin-bottom: 8px;">
                <input type="radio" v-model="endType" name="endTime" value="2" class="calc-radio">
                <span class="input-text">现 在：</span>
                <span>{{ hideTime ? nowDate : nowTime }}</span><RefreshIcon @on-click="updateTime" style="margin-left: 8px;"></RefreshIcon>
            </div>
            <div class="input-item-wrap" style="flex-wrap: wrap;">
                <input type="radio" v-model="endType" name="endTime" value="3" class="calc-radio">
                <el-select size="small" :clearable="false" v-model="type" clearable style="width: 42px;margin-top: 4px;">
                    <el-option label="+" :value="0"></el-option>
                    <el-option label="-" :value="1"></el-option>
                </el-select>
                <el-input-number size="small" :min="0" v-model="deltaTime.year" style="width: 80px;margin: 4px 4px 0 4px;" placeholder="年" />年 ,
                <el-input-number size="small" :min="0" v-model="deltaTime.week" style="width: 80px;margin: 4px 4px 0 4px;" placeholder="周" />周,<br>
                <el-input-number size="small" :min="0" v-model="deltaTime.day" style="width: 80px;margin: 4px 4px 0 4px;" placeholder="天" />天
                <span v-show="!hideTime">,</span>
                <input v-model="deltaTime.time" type="time" class="time-picker" style="margin: 4px 4px 0 4px;" v-show="!hideTime">
                <span v-show="!hideTime">小时和分钟</span>
            </div>
        </el-card>
        <div class="btn-wrap" :style="style">
            <el-button size="small" type="primary" @click="calculate">计算</el-button>
            <el-checkbox size="small" v-model="hideTime" border style="margin-left: 12px;">隐藏时间</el-checkbox>
        </div>
        <div class="result-wrap" :style="style">{{ result || '--' }}</div>
    </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { dateFormat } from 'umob'
import { useStore } from 'vuex'
import RefreshIcon from '@/components/refresh-icon.vue'

const store = new useStore()

const hideTime = ref(false)

const nowDate = ref(dateFormat(new Date(), 'yyyy-MM-dd'))
const nowTime = ref(dateFormat(new Date(), 'yyyy-MM-dd hh:mm'))

const startType = ref('1')
const endType = ref('1')

const startDate = ref(nowDate.value)
const startTime = ref('12:00')
const endDate = ref(nowDate.value)
const endTime = ref('12:00')

const type = ref('+')
const deltaTime = reactive({
    year: 0,
    week: 0,
    day: 0,
    time: '00:00',
})

const result = ref('')

const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])

const style = computed(() => {
    return overMediaCritical.value ? {
        textAlign: 'left',
        justifyContent: 'flex-start',
        width: '100%',
    } : {}
})

const updateTime = () => {
    nowDate.value = dateFormat(new Date(), 'yyyy-MM-dd')
    nowTime.value = dateFormat(new Date(), 'yyyy-MM-dd hh:mm')
}

function convertMilliseconds(ms) {
    const dayTimestamp = 1 * 24 * 60 * 60 * 1000
    const years = Math.floor(ms / dayTimestamp / 365)
    const days = Math.floor((ms - years * 365 * dayTimestamp) / dayTimestamp)
    const hours = Math.floor((ms - years * 365 * dayTimestamp - days * dayTimestamp) / 1000 / 60 / 60)
    const minutes = Math.floor((ms - years * 365 * dayTimestamp - days * dayTimestamp - hours * 60 * 60 * 1000) / 1000 / 60)

    const yearText = years ? `${years}年` : ''
    const daysText = days ? `${days}天` : ''
    const hoursText = hours ? `${hours}小时` : ''
    const minutesText = minutes ? `${minutes}分钟` : ''
    return `${yearText}${daysText}${hoursText}${minutesText}` ? `${yearText} ${daysText} ${hoursText} ${minutesText}` : '0秒'
}

const calculate = () => {
    startDate.value = dateFormat(startDate.value)
    endDate.value = dateFormat(endDate.value)

    const calcStartTime = hideTime.value ? `${startDate.value} 00:00:00` : `${startDate.value} ${startTime.value}:00`
    const calcNowTime = hideTime.value ? `${nowDate.value} 00:00:00` : `${nowTime.value}:00`

    const calcStart = startType.value === '1' ? calcStartTime : calcNowTime
    const calcStartTimestamp = new Date(calcStart).getTime()

    if (endType.value === '3') {
        const DAY = 24 * 60 * 60 * 1000
        const timeArr = deltaTime.time.split(':')
        const calcdeltaTimestamp = deltaTime.year * 365 * DAY + deltaTime.week * 7 * DAY + deltaTime.day * DAY + timeArr[0] * 60 * 60 * 1000 + timeArr[1] * 60 * 1000
        if (type.value === '+') {
            result.value = '计算结果：' + dateFormat(new Date(calcStartTimestamp + calcdeltaTimestamp), hideTime.value ? 'yyyy-MM-dd' : 'yyyy-MM-dd hh:mm')
        } else {
            result.value = '计算结果：' + dateFormat(new Date(calcStartTimestamp - calcdeltaTimestamp), hideTime.value ? 'yyyy-MM-dd' : 'yyyy-MM-dd hh:mm')
        }
    } else {
        const calcEndTime = hideTime.value ? `${endDate.value} 00:00:00` : `${endDate.value} ${endTime.value}:00`
        const calcEnd = endType.value === '1' ? calcEndTime : calcNowTime
        const calcEndTimestamp = new Date(calcEnd).getTime()
        result.value = '间隔：' + convertMilliseconds(Math.abs(calcStartTimestamp - calcEndTimestamp))
    }
}

</script>

<style scoped>
.calc-date-wrap {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.card-wrap {
    width: 49%;
    min-width: 300px;
    margin-top: 12px;
}
.time-picker {
    width: 90px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    border: none;
    height: 24px;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 13px;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    color: #606266;
    border-radius: 4px;
    margin-left: 4px;
    outline: none; /* 移除默认的outline */
    transition: all .2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.time-picker:focus {
    box-shadow: 0 0 0 1px #409eff inset;
}
.input-item-wrap {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
}
.input-item-wrap:last-of-type {
    margin-bottom: 0;
}
.calc-radio {
    margin-right: 4px;
}
.input-text {
    white-space: nowrap;
}
.btn-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 12px 1% 8px;
}
.result-wrap {
    color: #606266;
    font-weight: bold;
    white-space: nowrap;
    height: 25px;
    width: 100%;
    text-align: center;
    margin: 0 1%;
    margin-bottom: -10px;
}
</style>

<style>
.calc-date-input.el-input--small {
    width: 100px;
}
.calc-date-input.el-input--small .el-input__inner {
    padding-right: 0;
}
</style>
