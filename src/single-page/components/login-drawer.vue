<template>
    <el-drawer v-model="drawerShowStatus" :append-to-body="true" direction="rtl" :size="250" custom-class="login-drawer">
        <template #title>
            <h4>登录</h4>
        </template>
        <template #default>
            <el-card style="margin-bottom: 12px;" v-if="loginList.length">
                <div v-for="item in loginList" :key="item.uid" class="login-list-wrap"
                    @click="switchUser(item, USER_INFO.userId === item.uid)">
                    <img class="avatar-image" :src="item.avatar" v-if="item.avatar" />
                    <el-icon class="avatar-icon" v-else><Avatar /></el-icon>
                    <span>{{item.uid}}</span>
                    <span class="login-checkbox" v-if="USER_INFO.userId === item.uid"></span>
                </div>
            </el-card>
            <el-card>
                <div class="input-item-wrap">
                    <span>账号：</span>
                    <el-input v-model="username" @keyup.enter="enterHandle" placeholder="请输入账号"></el-input>
                </div>
                <div class="input-item-wrap">
                    <span>密码：</span>
                    <el-input v-model="password" @keyup.enter="enterHandle" show-password placeholder="请输入密码"></el-input>
                </div>
                <div class="login-btn-wrap">
                    <gc-button type="active" @on-click="clickLogin" :width="70">登录</gc-button>
                </div>
            </el-card>
        </template>
    </el-drawer>
</template>

<script>
import { mapState, mapGetters ,mapMutations, mapActions } from 'vuex'
import { fetchUserLogin } from '@/api/index'
import { addPrivateRoute } from '@/router'
import { Avatar } from '@element-plus/icons-vue'
import GcButton from '@/components/gc-button.vue'
import { setCookie } from 'umob'

export default {
    name: 'login-drawer',
    components: {
        GcButton,
        Avatar,
    },
    data() {
        return {
            username: '',
            password: '',
            loginList: [],
        }
    },
    computed: {
        drawerShowStatus: {
            get() {
                return this.showLoginDrawerStatus
            },
            set(value) {
                this.setLoginDrawerStatus(value)
            },
        },
        ...mapState('app', [
            'showLoginDrawerStatus',
            'USER_INFO',
        ]),
        ...mapGetters('app', [
            'isWhiteUser',
            'isLogin',
        ]),
    },
    watch: {
        drawerShowStatus(value) {
            if (value) {
                let loginList = localStorage.getItem('future-login-list')
                if (loginList) {
                    this.loginList = JSON.parse(loginList)
                }
            }
        },
    },
    methods: {
        ...mapMutations('app', [
            'setLoginDrawerStatus',
        ]),
        ...mapActions('app', [
            'INIT_USER',
            'saveLoginStatus',
        ]),
        enterHandle() {
            this.clickLogin()
        },
        async clickLogin() {
            if (!this.username || !this.password) {
                this.$message.error('账号/密码不得为空')
            } else {
                const isLogin = this.isLogin
                const result = await fetchUserLogin(this.username, this.password)
                if (isLogin) {
                    this.afterSwitchLoginSubmit(result)
                } else {
                    this.afterLoginSubmit(result)
                }
            }
        },
        async afterSwitchLoginSubmit(result) {
            const { data = {}, success, msg } = result
            if (success) {
                this.$message.success(msg)
                this.saveLoginStatus(data)
                location.reload()
            }
        },
        async afterLoginSubmit(result) {
            const { data = {}, success, msg } = result
            if (success) {
                this.setLoginDrawerStatus(false)
                await this.INIT_USER()
                this.$message.success(msg)
                this.username = ''
                this.password = ''
                if (this.isWhiteUser) {
                    addPrivateRoute()
                }
                this.saveLoginStatus(data)
            }
        },
        async switchUser(data, isSelf) {
            if (isSelf) return
            const { uid, token } = data
            setCookie('future-token', token)
            setCookie('future-uid', uid)
            location.reload()
        },
    },
}
</script>

<style scoped>
.input-item-wrap {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
}
.input-item-wrap span {
    flex-shrink: 0;
}
.login-tips-wrap {
    margin-bottom: 12px;
    color: #bbb;
    font-size: 12px;
}
.login-btn-wrap {
    display: flex;
}
.register-btn-wrap {
    justify-content: space-between;
}
.back-btn {
    color: #00b5e5;
    cursor: pointer;
    font-size: 12px;
    height: 16px;
    line-height: 16px;
}
.back-btn:hover {
    text-decoration: underline;
}
.login-list-wrap {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebebeb;
    padding-bottom: 8px;
    justify-content: flex-start;
    margin-bottom: 12px;
    cursor: pointer;
}
.login-list-wrap:last-of-type {
    margin-bottom: 0;
}
.avatar-image {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #e7e7e7;
    margin-right: 12px;
    flex-shrink: 0;
}
.login-list-wrap span:first-of-type {
    flex: 1;
}
.login-checkbox {
    flex-shrink: 0;
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    width: 15px;
    height: 12px;
    transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46),outline .25s cubic-bezier(.71,-.46,.29,1.46);
    right: 0;
    bottom: 0;
    z-index: 1;
}
.login-checkbox::after {
    box-sizing: content-box;
    content: "";
    border: 2px solid #409eff;
    border-left: 0;
    border-top: 0;
    height: 8px;
    position: absolute;
    top: 0;
    left: 0;
    transform: rotate(45deg) scaleY(1);
    width: 3px;
    transition: transform .15s ease-in .05s;
    transform-origin: center;
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
    margin-right: 12px;
}
</style>

<style>
.el-drawer.login-drawer {
    background: rgb(245, 245, 245);
}
.login-drawer .el-drawer__header {
    margin-bottom: 20px;
    padding-bottom: 12px;
    padding-top: 12px;
    background: #fff;
}
.login-drawer .el-drawer__body {
    padding-top: 0;
}
</style>
