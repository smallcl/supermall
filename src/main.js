import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import FastClick from 'fastclick'
import VueLazyload from "vue-lazyload";

import toast from 'components/common/toast'


Vue.config.productionTip = false
//添加事件总线
Vue.prototype.$bus = new Vue()
// 安装toast插件
Vue.use(toast)
//解决移动端300ms的延迟
FastClick.attach(document.body)

//使用懒加载的插件
Vue.use(VueLazyload,{
  loading: require('./assets/img/common/placeholder.png')
})
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
