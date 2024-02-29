<template>
    <div class="home-wrap" v-loading="isLoading">     
        <div class="list-wrap" ref="listWrap">
            <div class="article-item-wrap mobile-wrap" v-for="item in showListData" :key="item.id" @click="clickHandle(item)">
                <div class="article-title">
                    <span class="html-content" v-html="item.htmlContent" :ref="el => setItemRef(el, item.index)"></span>
                    <div class="time-text">{{item.pubtime}}</div>
                    <!-- <div class="number-text">{{index + 1}}</div> -->
                </div>
                <el-avatar v-if="item.uin === 491450147" class="list-uid" 
                    src="/resource/future/images/2023-11-29.jpg"/>
                <el-avatar v-else class="list-uid"
                    src="/resource/home-assets/images/manifest-48x48.png"/>
            </div>
            <el-empty description="暂无数据" v-if="!showListData.length"></el-empty>
        </div>
        <el-pagination small background layout="prev, jumper, next, total" 
            v-model:currentPage="currentPage"
            :page-size="pageSize"
            :total="homeListData.length"
            @current-change="pageChange"
            class="gc-pagination" />
        <Refresh @on-click="refreshHandle" :showRedPoint="showRedPoint"></Refresh>
    </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { fetchFlag } from '@/api'
import Refresh from '@/single-page/components/refresh.vue'

export default {
    name: 'home',
    components: {
        Refresh,
    },
    setup() {
        const store = new useStore()
        const currentPage = ref(1)
        const isLoading = ref(false)
        const showRedPoint = ref(false)
        const newStatus = ref(null)
        const listWrap = ref(null)
        const htmlContent = {}
        const homeListData = computed(() => store.state.app.homeListData.filter(item => !item.hideDefault))

        const requestHomeList = () => store.dispatch('app/requestHomeList')
        const setHomeTotalListData = (value) => store.commit('app/setHomeTotalListData', value)
        const setHomeListData = (value) => store.commit('app/setHomeListData', value)

        const pageSize = 20

        const showListData = computed(() => {
            const startNum = (currentPage.value - 1) * pageSize
            return homeListData.value.slice(startNum, startNum + pageSize)
        })

        const clickHandle = (params) => {
            navigator.clipboard.writeText(htmlContent[params.index].innerText)
            ElMessage({
                message: '复制成功！',
                customClass: 'el-message-wrap',
                type: 'success',
            })
        }

        const setItemRef = (el, index) => {
            if (el) {
                htmlContent[index] = el
            }
        }

        const refreshHandle = async () => {
            await requestHomeListHandle()
        }

        const requestFlag = async (loading) => {
            if (loading) isLoading.value = true
            const { data = [] } = await fetchFlag() || {}
            if (loading) isLoading.value = false
            const { message_status: msgStatus } = data[0] || {}
            const localStatus = localStorage.getItem('message-status')

            newStatus.value = msgStatus
            if (localStatus) {
                return localStatus < msgStatus
            } else {
                localStorage.setItem('message-status', msgStatus)
                return false
            }
        }

        const requestHomeListHandle = async () => {
            isLoading.value = true
            const flag = await requestHomeList()
            isLoading.value = false
            if (flag) {
                showRedPoint.value = false
                localStorage.setItem('message-status', newStatus.value)
            }
        }

        const pageChange = () =>{
            listWrap.value.scrollTop = 0
        }
        

        onMounted(async () => {
            let clearStatus = localStorage.getItem(`clear-status`)
            if (!clearStatus) {
                localStorage.clear()
                localStorage.setItem(`clear-status`, 1)
            }
            let localData = localStorage.getItem(`message-list`)
            localData = JSON.parse(localData) || {}
            const { version = '' } = window
            if (localData[version]) {
                setHomeTotalListData(localData[version])
                setHomeListData(localData[version])
                showRedPoint.value = await requestFlag(false)
            } else {
                showRedPoint.value = await requestFlag()
                requestHomeListHandle()
            }
        })

        return {
            currentPage,
            pageSize,
            listWrap,
            htmlContent,
            homeListData,
            showListData,
            isLoading,
            showRedPoint,
            clickHandle,
            setItemRef,
            refreshHandle,
            pageChange,
        }
    },
}
</script>

<style scoped>
.home-wrap {
    height: 100%;
    background: #f5f5f5;
}
.list-wrap {
    height: calc(100% - 48px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
.article-item-wrap {
    padding: 12px 12px 8px 12px;
    border-bottom: 1px solid #f0f2f5;
    background: #fff;
    transition: all .15s linear;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
}
.article-item-wrap:nth-of-type(2n + 1) {
    background: #f9fafc;
    cursor: pointer;
}
.article-item-wrap:hover {
    background: #f9fafc;
    cursor: pointer;
}
.article-item-wrap:hover .article-title {
    color: #fc5531;
}
.article-title {
    word-break: break-all;
    color: #555666;
    font-size: 14px;
    font-weight: 500;
    transition: all .15s linear;
    position: relative;
    width: 100%;
    padding-right: 12px;
}
.time-text {
    font-size: 12px;
    color: #999aaa;
    margin-top: 4px;
}
.list-uid {
    width: 38px;
    height: 38px;
    font-size: 12px;
    background: #e6e8ec;
    flex-shrink: 0;
}
.number-text {
    position: absolute;
    right: -50px;
    bottom: -7px;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    border: 1px solid #c2c2c2;
    color: #999aaa;
    transform: scale(0.6, 0.6);
}
</style>

<style>
.html-content img {
    max-width: 100%;
}
.el-dialog__body {
    padding: 0 16px 8px 16px!important;
}
.el-message-wrap {
    min-width: 260px;
}
</style>
