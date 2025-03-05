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

export const dataRoute = {
    path: '/data',
    name: 'data',
    meta: {
        level: 0,
        name: '数据',
    },
    component: () => import('@/single-page/data/index.vue'),
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


export const allRoutes = [
    orderRoute,
    incomeRoute,
    dataRoute,
    toolsRoute,
    notFoundRoute,
    homeRoute,
]

export const administrator = '123456'
export const smurfUser = '654321'
export const whiteUserList = [smurfUser, administrator]
export const privateRoute = [homeRoute, incomeRoute]
export const privateRouteName = privateRoute.map(item => item.name)

export const routes = allRoutes.filter(item => !privateRouteName.includes(item.name))

allRoutes[0].path = initPath
