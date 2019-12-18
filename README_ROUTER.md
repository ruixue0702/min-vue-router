# min-vue-router 插件
#### 插件: install 方法 -> Vue.use() 引入
#### 混入: install 方法内通过 Vue.mixin(beforeCreate(){}) 扩展组件  与 vue 生命周期中的 beforeCreate() 钩子混到一起执行
```js
// VueRouter.install
import Vue from 'vue'
VueRouter.install = funciton(Vue) {
    Vue.mixin({
        beforeCreate () {}
    })
}
```
#### router 插件仅在根组件配置一次 -> 配置到 vue 实例 并且 初始化 router 组件
```js
if (this.$options.router) {
    // 仅在根组件执行一次，因此要配置到 vue实例
    Vue.prototype.$router = this.$options.router
    // 初始化路由
    this.$options.router.init()
}
```
### 初始化 router 
- 监听 url 变化 bindEvents()
- 解析路由配置 {'/': Home} createRouteMap(this.$options)
- 实现全局组件 router-link router-view initComponent()

```js
// 定义 VueRouter 类
class VueRouter {
    init () {
        this.bindEvents() // 监听 url 变化
        this.createRouteMap(this.$options) // 解析路由配置
        this.initComponent() // 实现两个组件
    }
}
```
#### 监听 url 变化
- 监听 load 事件
- 监听 hashchange 事件 #/ 把 window 当前最新的地址赋值给 this.app.current(当前路由响应式)
```js
bindEvents () {
    // bind(this) 绑定 this 指向 Vue 实例
    // this.onHashChange: 这里的this 指向 window
    // 监听 load 事件
    window.addEventListener('load', this.onHashChange.bind(this))
    // 监听 hashchange
    window.addEventListener('hashchange', this.onHashChange.bind(this))
}
// 实现 onHashChange
// 把 window 当前最新的地址赋值给 this.app.current
onHashChange () {
    this.app.current = window.location.hash.slice(1) || '/'
}
```
#### 解析路由配置
- 实现 path 与 component 实现一对一的关系
createRouteMap (options) {
    options.routes.forEach(item => {
        this.routeMap[item.path] = item.component
    })
}
#### 实现两个组件 router-link router-view
- 利用 vue 的 Vue.component() 全局注册组件
- 这里要用 render() 不能用 template
- - 未来是要运行在 client -> client bundle 打包过程中的
- - 运行的界面没有编译器 这里不能写template 不能写字符串模板
- - render(h) 接收一个 h (createElement 函数) return 一个虚拟 DOM (VNode)
- - h(tag, data, children) tag 签名 data 配置项 children
- `<router-link to="">fff</router-link>`
- - props 传参数 to
- - 插槽 slots 显示 router-link 的内容
- `<router-view></router-view>` 
- - 无 props
- - 根据当前路径 找到匹配的组件 并渲染输出
- - 保留 this 指向当前 router 实例 -> render 应是一个箭头函数 
```js
initComponent () {
    // 利用 vue 的 Vue.component() 全局注册组件
    // <router-link to="">fff</router-link>
    Vue.component('router-link', {
        props: {
            to: String
        },
        // 这里要用 render() 不能用 template
        // 未来是要运行在 client -> client bundle 打包过程中的
        // 运行的界面没有编译器 这里不能写template 不能写字符串模板
        // render(h) 接收一个 h (createElement 函数) return 一个虚拟 DOM (VNode)
        render (h) {
            // h(tag, data, children) tag 签名 data 配置项 children
            // href
            return h(
                'a',
                {
                    attrs: {
                        href: '#' + this.to
                    }
                }, [
                    // 插槽 slots 显示 router-link 的内容
                    this.$slots.default
                ]
            )
        }
    })
    // <router-view></router-view>
    // 不需传参数 无 props
    Vue.component('router-view', {
        // 根据当前路径 找到匹配的组件 并渲染输出
        // router-view 中的 render 应是一个箭头函数 保留 this 指向当前 router 实例
        render: (h) => {
            const comp = this.routeMap[this.app.current]
            return h(comp)
        }
    })
}
```
#### VueRouter 接收构造参数
- 接收路由配置 `this.$options = options`
- 初始化 routeMap 
- 当前路由响应式 -> 当 this.app.current 改变时，重新渲染
- - 利用 vue 的数据响应式 -> 实现 url 变化后 组件重新渲染
- - vue-router 与 vue 强绑定 ->  只能用于 vue 与 react-router 不同
```js
constructor (options) {
    this.$options = options // 接收配置项 options
    this.routeMap = {} // 初始化 routeMap
    // 利用 vue 的数据响应式 -> 实现 url 变化后 组件重新渲染
    // vue-router 与 vue 强绑定 ->  只能用于 vue 与 react-router 不同
    // 当前路由响应式
    this.app = new Vue({
        data: {
            current: '/' // 默认值
        }
    })
}
```
#### 路由嵌套的功能未添加