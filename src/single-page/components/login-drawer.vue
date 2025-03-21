<template>
    <el-drawer v-model="drawerShowStatus" :append-to-body="true" direction="rtl" :size="overMediaCritical ? 250 : 320" custom-class="login-drawer">
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
                <div class="login-title-wrap" v-if="!overMediaCritical">
                    <div :class="quickLogin ? 'active-title' : ''" @click="quickLogin = true">微信登录</div>
                    <div :class="quickLogin ? '' : 'active-title'" @click="quickLogin = false">密码登录</div>
                </div>
                <div v-if="quickLogin && !overMediaCritical" class="login-qrcode-wrap">
                    <div class="loading-wrap" v-if="qrCodeStatus === 0">
                        <img :src="qrCodeSrc" class="login-qrcode" v-if="qrCodeSrc">
                        <img src="/resource/icon/code-loading.gif" class="login-qrcode loading-qrcode" v-else>
                    </div>
                    <div class="fail-qrcode-wrap" @click="refreshCode" v-else-if="qrCodeStatus === 2">
                        <el-icon :size="60"><Refresh /></el-icon>
                        <div>二维码失效 点击重试</div>
                    </div>
                    <div v-else style="position: relative;">
                        <div class="loading-wrap">
                            <img :src="qrCodeSrc" class="login-qrcode" v-if="qrCodeSrc">
                            <img src="/resource/icon/code-loading.gif" class="login-qrcode loading-qrcode" v-else>
                        </div>
                        <div class="scan-success-wrap" v-if="qrCodeStatus === 4">
                            <span>此微信未绑定账号</span>
                            <span>请使用密码登录</span>
                        </div>
                        <div class="scan-success-wrap" v-else>
                            <span>扫描成功</span>
                            <span>请在手机上确认授权登录</span>
                        </div>
                    </div>
                    <div class="qrcode-title">打开微信扫一扫，快捷登录</div>
                </div>
                <div v-else>
                    <div class="input-item-wrap" style="margin-top: 4px;">
                        <span class="input-text">账 号：</span>
                        <el-input v-model="username" @keyup.enter="enterHandle" placeholder="请输入账号"></el-input>
                    </div>
                    <div class="input-item-wrap">
                        <span class="input-text">密 码：</span>
                        <el-input v-model="password" @keyup.enter="enterHandle" type="password" placeholder="请输入密码"></el-input>
                    </div>
                    <div class="input-item-wrap" :style="captchaWrapStyle">
                        <span class="input-text">验证码：</span>
                        <el-input v-model="captcha" @keyup.enter="enterHandle" placeholder="验证码" style="width: calc(100% - 55px);"></el-input>
                        <img :src="`${baseUrl}${prefixApi}/common/captcha?t=${captchaTime}`" @click="captchaTime = (new Date).getTime()" :style="captchaStyle" class="captcha-image">
                    </div>
                    <div class="login-btn-wrap">
                        <gc-button type="active" @on-click="clickLogin" style="width: 100%;height: 32px;">登录</gc-button>
                    </div>
                </div>
                <div class="login-btn-tips" v-if="!quickLogin">
                    <QuestionTips :style="{ color: '#bbb', fontSize: '14px', marginRight: '6px' }">
                        <img src="/resource/icon/small-program-qrcode.jpg" width="150" height="150">
                        <template #content>
                            <span class="login-text">{{ overMediaCritical ? '前往微信小程序注册' : '没有账号？去微信小程序注册一个 !' }}</span>
                        </template>
                    </QuestionTips>
                </div>
            </el-card>
        </template>
    </el-drawer>
</template>

<script>
import { mapState, mapGetters ,mapMutations, mapActions } from 'vuex'
import { fetchUserLogin } from '@/api/index'
import { addPrivateRoute } from '@/router'
import { Avatar, Refresh } from '@element-plus/icons-vue'
import GcButton from '@/components/gc-button.vue'
import QuestionTips from '@/single-page/components/question-tips.vue'
import { setCookie } from 'umob'
import { prefixApi, baseUrl } from '@/libs/api.request'
import { getQrCode } from './ws'

export default {
    name: 'login-drawer',
    components: {
        GcButton,
        Avatar,
        QuestionTips,
        Refresh,
    },
    data() {
        return {
            username: '',
            password: '',
            captcha: '',
            loginList: [],
            captchaTime: (new Date).getTime(),
            prefixApi,
            baseUrl,
            quickLogin: true,
            qrCodeSrc: '',
            qrCodeStatus: 0,
            ws: null,
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
            'overMediaCritical',
        ]),
        captchaStyle() {
            return this.overMediaCritical ? {
                margin: '8px 0 0 0',
                width: '112px',
                height: '38px',
            } : {}
        },
        captchaWrapStyle() {
            return this.overMediaCritical ? {
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                marginBottom: '16px',
            } : {}
        },
    },
    watch: {
        drawerShowStatus(value) {
            if (value) {
                let loginList = localStorage.getItem('future-login-list')
                if (loginList) {
                    this.loginList = JSON.parse(loginList)
                }
                this.getQrCodeHandle()
            } else {
                if (this.ws) this.ws.close(1000, 'client')
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
            } else if (!this.captcha) {
                this.$message.error('验证码不得为空')
            } else {
                const isLogin = this.isLogin
                const result = await fetchUserLogin(this.username, this.password, this.captcha)
                if (isLogin) {
                    this.afterSwitchLoginSubmit(result)
                } else {
                    this.afterLoginSubmit(result)
                }
                if (!result.success) { // 刷新验证码
                    this.captchaTime = (new Date).getTime()
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
                this.captcha = ''
                this.captchaTime = (new Date).getTime()
                if (this.isWhiteUser) {
                    addPrivateRoute()
                }
                this.saveLoginStatus(data)
            }
        },
        async switchUser(data, isSelf) {
            if (isSelf) return
            const { uid, token } = data
            this.cookieLogin(uid, token)
        },
        cookieLogin(uid, token) {
            if (uid && token) {
                setCookie('future-token', token)
                setCookie('future-uid', uid)
                location.reload()
            }
        },
        getQrCodeHandle() {
            this.qrCodeSrc = ''
            this.qrCodeStatus = 0
            this.ws = getQrCode({
                onmessage: (res) => {
                    const { data, status, msg } = res
                    const { image, token, uid } = data
                    if (image) {
                        this.qrCodeSrc = image
                    }
                    this.qrCodeStatus = status
                    if (this.qrCodeStatus === 3) { // 登录成功
                        this.cookieLogin(uid, token)
                    }
                },
                onclose: (reason) => {
                    this.ws = null
                    if (this.qrCodeStatus !== 3 || this.qrCodeStatus !== 4) { // 未到最终阶段，断开连接
                        this.qrCodeStatus = 2
                    }
                },
            })
        },
        refreshCode() {
            if (this.ws) {
                this.ws.send('REFRESH_CODE')
            } else {
                this.getQrCodeHandle()
            }
        },
    },
}
</script>

<style scoped>
.input-item-wrap {
    margin-bottom: 24px;
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
.input-text {
    flex-shrink: 0;
    width: 55px;
    white-space: nowrap;
}
.login-btn-tips {
    font-size: 12px;
    display: flex;
    justify-content: right;
    margin-top: 12px;
}
.login-btn-tips span {
    color: #628dd1;
    cursor: pointer;
}
.login-text {
    height: 17px;
    line-height: 17px;
}
.captcha-image {
    width: 100px;
    height: 32px;
    margin-left: 4px;
    flex-shrink: 0;
}
.login-title-wrap {
    color: #999aaa;
    display: flex;
    margin-top: 20px;
    margin-bottom: 24px;
}
.login-title-wrap div {
    width: 120px;
    font-size: 16px;
    height: 22px;
    line-height: 16px;
    position: relative;
    text-align: center;
    cursor: pointer;
    font-weight: 600;
}
.login-title-wrap .active-title {
    color: #222226;
}
.login-title-wrap .active-title::after {
    content: "";
    display: block;
    width: 24px;
    height: 2px;
    background: #222226;
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
}
.login-qrcode-wrap {
    text-align: center;
    font-size: 12px;
    color: #555666;
}
.login-qrcode {
    width: 180px;
    height: 180px;
}
.loading-wrap {
    display: inline-flex;
    width: 180px;
    height: 180px;
    background-color: #f5f6f7;
    text-align: center;
    align-items: center;
    justify-content: center;
}
.loading-qrcode {
    width: 57px;
    height: 57px;
}
.scan-success-wrap {
    position: absolute;
    width: 180px;
    height: 180px;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    background-color: rgba(0, 0, 0, .8);
    color: #fff;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
.scan-success-wrap span {
    margin-bottom: 12px;
}
.qrcode-title {
    margin-top: 18px;
    line-height: 20px;
}
.fail-qrcode-wrap {
    color: #fff;
    font-size: 12px;
    text-align: center;
    width: 180px;
    height: 180px;
    display: inline-block;
    background-color: rgba(0, 0, 0, .8);
    padding-top: 45px;
    box-sizing: border-box;
    cursor: pointer;
}
.fail-qrcode-wrap > div {
    margin-top: 24px;
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
