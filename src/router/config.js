export const initPath = '/'

export const homeRoute = {
    path: '/home',
    name: 'home',
    meta: {
        level: 0,
        name: '留言',
    },
    component: () => import('@/single-page/home/index.vue'),
}

export const incomeRoute = {
    path: '/income',
    name: 'income',
    meta: {
        level: 0,
        name: '收益',
    },
    component: () => import('@/single-page/income/index.vue'),
}

export const orderRoute = {
    path: '/order',
    name: 'order',
    meta: {
        level: 0,
        name: '交易',
    },
    component: () => import('@/single-page/order/index.vue'),
}

export const toolsRoute = {
    path: '/tools',
    name: 'tools',
    meta: {
        level: 0,
        name: '工具',
    },
    component: () => import('@/single-page/tools/index.vue'),
}

export const notFoundRoute = {
    path: '/:pathMatch(.*)',
    meta: {
        level: -1,
    },
    component: () => import('@/single-page/not-found-page/index.vue'),
}

export const routes = [
    orderRoute,
    incomeRoute,
    toolsRoute,
    notFoundRoute,
]

export const administrator = '123456'
export const whiteUserList = ['654321', administrator]
export const privateRoute = [homeRoute]
export const privateRouteName = privateRoute.map(item => item.name)

export const allRoutes = [...routes,  ...privateRoute]
allRoutes[0].path = initPath
