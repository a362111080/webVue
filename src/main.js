import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入表格树
import TreeTable from 'vue-table-with-tree-grid'


//导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
import './plugins/element.js'
//配置请求的跟路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
//为请求头对象，添加token验证的Authorization字段
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem('token')
  //必须return  config
  return config;
})
// 挂在到Vue实例，后面可通过this调用
Vue.prototype.$http = axios

Vue.use(ElementUI);
Vue.config.productionTip = false
// 组件全局注册 表格树
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
