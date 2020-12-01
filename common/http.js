import Vue from 'vue'
import api from '@/common/api.js'
import flyio from '@/common/wx.js' // 引入flyio
import store from '../store/index.js'
let fly = new flyio
let FormateDate = function(date) {
	let o = {
		'yy': date.getFullYear(),
		'MM': date.getMonth() + 1,
		'dd': date.getDate(),
		'HH': date.getHours(),
		'mm': (() => {
			let mm = date.getMinutes()
			if (mm < 10) {
				mm = '0' + mm
			}
			return mm
		})(),
		'ss': date.getSeconds()
	};
	return o.yy + '-' + o.MM + '-' + o.dd + ' ' + o.HH + ':' + o.mm + ':' + o.ss;
};
//添加请求拦截器
fly.interceptors.request.use((request) => {
	//给所有请求添加自定义header
	uni.showLoading({
		mask: true,
		title: "加载中"
	})
	let _self = this
	const bxAuthTicket = uni.getStorageSync("bx_auth_ticket")
	if (api.onTicket) {
		request.headers["bx_auth_ticket"] = api.ticket
	} else {
		if (bxAuthTicket) {
			request.headers["bx_auth_ticket"] = bxAuthTicket
		}
	}
	const outTime = uni.getStorageSync("expire_timestamp") //过期时间
	const date = parseInt(new Date().getTime() / 1000)
})

//添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
	(res) => {
		uni.hideLoading()
		if (res.status !== 500) {
			if (res.data.resultCode === "0011") { //未登录 || !uni.getStorageSync("isLogin")
				console.log("登录状态", uni.getStorageSync("isLogin"))
				uni.setStorageSync('isLogin', false)
				if (res.request.headers.requrl) {
					console.log('请求失败:1:', res.request.headers.requrl)
					let requestUrl = decodeURIComponent(res.request.headers.requrl)
					if (requestUrl.indexOf("goodsDetail") !== -1) {
						//  过滤无效的url
						console.log('请求失败:2:', requestUrl)
						uni.setStorageSync("backUrl", requestUrl)
						store.commit('setBackUrl', requestUrl)
					} else {
						// uni.removeStorageSync("backUrl")
					}
					try {
						// 小程序不能关闭当前页跳转，
						// #ifdef H5
						if (!uni.getStorageSync("isLogin")) {
							uni.redirectTo({
								url: '/pages/public/accountExec/accountExec'
							})
						}
						// #endif
						// #ifdef MP-WEIXIN
						if (!uni.getStorageSync("isLogin")) {
							Vue.prototype.toLoginPage()
						}
						// #endif
					} catch (e) {
						console.error('请求失败', e)
					}
				} else {
					if (res.data.resultCode === "0011" || (res.data.resultCode === 'FAILURE' && !uni.getStorageSync('bx_auth_ticket'))) {
						uni.setStorageSync('isLogin', false)
						Vue.prototype.toLoginPage()
					} else {
						uni.showToast({
							title: res.data.resultMessage,
							icon: 'none'
						})
					}
				}

			} else if (res.data.resultCode === '0000' || res.data.resultCode === 'FAILURE') {
				// 没有访问权限
				if (res.data.resultMessage === '当前用户非微信用户' || res.data.resultMessage.indexOf('系统繁忙') != -1) {
					return
				}else{
					uni.showToast({
						title: res.data.resultMessage,
						icon: 'none'
					})
				}
			} else if (res.data.state === 'FAILURE') {
				uni.showToast({
					title: res.data.resultMessage,
					icon: 'none'
				})
			} else {
				uni.setStorageSync('isLogin', true)
			}
		} else {
			uni.showToast({
				title: '网络异常，暂时无法访问',
				duration: 2000
			});
		}
	},
	(err) => {
		//发生网络错误后会走到这里
		console.error(err)
		//return Promise.resolve("ssss")
	}
)
export default fly
