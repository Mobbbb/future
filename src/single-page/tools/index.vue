<template>
    <div class="list-wrap">
        <div class="modules-wrap">
            <div class="modules-title">· 工具一</div>
            <MD5></MD5>
        </div>
        <div class="modules-wrap">
            <div class="modules-title">· 工具二</div>
            <Commission></Commission>
        </div>
    </div>
</template>

<script setup>
import MD5 from './md5.vue'
import Commission from './commission.vue'

</script>

<style scoped>
.list-wrap {
    padding: 12px 12px 8px 12px;
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
