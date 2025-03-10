<template>
    <div class="list-wrap">
        <div class="scroll-wrap">
            <div class="modules-wrap">
                <div class="modules-title">· 工具一</div>
                <MD5></MD5>
            </div>
            <div class="modules-wrap">
                <div class="modules-title" style="margin-bottom: -8px;">· 工具二</div>
                <Date></Date>
            </div>
            <div class="modules-wrap">
                <div class="modules-title">· 工具三</div>
                <Commission></Commission>
            </div>
        </div>
    </div>
</template>

<script setup>
import MD5 from './md5.vue'
import Commission from './commission.vue'
import Date from './date.vue'

</script>

<style scoped>
.list-wrap {
    height: 100%;
    box-sizing: border-box;
    padding: 12px 6px 8px 12px;
}
.scroll-wrap {
    height: 100%;
    overflow-y: auto;
    padding-right: 6px;
}
.modules-wrap {
    margin-bottom: 36px;
}
.modules-title {
    line-height: 16px;
    font-size: 14px;
    font-weight: 700;
    text-rendering: optimizelegibility;
    color: #404040;
    margin-bottom: 4px;
}
</style>
