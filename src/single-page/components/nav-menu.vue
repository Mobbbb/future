<template>
    <div class="nav-wrap">
        <div class="page-nav-wrap" :style="pageNavWrapStyle">
            <el-menu    background-color="transparent" 
                        class="el-menu-nav" 
                        mode="horizontal" 
                        :default-active="activeNavIndex" 
                        router>
                <template v-for="item in navMenus">
                    <el-menu-item :index="item.path" v-if="item.meta.level === 0" :key="item.path">
                        {{item.meta.name}}
                    </el-menu-item>
                </template>
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
import { Avatar } from '@element-plus/icons-vue'

export default {
    name: 'nav-menu',
    components: {
        LoginDrawer,
        CloseSettingDrawer,
        Avatar,
    },
    data() {
        return {
            searchText: '',
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
    padding-right: 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
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
