<template>
    <div>
        <div class="tool-search-input-wrap">
            <el-input v-model="inputText" 
                @keydown.enter="searchHandle" 
                @clear="searchHandle"
                clearable
                placeholder="请输入..."
                class="search-input" />
            <el-button size="small" type="primary" style="height: 28px;border-radius: 0 3px 3px 0;" @click="searchHandle">MD5加密</el-button>
        </div>
        <el-input class="ios-textarea" type="textarea" resize="none" v-model="md5Result" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import md5 from '@/libs/md5'

const inputText = ref('')
const md5Result = ref('')

const searchHandle = () => {
    md5Result.value = md5(inputText.value)
}
</script>

<style scoped>
.list-wrap {
    padding: 12px 12px 8px 12px;
}
.tool-search-input-wrap {
    display: flex;
    width: 195px;
    height: 32px;
    line-height: 28px;
    right: 16px;
    top: 16px;
}
</style>

<style>
.tool-search-input-wrap .el-input__inner {
    height: 28px;
    border-radius: 4px 0 0 4px;
}
.tool-search-input-wrap .el-input__suffix {
    height: 28px;
}
</style>
