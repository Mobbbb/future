<template>
    <div class="login-tips-wrap">
        <div>
            <blockquote>您当前还未登录</blockquote>
            <div class="no-data-btn" @click="showLoginHandle">前往登录</div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'vuex'

const store = new useStore()

const setLoginDrawerStatus = (status) => store.commit('app/setLoginDrawerStatus', status)

const showLoginHandle = () => {
    setLoginDrawerStatus(true)
}
</script>

<style scoped>
.login-tips-wrap {
    height: calc(100% - 36px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 30vh;
    box-sizing: border-box;
}
.login-tips-wrap blockquote {
    font-size: 16px;
    color: #999;
    border-left: 4px solid #dfe2e5;
    margin: 12px 0;
    padding: 8px 0 8px 12px;
}
.login-tips-wrap .no-data-btn {
    color: #3eaf7c;
    font-weight: 500;
    font-size: 16px;
    transition: color .2s ease;
}
.login-tips-wrap .no-data-btn:hover {
    cursor: pointer;
    color: #79cea8;
}
</style>
