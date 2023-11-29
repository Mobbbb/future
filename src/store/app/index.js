import { fetchInsertLog, fetchUserInfo, fetchListData } from '@/api'
import { whiteUserList, administrator, initPath } from '@/router/config'
import router, { clearPrivateRoute } from '@/router'
import { delCookie, getUrlParams, dateFormat, getCookie } from 'umob'

const app = {
    namespaced: true,
    state() {
        return {
            navHeight: 60,
            mainGap: [32, 0, 8, 0],
            mainWidth: {
                width: 0.62,
                minWidth: 332,
            },
            mediaCriticalValue: 544, // 响应式临界尺寸

            homeListData: [],
            homeTotalListData: [],

            activeNavIndex: initPath,
            activeIncomeTab: 'day',
            activeOrderTab: 'order',

            showLoginDrawerStatus: false,
            closeSettingShowStatus: false,
            switchUserFlag: false,

            goods: {
                type: '',
                lot: 1,
                pricePrev: 0,
                priceNext: 0,
            },
            USER_INFO: {}, // 用户信息
        }
    },
    getters: {
        mainStyle(state) {
            return {
                marginTop: `${state.mainGap[0]}px`,
                width: `${state.mainWidth.width * 100}%`,
                minWidth: `${state.mainWidth.minWidth}px`,
                height: `calc(100% - ${state.mainGap[0] + state.mainGap[2]}px)`,
            }
        },
        overMediaCritical(state) {
            return document.body.clientWidth < state.mediaCriticalValue
        },
        isLogin(state) {
            return !!state.USER_INFO.userId
        },
        isWhiteUser(state) {
            return whiteUserList.includes(state.USER_INFO.userId)
        },
        isAdministrator(state) {
            return administrator === state.USER_INFO.userId
        },
    },
    mutations: {
        setActiveIncomeTab(state, value) {
            state.activeIncomeTab = value
        },
        setActiveOrderTab(state, value) {
            state.activeOrderTab = value
        },
        setGoodsType(state, value) {
            state.goods.type = value
        },
        setGoodsLot(state, value) {
            state.goods.lot = value
        },
        setGoodsPricePrev(state, value) {
            state.goods.pricePrev = value
        },
        setGoodsPriceNext(state, value) {
            state.goods.priceNext = value
        },
        setHomeListData(state, value) {
            state.homeListData = value
        },
        setHomeTotalListData(state, value) {
            state.homeTotalListData = value
        },
        updateActiveNavIndex(state, value) {
            state.activeNavIndex = value
        },
        setLoginDrawerStatus(state, value) {
            state.showLoginDrawerStatus = value
        },
        setCloseSettingShowStatus(state, value) {
            state.closeSettingShowStatus = value
        },
        setInDayFirstLists(state, value) {
            state.USER_INFO.inDayFirstLists = value
        },
        SET_USER_INFO(state, value) {
            state.USER_INFO = value
        },
    },
    actions: {
        async INIT_USER({ commit, dispatch }) {
            const userId = getCookie('future-uid')
            if (userId) { // 获取用户相关信息
                commit('SET_USER_INFO', { userId })
                const res = await fetchUserInfo()
                const { data = {} } = res
                const { uid, avatar, account, inDayFirstLists } = data
                if (uid) {
                    commit('SET_USER_INFO', {
                        userId: uid,
                        avatar,
                        account,
                        inDayFirstLists: inDayFirstLists.split(',')
                    })
                    dispatch('updateLocalAvatar', {
                        uid,
                        avatar,
                    })
                }
            }
        },
        async fetchInsertLogHandle({}, routerName) {
            if (location.hostname !== 'localhost' && getUrlParams('log') !== '0') {
                await fetchInsertLog({
                    userAgent: navigator.userAgent,
                    createTime: dateFormat(new Date()),
                    routerName: routerName || router.currentRoute.value.path,
                })
            }
        },
        logoutAction({ commit, dispatch }) {
            dispatch('removeLoginStorage')
            commit('SET_USER_INFO', {})
            delCookie('future-uid')
            delCookie('future-token')
            clearPrivateRoute()
        },
        saveLoginStatus({}, data) {
            const { uid, avatar } = data
            let loginList = localStorage.getItem('future-login-list')
            if (loginList) {
                loginList = JSON.parse(loginList)
            } else {
                loginList = []
            }
            
            loginList = loginList.filter(item => item.uid !== uid)
            loginList.unshift({
                uid,
                avatar,
                token: getCookie('future-token'),
            })
            localStorage.setItem('future-login-list', JSON.stringify(loginList))
        },
        updateLocalAvatar({}, data) {
            const { uid, avatar } = data
            let loginList = localStorage.getItem('future-login-list')
            if (loginList) {
                loginList = JSON.parse(loginList)
            } else {
                loginList = []
            }
            for (let i = 0; i < loginList.length; i++) {
                if (loginList[i].uid === uid && loginList[i].avatar !== avatar) {
                    loginList[i].avatar = avatar
                    localStorage.setItem('future-login-list', JSON.stringify(loginList))
                    break
                }
            }
        },
        removeLoginStorage({ state }) {
            let loginList = localStorage.getItem('future-login-list')
            if (loginList) {
                loginList = JSON.parse(loginList)
            } else {
                loginList = []
            }
            loginList = loginList.filter(item => item.uid !== state.USER_INFO.userId)
            localStorage.setItem('future-login-list', JSON.stringify(loginList))
        },
        async requestHomeList({ commit }) {
            let result = await fetchListData()
            
            if (result instanceof Array && result.length) {
                result.sort((a, b) => b.id - a.id)
                result.forEach((item, index) => {
                    item.index = index
                    if (item.htmlContent.indexOf('qzone/em') > -1) {
                        const splitStr = item.htmlContent.split('<img src="')
                        item.htmlContent = splitStr.join('<img src="//qzonestyle.gtimg.cn')
                    }
                    if (item.htmlContent.indexOf('&nbsp;<br  />') > -1) {
                        item.htmlContent = item.htmlContent.replace('&nbsp;<br  />', '<br  />')
                    }
                    if (item.htmlContent.indexOf('<br  />&nbsp;') > -1) {
                        item.htmlContent = item.htmlContent.replace('<br  />&nbsp;', '<br  />')
                    }
                })
                commit('setHomeTotalListData', JSON.parse(JSON.stringify(result)))
                commit('setHomeListData', result)

                let obj = {}
                obj[window.version] = result
                localStorage.setItem('message-list', JSON.stringify(obj))
                return true
            }
            return false
        }
    },
}

export default app
