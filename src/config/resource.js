module.exports = {
    css: [
        // 'https://unpkg.com/element-plus@2.0.5/dist/index.css',
        'https://cdn.bootcdn.net/ajax/libs/element-plus/2.0.5/index.css',
    ],
    js: [
        // 'https://unpkg.com/vue@3.2.31/dist/vue.global.prod.js',
        // 'https://unpkg.com/element-plus@2.0.5/dist/index.full.min.js',
        'https://cdn.bootcdn.net/ajax/libs/vue/3.2.31/vue.global.prod.js',
        'https://cdn.bootcdn.net/ajax/libs/element-plus/2.0.5/index.full.min.js',
    ],
    publicPath: process.env.NODE_ENV === 'production' ? '/future' : '',
}
