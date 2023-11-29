<template>
    <div class="app-main" :class="appMainClass" :style="appMainStyle" @click="handleSelect" @touchmove.self.prevent>
        <NavMenu @on-search="searchHandle"></NavMenu>
        <div class="main-wrap" :style="mainWrapStyle">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import NavMenu from '@/single-page/components/nav-menu.vue'
import Refresh from '@/single-page/components/refresh.vue'
import config, { PC } from '@/config'
import { filterDataByText } from '@/libs/data-processing'
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const publicPath = require('@/config/resource').publicPath
window.version = require('package').version

export default {
    name: 'App',
    components: {
        NavMenu,
        Refresh,
    },
    setup() {
        const store = new useStore()
        const homeTotalListData = computed(() => store.state.app.homeTotalListData)

        const setHomeListData = (value) => store.commit('app/setHomeListData', value)
        const INIT_USER = (value) => store.dispatch('app/INIT_USER', value)
        const getFutureConfigInfo = () => store.dispatch('order/getFutureConfigInfo')
        
        onMounted(async () => {
            INIT_USER()
            getFutureConfigInfo()
            window.addEventListener('load', function() {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register(publicPath + '/sw.js')
                }
            })
        })

        const searchHandle = (value) => {
            setHomeListData(filterDataByText(value, homeTotalListData.value))
        }

        return {
            mainWrapStyle: computed(() => store.getters['app/mainStyle']),
            appMainClass: computed(() => config.device === PC ? '' : 'mobile-class'),
            appMainStyle: computed(() => {
                return {
                    paddingTop: `${store.state.app.navHeight}px`,
                    background: '#f5f5f5',
                }
            }),
            searchHandle,
        }
    },
}
</script>

<style scoped>
.app-main{
    background-size: 100% auto;
    background-repeat: no-repeat;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
}
.main-wrap{
    margin: 0 auto;
    box-sizing: border-box;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    border-radius: 2px;
    position: relative;
}
</style>
