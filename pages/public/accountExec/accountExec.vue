<template>
	<view class="authorization">
		<view class="container"
			v-if="isBindUser || client_env === 'web' || client_env === 'app' || client_env === 'wxmp'">
			<view class="right-top-sign"></view>
			<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
			<view class="wrapper">
				<!-- <view class="left-top-sign">LOGIN</view> -->
				<view class="welcome">
					欢迎回来！
					<!-- #ifdef MP -->
					<!-- <view v-if="client_env === 'wxmp'">点击登录按钮</view> -->
					<!-- #endif -->
				</view>
				<!-- #ifndef MP -->
				<!-- 非小程序 -->
				<view class="input-content" v-if="client_env === 'web' || client_env === 'app' || isShowUserLogin">
					<view class="input-item">
						<text class="tit">帐号</text>
						<input type="text" v-model="user.user_no" placeholder="请输入帐号" maxlength="999" data-key="mobile"
							@input="inputChange" />
					</view>
					<view class="input-item">
						<text class="tit">密码</text>
						<input type="mobile" v-model="user.pwd" placeholder="请输入密码" placeholder-class="input-empty"
							maxlength="20" password data-key="password" @input="inputChange" @confirm="userLogined" />
					</view>
				</view>
				<button
					v-if="(client_env === 'web' || client_env === 'app' || client_env === 'wxh5') && isShowUserLogin"
					class="confirm-btn bg-gradual-green text-green" @click="userLogined">
					{{ isBindUser ? '提交绑定' : '登录' }}
				</button>
				<button
					v-if="(client_env === 'web' || client_env === 'app' || client_env === 'wxh5') && isShowUserLogin"
					class="confirm-btn bg-gradual-orange text-green" @click="toBack">
					暂不，继续使用
				</button>
				<!-- #endif -->
				<!-- #ifdef MP-WEIXIN -->
				<view class="input-content" v-if="isBindUser">
					<view class="input-item">
						<text class="tit">帐号</text>
						<input type="text" v-model="user.user_no" placeholder="请输入帐号" maxlength="999" data-key="mobile"
							@input="inputChange" />
					</view>
					<view class="input-item">
						<text class="tit">密码</text>
						<input type="mobile" v-model="user.pwd" placeholder="请输入密码" placeholder-class="input-empty"
							maxlength="20" password data-key="password" @input="inputChange" @confirm="userLogined" />
					</view>
				</view>
				<button v-if="isBindUser" class="confirm-btn bg-blue" @click="userLogined('login')">
					立即登录
				</button>
				<!-- 		<button v-if="isBindUser" class="confirm-btn bg-green" type="primary" @click="userLogined">
					绑定微信
				</button> -->
				<button v-if="isBindUser" class="confirm-btn bg-grey" @click="toBack">
					暂不登录
				</button>
				<!-- 	<button class="confirm-btn bg-gray text-green" lang="zh_CN" type="primary" open-type="getUserInfo"
					@getuserinfo="saveWxUser" :withCredentials="false" :disabled="disabled" v-if="!isBindUser">
					授权登录
				</button>
				<button class="confirm-btn bg-grey text-black" type="default" @tap="navBack" :disabled="false"
					v-if="!isBindUser">暂不授权</button> -->
				<!-- #endif -->
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		// 账号授权页面
		name: 'login-auth',
		data() {
			return {
				disabled: !this.isWeixinClient(),
				backUrl: '',
				user: {
					user_no: '',
					pwd: ''
				},
				isShowUserLogin: true,
				client_env: uni.getStorageSync('client_env'),
				isThirdParty: uni.getStorageSync('isThirdParty'), // 是否需要第三方认证
				isBindUser: false,
				setshopData: false
			};
		},
		computed: {
			...mapGetters(['wxUserInfo', 'loginUserInfo', 'staffInfo']),
		},
		onLoad(option) {
			if (option.isBind) {
				this.isBindUser = true
				let self = this;
				// 根据登录状态跳转
				if (uni.getStorageSync('isLogin') && uni.getStorageSync('login_user_info')) {
					console.log('不进行初始化授权', uni.getStorageSync('isLogin'));
					// self.initLogin();
				} else {
					console.log('进行初始化授权', uni.getStorageSync('isLogin'));
					self.initLogin();
				}
			}
		},
		beforeDestroy() {
			uni.$emit('isToLogin', false);
		},
		methods: {
			getPhoneNumber(e) {
				console.log(e, '手机号：');
				console.log(e.detail.errMsg);
				console.log(e.detail.iv);
				console.log(e.detail.encryptedData);
			},
			toBack() {
				if (uni.getStorageSync('isLogin')) {
					if (uni.getStorageSync('backUrl')) {
						uni.redirectTo({
							url: uni.getStorageSync('backUrl')
						});
					} else {
						uni.redirectTo({
							url: this.$api.homePath
						});
					}
				} else {
					// this.initLogin();
				}
			},
			navBack() {
				let self = this;
				let pageInfo = getCurrentPages();
				uni.setStorageSync('isToLogin', false);
				uni
					.navigateBack({
						animationDuration: 200
					})
					.then()
					.catch(e => {
						uni.navigateTo({
							url: self.$api.homePath
						});
					});
			},
			inputChange(e) {
				// console.log(e)
			},
			initLogin() {
				// 是否进入 认证和 免登录
				let that = this;
				let code = null;
				// 公众号环境
				// #ifdef H5
				code = this.$route.query.code || this.$route.params.code;
				// #endif
				let isLogin = uni.getStorageSync('isLogin');
				console.log('是否绑定账号:', isLogin);
				let isWeixinClient = this.isWeixinClient();
				console.log('是否微信环境', isWeixinClient);
				if (!isLogin) {
					if (isWeixinClient) {
						//微信环境(小程序或者公众号)
						// #ifdef H5
						if (code) {
							// 已经得到code,进行验证登录
							this.saveWxUser(); // 已认证去免登录
						} else if (!code) {
							//公众号 未授权 -> 获取授权
							console.log('未发现code,尝试获取重定向链接');
							that.getAuthorized(); // 未认证去认证
						}
						// #endif
						// #ifdef MP-WEIXIN
						// this.saveWxUser(); //调登录接口
						// #endif
					} else if (!isWeixinClient) {
						// 非微信环境(H5或APP)
						uni.showToast({
							title: '请在微信中访问此页面',
							icon: 'none',
							duration: 3000
						});
					}
				} else {
					// alert('登录成功回调')
					// that.loginNavUrl(); // 登录成功回调
				}
			},
			async getAuthorized() {
				let self = this;
				// 公众号环境获取回调地址(在回调地址中获取code)
				let url = self.getServiceUrl('wx', 'srvwx_public_page_authorization', 'operate');
				let appNo = null;
				if (uni.getStorageSync('_appNo')) {
					appNo = uni.getStorageSync('_appNo');
				} else {
					appNo = self.$api.appNo.wxh5;
				}
				console.log('准备授权', appNo);
				let req = [{
					data: [{
						app_no: appNo,
						redirect_uri: self.$api.frontEndAddress
					}],
					serviceName: 'srvwx_public_page_authorization'
				}];
				let burl = uni.getStorageSync('backUrl');
				if (this.isInvalid(this.$api.weChatAuthorPath)) {
					req[0].data[0].redirect_uri = self.$api.frontEndAddress + this.$api.weChatAuthorPath;
				}
				this.$http.post(url, req).then(response => {
					console.log('授权 response:', response, JSON.stringify(response.data));
					// uni.showModal({
					// 	content: "请求完成"+ JSON.stringify(response.data),
					// 	showCancel: false
					// });
					if (response.data.response[0].response && response.data.response[0].response.authUrl) {
						uni.showToast({
							title: '授权成功',
							icon: 'none'
						});
						console.log('redirctUrl:', response.data.response[0].response.authUrl);
						// #ifdef H5
						window.location.href = response.data.response[0].response.authUrl;
						// #endif
					} else {
						uni.showToast({
							title: response.data.resultMessage,
							icon: 'none'
						});
					}
				});
			},
			async getWxUserInfo() {
				//获取微信用户头像昵称
				let optionType = 'select';
				let srv = 'srvwx_basic_user_info_select';
				let app = 'wx';
				let req = {
					serviceName: 'srvwx_basic_user_info_select',
					colNames: ['*'],
					condition: [{
						colName: 'app_no',
						ruleType: 'eq',
						value: uni.getStorageSync('_appNo')
					}]
				};
				let res = await this.onRequest(optionType, srv, req, app);
				if (res.data.state === 'SUCCESS') {
					let wxUser = res.data.data[0];
					uni.setStorageSync('backWxUserInfo', wxUser);
					uni.setStorageSync('wxuserinfo', wxUser);
				}
			},
			accountLogin() {

			},
			saveWxUser() {
				// 静默登录(验证登录)
				let that = this;
				// #ifdef MP-WEIXIN
				wx.login({
					// 获取小程序code
					success(res) {
						if (res.code) {
							//验证登录
							let url = that.$api.verifyLogin.url;
							let req = [{
								data: [{
									code: res.code,
									app_no: that.$api.appNo.wxmp
								}],
								serviceName: 'srvwx_app_login_verify'
							}];
							that.$http.post(url, req).then(response => {
								if (response.data.resultCode === 'SUCCESS') {
									uni.hideLoading();
									console.log('授权成功', response);
									let resData = response.data.response[0].response;
									let loginMsg = {
										bx_auth_ticket: resData.bx_auth_ticket,
										expire_time: resData.expire_time
									};
									let expire_timestamp = parseInt(new Date().getTime() / 1000) +
										loginMsg.expire_time; //过期时间的时间戳(秒)

									uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
									uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
									uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
									if (resData.login_user_info.user_no) {
										uni.setStorageSync('login_user_info', resData.login_user_info);
										that.$store.commit('setLoginUser', resData.login_user_info);
										top.user = resData.login_user_info;
										console.log('resData.login_user_info', resData
											.login_user_info);
									}
									if (resData.login_user_info.data) {
										uni.setStorageSync('visiter_user_info', resData.login_user_info
											.data[0]);
										// this.$store.commit('setOpenid', resData.login_user_info.data[0].openid);
									}
									uni.setStorageSync('isLogin', true);
									console.log('that.backUrl', that.backUrl);

									// 获取用户微信信息
									that.getUserInfo();
									uni.redirectTo({
										url: that.$api.homePath
									});
								} else if (response.data.resultCode === 'FAILURE') {
									uni.setStorageSync('isLogin', false);
									uni.showToast({
										title: response.data.resultMessage
									});
								}
							});
						} else {
							uni.setStorageSync('isLogin', false); // 登录状态
							console.log('登录失败！' + res.errMsg);
						}
					}
				});
				// #endif
				const isWeixinClient = that.isWeixinClient();
				if (isWeixinClient) {
					const url = this.getServiceUrl('wx', 'srvwx_app_login_verify', 'operate');
					// #ifdef MP-WEIXIN

					return
					// #endif
					// #ifdef H5
					// 公众号环境
					let appNo = null;
					if (uni.getStorageSync('_appNo')) {
						appNo = uni.getStorageSync('_appNo');
					} else {
						appNo = that.$api.appNo.wxh5;
					}
					uni.showLoading({
						title: '授权登录中'
					});
					return;
					let req = [{
						data: [{
							code: that.$route.query.code,
							app_no: appNo
						}],
						serviceName: 'srvwx_app_login_verify'
					}];
					let backUrl = uni.getStorageSync('backUrl');
					console.log('回调页面', window.location, backUrl);
					if (backUrl.indexOf('goodsDetail') !== -1) {
						req[0].data[0]['call_params'] = backUrl;
					}
					if (uni.getStorageSync('upUser')) {
						let user = {
							type: 'shop',
							up_user_no: uni.getStorageSync('upUser'),
							join_type: '微信',
							shop_no: uni.getStorageSync('shopNo')
						};
						req[0].data[0]['shop_user'] = user;
					}
					that.$http.post(url, req).then(response => {
						if (response.data.resultCode === 'SUCCESS' && response.data.response[0].response) {
							uni.showToast({
								title: '登录成功'
							});
							console.log('授权成功', response);
							let resData = response.data.response[0].response;
							let loginMsg = {
								bx_auth_ticket: resData.bx_auth_ticket,
								expire_time: resData.expire_time
							};
							uni.setStorageSync('isLogin', true);
							that.getWxUserInfo();
							console.log('登录成功' + uni.getStorageSync('isLogin') + resData);
							// alert('登录成功'+uni.getStorageSync('isLogin'), resData);
							let expire_timestamp = parseInt(new Date().getTime() / 1000) + loginMsg
								.expire_time; //过期时间的时间戳(秒)
							uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
							// let expire_timestamp = parseInt(new Date().getTime() / 1000) + 10; //过期时间的时间戳(秒)
							// uni.setStorageSync('expire_time', 10); // 有效时间
							console.log(loginMsg.expire_time + '***' + resData.expire_time + '有效时间');
							uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
							uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间

							if (resData.login_user_info && resData.login_user_info.user_no) {
								uni.setStorageSync('login_user_info', resData.login_user_info);
								that.$store.commit('setLoginUser', resData.login_user_info);
								console.log('resData.login_user_info', resData.login_user_info);
								if (resData.login_user_info.roles) {
									uni.setStorageSync('roles', resData.login_user_info.roles);
								}
							}
							if (resData.login_user_info && resData.login_user_info.data) {
								uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
								that.$store.commit('setVisitorInfo', resData.login_user_info.data[0]);
							}
							uni.navigateBack({
								delta: 1
							});
						} else {
							uni.setStorageSync('isLogin', false);
							console.log('授权失败');
						}
					});

					// #endif
				}
			},
			getUserInfo: function(loginType, cb) {
				let self = this;
				uni.hideLoading();
				// wx.login({
				// success: function() {
				wx.getUserInfo({
					success: function(res) {
						uni.setStorageSync('wxuserinfo', res.userInfo);
						self.getWxUserInfo(res.userInfo);
						uni.setStorageSync('isAuth', true);
						if (uni.getStorageSync('isAuth') === true) {
							self.loginNavUrl(); // 登录成功回调
						} else {
							uni.showToast({
								title: '请点击授权按钮进行授权'
							});
						}
					},
					fail: function() {
						uni.setStorageSync('isAuth', false);
						uni.showToast({
							title: '请点击授权按钮进行授权',
							icon: 'none'
						});
					}
				});
			},

			async userLogined(e) {
				let that = this;
				let url = that.getServiceUrl('sso', 'srvuser_login', 'operate');
				let req = [{
					serviceName: 'srvuser_login',
					data: [that.user]
				}];
				if (that.isBindUser && e !== 'login') {
					url = that.$api.bindWxUser;
					req = [{
						serviceName: 'srvwx_user_bind',
						data: [that.user]
					}];
				}
				if (that.isInvalid(that.user.user_no) && that.isInvalid(this.user.pwd)) {
					let response = await that.$http.post(url, req);
					console.log('srvuser_login', response);
					if (response.data.state === 'SUCCESS' && response.data.response[0].response) {
						let res = response.data.response[0].response;
						let expire_timestamp = parseInt(new Date().getTime() / 1000) + res.expire_time; //过期时间的时间戳(秒)
						uni.setStorageSync('bx_auth_ticket', res.bx_auth_ticket);
						uni.setStorageSync('expire_time', res.expire_time); // 有效时间
						uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
						if (res.login_user_info.user_no) {
							uni.setStorageSync('login_user_info', res.login_user_info);
							that.$store.commit('setLoginUser', res.login_user_info);
							console.log('res.login_user_info', res.login_user_info);
							if (res.login_user_info.roles) {
								uni.setStorageSync('roles', res.login_user_info.roles);
							}
						}
						if (res.login_user_info.data) {
							uni.setStorageSync('visiter_user_info', res.login_user_info.data[0]);
							that.$store.commit('setVisitorInfo', res.login_user_info.data[0]);
						}
						uni.setStorageSync('isLogin', true);
						uni.showModal({
							title: '提示',
							content: '操作成功,即将返回首页',
							showCancel: false,
							success(res) {
								uni.redirectTo({
									url: '/pages/public/home/home'
								})
							}
						})
					}
				} else {
					this.user.pwd = '';
					uni.showToast({
						title: '请输入有效的帐号密码',
						duration: 2000,
						icon: 'none'
					});
				}
			},
			loginNavUrl: function(e) {
				console.log('登录成功准备跳转');
				let self = this;
				let isLogin = uni.getStorageSync('isLogin');
				// 根据是否小程序环境跳转
				// #ifdef MP-WEIXIN
				let routeIndexs = getCurrentPages();
				if (routeIndexs.length > 0) {
					uni.navigateBack({
						delta: 1
					});
				} else {
					uni.reLaunch({
						url: self.$api.homePath,
						success: function() {
							uni.setStorageSync('isLogin', true);
						}
					});
				}
				// #endif
				// #ifdef H5
				if (self.getBackUrl()) {
					console.log('that.getBackUrl() 02', self.getBackUrl());
					uni.hideToast();
					uni.hideLoading();
					uni.reLaunch({
						url: self.getBackUrl(),
						success: function() {
							uni.setStorageSync('isLogin', true);
							console.log("uni.getStorageSync('isLogin')", uni.getStorageSync('backUrl'));
							uni.removeStorageSync('backUrl');
							console.log("uni.getStorageSync('isLogin')", uni.getStorageSync('backUrl'));
						}
					});
				} else {
					// alert("跳转home")
					// alert("准备跳转Home"+this.getBackUrl())
					uni.reLaunch({
						url: self.$api.homePath,
						success: function() {
							uni.setStorageSync('isLogin', true);
							uni.removeStorageSync('backUrl');
						}
					});
				}
				// #endif
			},
			getBackUrl: function() {
				let self = this;
				let url = uni.getStorageSync('backUrl');
				// let url = this.$store.getters.getBackUrl;
				url = self.getDecodeUrl(url);
				// alert("storage"+uni.getStorageSync('backUrl'),url)
				// alert("进入getBackUrl")
				if (url && url !== '/' && self.getDecodeUrl(url) !== self.$api.weChatAuthorPath) {
					if (url.indexOf(self.$api.weChatAuthorPath) !== -1) {
						// url = url
						url = url.substring(self.$api.weChatAuthorPath.length - 1, url.length);
					} else {
						// alert("2::" + url + uni.getStorageSync('bx_auth_ticket'))
						if (url && url.lastIndexOf('backUrl=') !== -1) {
							url = url.substring(url.lastIndexOf('backUrl=') + 8, url.length);
							// console.log("授权成功，准备返回用户界面url",url)
						}
					}
					console.log('回调url', url);
					return url;
				} else {
					return false;
				}
			},
			setshopinfo: function() {
				let self = this;
				let judgetime = this.judgeTime();
				if (uni.getStorageSync('isLogin') && !judgetime) {
					self.getShopInfo().then(res => {
						if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
							let shopInfo = res.data.data[0];
							uni.setStorageSync('shopInfo', shopInfo);
							self.$store.commit('setShopInfo', shopInfo);
							if (uni.getStorageSync('login_user_info').user_no) {
								self.getVipInfo(uni.getStorageSync('login_user_info').user_no).then(resp => {
									if (resp.data.state === 'SUCCESS' && resp.data.data.length > 0) {
										uni.setStorageSync('vipInfo', resp.data.data[0]);
										self.$store.commit('setVipInfo', resp.data.data[0]);
									}
								});
							}
						}
					});
				} else {
					return false;
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.authorization {
		width: 100%;
		height: 100%;
		background-color: #fff;

		.images {
			width: 100%;
			margin: 50upx 0;
		}

		.text {
			width: 90%;
			display: block;
			text-align: center;
			padding: 20upx 5%;
		}

		.button-box {
			margin-top: 50upx;
			height: 200upx;
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			align-items: center;

			.buttons {
				width: 70%;
				height: 70upx;
				line-height: 70upx;
				border-radius: 0upx;
				font-size: 30upx;
			}
		}
	}
</style>
<style lang="scss">
	page {
		background: #fff;
	}

	.container {
		padding-top: 115px;
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #fff;
	}

	.wrapper {
		position: relative;
		z-index: 90;
		background: #fff;
		padding-bottom: 40rpx;
		min-height: 500rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.back-btn {
		position: absolute;
		left: 40upx;
		z-index: 9999;
		/* padding-top: var(--status-bar-height); */
		top: 40upx;
		font-size: 40upx;
		/* color: $font-color-dark; */
	}

	.left-top-sign {
		font-size: 120upx;
		/* color: $page-color-base; */
		position: relative;
		left: -16upx;
	}

	.right-top-sign {
		position: absolute;
		top: 80upx;
		right: -30upx;
		z-index: 95;

		&:before,
		&:after {
			display: block;
			content: '';
			width: 400upx;
			height: 80upx;
			background: #b4f3e2;
		}

		&:before {
			transform: rotate(50deg);
			border-radius: 0 50px 0 0;
		}

		&:after {
			position: absolute;
			right: -198upx;
			top: 0;
			transform: rotate(-50deg);
			border-radius: 50px 0 0 0;
			/* background: pink; */
		}
	}

	.left-bottom-sign {
		position: absolute;
		left: -270upx;
		bottom: -320upx;
		border: 100upx solid #d0d1fd;
		border-radius: 50%;
		padding: 180upx;
	}

	.welcome {
		position: relative;
		left: 50upx;
		top: -90upx;
		font-size: 46upx;
		color: #555;
		text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
	}

	.input-content {
		padding: 0 60upx;
	}

	.input-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0 30upx;
		background: #f8f6fc;
		height: 120upx;

		border-radius: 4px;
		margin-bottom: 50upx;

		&:last-child {
			margin-bottom: 0;
		}

		.tit {
			height: 50upx;
			line-height: 56upx;
			/* font-size: $font-sm+2upx; */
			/* color: $font-color-base; */
		}

		input {
			height: 60upx;
			/* font-size: $font-base + 2upx; */
			/* color: $font-color-dark; */
			width: 100%;
			/* box-sizing: border-box;
			padding: 20upx; */
		}
	}

	.confirm-btn {
		width: 630upx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 20px;
		margin-top: 70upx;
		/* background: $uni-color-primary; */
		color: #fff;

		&.confirm-btn+.confirm-btn {
			margin-top: 20rpx;
		}

		/* font-size: $font-lg; */
		&:after {
			border-radius: 20px;
		}
	}

	.forget-section {
		/* font-size: $font-sm+2upx; */
		/* color: $font-color-spec; */
		text-align: center;
		margin-top: 40upx;
	}

	.register-section {
		position: absolute;
		left: 0;
		bottom: 50upx;
		width: 100%;
		/* font-size: $font-sm+2upx; */
		/* color: $font-color-base; */
		text-align: center;

		text {
			/* color: $font-color-spec; */
			margin-left: 10upx;
		}
	}
</style>
