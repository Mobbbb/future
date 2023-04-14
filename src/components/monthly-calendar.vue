<template>
    <div class="monthly-calendar">
        <div class="monthly-calendar__header"><slot name="header"></slot></div>
        <div class="monthly-calendar__body">
            <table class="monthly-calendar-table" cellspacing="0" cellpadding="0">
                <tbody>
                    <tr class="el-calendar-table__row" v-for="item in monthArr" :key="item">
                        <td v-for="cell in item" :key="cell">
                            <div class="el-calendar-day" @click="clickHandle(monthMap[cell])">
                                <slot name="dateCell" :data="monthMap[cell]" :month="cell"><p>{{ cell }}</p></slot>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'monthly-calendar',
    setup(props, { emit }) {
        const monthArr = [
            ['一月', '二月', '三月', '四月'],
            ['五月', '六月', '七月', '八月'],
            ['九月', '十月', '十一月', '十二月'],
        ]

        const monthMap = {
            '一月': 1,
            '二月': 2,
            '三月': 3,
            '四月': 4,
            '五月': 5,
            '六月': 6,
            '七月': 7,
            '八月': 8,
            '九月': 9,
            '十月': 10,
            '十一月': 11,
            '十二月': 12,
        }

        const clickHandle = (value) => {
            emit('on-click', value)
        }

        return {
            monthMap,
            monthArr,
            clickHandle,
        }
    },
}
</script>

<style scoped>
.monthly-calendar-table {
    table-layout: fixed;
    width: 100%;
}
.monthly-calendar-table td {
    vertical-align: top;
    transition: background-color var(--el-transition-duration-fast) ease;
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
.monthly-calendar__header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
}
.monthly-calendar__body {
    padding-top: 20px;
}
</style>
