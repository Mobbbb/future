<template>
    <div class="nav-wrap">
        <div class="page-nav-wrap" :style="pageNavWrapStyle">
            <el-menu    background-color="transparent" 
                        class="el-menu-nav" 
                        mode="horizontal" 
                        :default-active="activeNavIndex" 
                        :ellipsis="false"
                        router>
                <template v-for="item in navMenus">
                    <el-menu-item :index="item.path" v-if="item.meta.level === 0" :key="item.path">
                        {{item.meta.name}}
                    </el-menu-item>
                </template>
                <el-menu-item class="download-menu-item" index="download" disabled v-if="!overMediaCritical">
                    <el-popover placement="bottom" :width="300" trigger="hover">
                        <template #reference>
                            <div class="download-wrap" @click="clickDownload">
                                <GcDownload></GcDownload>
                                <span style="margin-left: 5px;">下载WIN客户端</span>
                                <span class="new-icon">新</span>
                            </div>
                        </template>
                        <div class="authority-wrap">
                            <div class="authority authority4 even_row" content-text="同步期货市场监控中心数据">同步期货市场监控中心数据</div>
                            <div class="authority authority2" content-text="实时语音播报">实时语音播报</div>
                            <div class="authority authority3 even_row" content-text="图标闪烁提示">图标闪烁提示</div>
                            <div class="authority authority5" content-text="邮件通知">邮件通知</div>
                            <div class="authority authority6 even_row" content-text="单边监控消息提醒">单边监控消息提醒</div>
                            <div class="authority authority7" content-text="套利监控消息提醒">套利监控消息提醒</div>
                        </div>
                    </el-popover>
                </el-menu-item>
            </el-menu>

            <div class="nav-search-input-wrap" v-show="isHomeRoute">
                <el-input v-model="searchText" 
                    @keydown.enter="searchHandle" 
                    @clear="searchHandle"
                    clearable
                    placeholder="请输入..."
                    class="search-input" />
                <el-button size="small" type="primary" style="height: 28px;border-radius: 0 3px 3px 0;" @click="searchHandle">搜索</el-button>
            </div>

            <div class="user-wrap">
                <el-dropdown v-if="isLogin" trigger="hover">
                    <img class="avatar-image" :src="USER_INFO.avatar" v-if="USER_INFO.avatar" />
                    <el-icon class="avatar-icon" v-else><Avatar /></el-icon>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item><span class="user-id-wrap">{{USER_INFO.userId}}</span></el-dropdown-item>
                            <el-dropdown-item @click="showCloseSetting">优先平今</el-dropdown-item>
                            <el-dropdown-item @click="changeUser">切换账号</el-dropdown-item>
                            <el-dropdown-item @click="clickLogout">退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <span class="login-btn" v-else @click="showLogin">登录</span>
            </div>
        </div>
        <LoginDrawer></LoginDrawer>
        <CloseSettingDrawer></CloseSettingDrawer>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { routes, allRoutes, homeRoute } from '@/router/config'
import LoginDrawer from './login-drawer.vue'
import CloseSettingDrawer from './close-setting-drawer.vue'
import GcDownload from '@/components/gc-download.vue'
import { Avatar } from '@element-plus/icons-vue'
import { getNewAppVersion } from '@/api'

export default {
    name: 'nav-menu',
    components: {
        LoginDrawer,
        CloseSettingDrawer,
        Avatar,
        GcDownload,
    },
    data() {
        return {
            searchText: '',
            downloadLink: '',
        }
    },
    computed: {
        ...mapState('app', [
            'mainWidth',
            'navHeight',
            'activeNavIndex',
            'USER_INFO',
        ]),
        ...mapGetters('app', [
            'isLogin',
            'isWhiteUser',
            'overMediaCritical',
        ]),
        pageNavWrapStyle() {
            return {
                width: `${this.mainWidth.width * 100}%`,
                height: `${this.navHeight}px`,
            }
        },
        navMenus() {
            if (this.isLogin && this.isWhiteUser) {
                return allRoutes
            } else {
                return routes
            }
        },
        isHomeRoute() {
            return this.$route.name === homeRoute.name
        },
    },
    methods: {
        ...mapMutations('app', [
            'setLoginDrawerStatus',
            'setCloseSettingShowStatus',
        ]),
        ...mapActions('app', [
            'logoutAction',
        ]),
        showLogin() {
            this.setLoginDrawerStatus(true)
        },
        showCloseSetting() {
            this.setCloseSettingShowStatus(true)
        },
        clickLogout() {
            this.logoutAction()
        },
        changeUser() {
            this.setLoginDrawerStatus(true)
        },
        searchHandle() {
            this.$emit('on-search', this.searchText)
        },
        async getNewAppVersionHandle() {
            const response = await getNewAppVersion()
            const data = response.data || []
            const newItem = data[0] || {}
            this.downloadLink = newItem.href || ''
        },
        clickDownload() {
            window.open(this.downloadLink)
        },
    },
    mounted() {
        this.getNewAppVersionHandle()
    },
}
</script>

<style scoped>
.nav-wrap {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 100;
    background: white;
    box-sizing: border-box;
    box-shadow: 0 2px 8px 1px rgba(100, 100, 100, 0.1);
}
.page-nav-wrap {
    position: relative;
    overflow: hidden;
    margin: 0 auto;
}
.user-wrap {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    padding: 0 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    background-color: white;
}
.avatar-image {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #e7e7e7;
}
.avatar-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #e7e7e7;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b4b6b9;
}
.login-btn {
    height: 24px;
    width: 24px;
    line-height: 22px;
    border-radius: 50%;
    color: #fb7299;
    font-size: 12px;
    background: #e7e7e7;
    transform: scale(0.8);
    padding: 4px;
    margin-right: -2px;
    margin-top: -2px;
    white-space: nowrap;
}
.nav-search-input-wrap {
    position: absolute;
    display: flex;
    width: 120px;
    height: 32px;
    line-height: 28px;
    right: 48px;
    top: 14px;
}
.user-id-wrap {
    display: block;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.download-wrap {
    display: flex;
    align-items: center;
    width: 200px;
}
.download-menu-item.is-disabled {
    cursor: pointer;
    opacity: 1;
    color: #303133;
}
.new-icon {
    display: block;
    width: 34px;
    height: 28px;
    line-height: 28px;
    font-size: 18px;
    border-radius: 28px;
    text-align: center;
    background: #f85a54;
    color: white;
    transform: scale(0.6);
}
.authority-wrap {
	border-radius: 2px;
	width: 100%;
	position: relative;
	text-align: center;
	border: 4px solid;
	border-image: linear-gradient(317deg, #d89c75, #efdfd0) 4 4;
	background: #746c63;
	box-sizing: border-box;
}
.authority {
	position: relative;
	padding: 14px 0;
	height: 30px;
	line-height: 30px;
	font-size: 16px;
	text-align: center;
	color: #fff;
}
.authority::before {
    content: attr(content-text);
    display: inline-block;
    position: absolute;
    left: 50%;
    white-space: nowrap;
    transform: translate(-50%);
    color: #d89c75;
    z-index: 2;
    mask-image: -webkit-gradient(linear, 0 0, right 0, from(transparent), to(#d89c75));
}
.even_row {
	background: rgba(0, 0, 0, .1);
}
</style>

<style>
.el-menu-nav {
    border-bottom: none!important;
}
.el-menu-nav > .is-active{
    border-color: #a5d1ff!important;
    background-color: transparent!important;
}
.el-menu-nav > .el-menu-item:hover{
    background-color: transparent!important;
}
.nav-search-input-wrap .el-input__inner {
    height: 28px;
    border-radius: 4px 0 0 4px;
}
.nav-search-input-wrap .el-input__suffix {
    height: 28px;
}
.nav-search-input-wrap .el-input--suffix .el-input__inner {
    padding: 0 11px;
}
</style>
