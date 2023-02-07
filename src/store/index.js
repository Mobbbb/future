import { createStore } from 'vuex'
import app from './app'
import order from './order'

const store = createStore({
    // strict: process.env.NODE_ENV !== 'production',
    modules: {
        app,
        order,
    },
})

export default store
