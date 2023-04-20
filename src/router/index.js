import { createRouter, createWebHashHistory } from 'vue-router'
import { routes, privateRoute, privateRouteName, initPath } from './config'
import store from '@/store'

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export const addPrivateRoute = (to) => {
    privateRoute.forEach(item => {
        if (!router.hasRoute(item.name)) {
            router.addRoute(item)
            if (to && router.currentRoute.value.fullPath === initPath) {
                router.replace(to.path)
            }
        }
    })
}

export const removePrivateRoute = () => {
    privateRoute.forEach(item => {
        if (router.hasRoute(item.name)) {
            router.removeRoute(item.name)
        }
    })
}

export const clearPrivateRoute = () => {
    removePrivateRoute()
    const currentName = router.currentRoute.value.name
    if (privateRouteName.includes(currentName) || !currentName) {
        router.push({
            name: routes[0].name,
        })
    }
}

router.beforeEach((to, from, next) => {
    store.commit('app/updateActiveNavIndex', to.path)
    if (store.getters['app/isWhiteUser']) {
        addPrivateRoute(to)
        next()
    } else {
        removePrivateRoute()
        if (privateRouteName.includes(to.name) || !to.name) {
            next({
                name: routes[0].name,
            })
        } else {
            next()
        }
    }
})

export default router
