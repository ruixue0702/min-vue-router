import Vue from 'vue'
import Home from '../views/Home'
import VueRouter from './rxrouter.js'
const About = import(/* webpackChunkName: "about" */ '../views/About.vue')
const List = import(/* webpackChunkName: "list" */ '../views/List.vue')

// 引入插件
Vue.use(VueRouter)

// new VueRouter() 的时候，要接收一个配置项
export default new VueRouter({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/about',
            name: 'about',
            component: () => About
        },
        {
            path: '/list',
            name: 'list',
            component: () => List
        }
    ]
})
