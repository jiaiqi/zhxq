import Vue from 'vue'
import App from './App'
import store from './store/index.js'
import api from '@/common/api.js' // 导入api清单
import common from '@/common/common.js' // 公共方法
import bxUtil from '@/common/util.js' // 公共方法
import fly from '@/common/http.js' // fly 请求拦截
// #ifdef H5
import jwx from '@/common/jwx' // 微信JSAPI
Vue.prototype.$jwx = jwx
uni.setStorageSync('_appNo', api.appNo.wxh5)
// #endif
// #ifdef MP-WEIXIN
uni.setStorageSync('_appNo', api.appNo.wxmp)
// #endif
import Json from './Json' //测试用数据

import cuCustom from './colorui/components/cu-custom.vue'
Vue.component('cu-custom', cuCustom)

Vue.config.productionTip = false

Vue.prototype.$dev = true // 是否本地开发
Vue.use(common) // 老板公共方法,最终要抛弃
Vue.use(bxUtil) // 新版公共方法
Vue.prototype.$http = fly
Vue.prototype.$api = api


/**
 *  因工具函数属于公司资产, 所以直接在Vue实例挂载几个常用的函数
 *  所有测试用数据均存放于根目录json.js
 *  
 *  css部分使用了App.vue下的全局样式和iconfont图标，有需要图标库的可以留言。
 *  示例使用了uni.scss下的变量, 除变量外已尽量移除特有语法,可直接替换为其他预处理器使用
 */
const json = type => {
	//模拟异步请求数据
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(Json[type]);
		}, 500)
	})
}
const msg = (title, duration = 1500, mask = false, icon = 'none') => {
	//统一提示方便全局修改
	if (Boolean(title) === false) {
		return;
	}
	uni.showToast({
		title,
		duration,
		mask,
		icon
	});
}
const prePage = () => {
	// 分页
	let pages = getCurrentPages();
	let prePage = pages[pages.length - 2];
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}
// Vue.prototype.$api = api   // 最终api 与 静态 api 切换使用
Vue.prototype.$tapi = {
	msg,
	json,
	prePage
}; // 静态测试api

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})

app.$mount()
