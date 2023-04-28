<template>
    <div class="monthly-calendar">
        <div class="monthly-calendar__header"><slot name="header"></slot></div>
        <div class="monthly-calendar__body">
            <table class="monthly-calendar-table" cellspacing="0" cellpadding="0">
                <tbody>
                    <tr class="el-calendar-table__row" v-for="item in monthArr" :key="item">
                        <td v-for="cell in item" :key="cell">
                            <div class="el-calendar-day" @click="clickHandle({ month: monthMap[cell], label: cell, day: `${year_}-${monthMap[cell]}` })">
                                <slot name="dateCell" 
                                    :data="{ month: monthMap[cell], label: cell, day: `${year_}-${monthMap[cell]}` }"
                                    :month="cell">
                                    <p>{{ cell }}</p>
                                </slot>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { computed, toRefs } from 'vue'

export default {
    name: 'monthly-calendar',
    props: {
        year: {
            default: '1970',
            type: String,
        },
    },
    setup(props, { emit }) {
        const { year } = toRefs(props)

        const monthArr = [
            ['一月', '二月', '三月', '四月'],
            ['五月', '六月', '七月', '八月'],
            ['九月', '十月', '十一月', '十二月'],
        ]

        const monthMap = {
            '一月': '01',
            '二月': '02',
            '三月': '03',
            '四月': '04',
            '五月': '05',
            '六月': '06',
            '七月': '07',
            '八月': '08',
            '九月': '09',
            '十月': '10',
            '十一月': '11',
            '十二月': '12',
        }

        const clickHandle = (value) => {
            emit('on-click', value)
        }

        const year_ = computed(() => year.value.slice(0, 4))

        return {
            year_,
            monthMap,
            monthArr,
            clickHandle,
        }
    },
}
</script>

<style scoped>
.monthly-calendar  {
    margin: 0 -6px;
}
.monthly-calendar-table {
    table-layout: fixed;
    width: 100%;
}
.monthly-calendar__header {
    display: flex;
    justify-content: space-between;
    margin: 0 6px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
}
.monthly-calendar-table td {
    vertical-align: top;
    transition: background-color var(--el-transition-duration-fast) ease;
    padding: 0 6px;
    box-sizing: border-box;
}
.monthly-calendar-table .el-calendar-day {
    box-sizing: border-box;
    padding: 0;
    height: 60px;
    font-size: 16px;
    text-align: center;
    color: #222;
    cursor: pointer;
}
.monthly-calendar-table .el-calendar-day p:first-of-type {
    padding: 8px;
}
.monthly-calendar__body {
    padding-top: 20px;
}
</style>
