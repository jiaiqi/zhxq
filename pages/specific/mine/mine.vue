<template>
	<view class="user-box">
		<view class="head_box">
			<image class="user-bg" src="http://shopro.7wpp.com/imgs/user/user_bg.png" mode=""></image>
			<view class="head-wrap">
				<view class="user-head">
					<!-- 微信小程序 -->
					<view class="info-box-top">
						<view class="head-img-wrap">
							<view class="head-img">
								<text class="cuIcon-myfill text-white"></text>
							</view>
						</view>
						<view style="margin-top: 20px;" class="margin-right" v-if="isLogin">
							<text>账号：{{ loginUserInfo.user_no||'' }}</text>
							<view style="margin-top: 10px;"></view>
						</view>
						<view style="margin-top: 20px;" class="" v-if="isLogin">
							<text>姓名：{{ loginUserInfo.real_name||'' }}</text>
							<view style="margin-top: 10px;"></view>
						</view>
						<view style="margin-top: 20px;" class="" v-else>
							<button class="cu-btn round" @tap="toLogin">点击登录</button>
							<view style="margin-top: 10px;"></view>
						</view>
					</view>
					<view class="info-content" v-if="isLogin">
						<view class="area">
							负责区域：
							<view class="role-item active" @click="changeArea(index)" v-for="(role,index) in roleList"
								:key="role" :class="{'active':curRole===index}">
								<text
									v-if="role==='village_user'&&roleInfo.villageInfo.village_name">{{roleInfo.villageInfo.village_name}}</text>
								<text
									v-if="role==='street_user'&&roleInfo.streetRoadInfo.road_name">{{roleInfo.streetRoadInfo.road_name}}</text>
								<text
									v-if="role==='street_manager'&&roleInfo.streetInfo._street_no_disp">{{roleInfo.streetInfo._street_no_disp}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="content_box" v-if="loginUserInfo">
			<view class="cu-list menu">
				<view @tap="showModal('change-password')" class="cu-item arrow" v-if="isLogin">
					<view class="content">
						<text class="cuIcon-write png"></text>
						<text class="text-grey">修改密码</text>
					</view>
				</view>
				<view @tap="logout" class="cu-item arrow" v-if="isLogin">
					<view class="content">
						<text class="cuIcon-exit png"></text>
						<text class="text-grey">退出登录</text>
					</view>
				</view>
			</view>
		</view>
		<view class="cu-modal bottom-modal" :class="{show:modalName==='change-password'}" @click="showModal">
			<view class="cu-dialog" @click.stop="">
				<view class="change-password bg-white padding-bottom">
					<view class="cu-form-group">
						<view class="title">旧密码</view>
						<input placeholder="请输入旧密码" name="input" class="input" v-model="passwordModel.pwd"></input>
					</view>
					<view class="cu-form-group">
						<view class="title">新密码</view>
						<input placeholder="请输入新密码" name="input" class="input" v-model="passwordModel.newpwd"></input>
					</view>
					<view class="cu-form-group">
						<view class="title">确认新密码</view>
						<input placeholder="请再次输入新密码" name="input" class="input"
							v-model="passwordModel.newpwd2"></input>
					</view>
					<button class="cu-btn bg-blue margin-tb" type="primary" @click="resetPwd">立即修改</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		computed: {
			...mapGetters(['wxUserInfo', 'loginUserInfo', 'roleInfo']),
			isLogin() {
				if(this.roleInfo&&(this.roleInfo.streetRoadInfo||this.roleInfo.villageInfo||this.roleInfo.streetInfo)){
					return this.loginUserInfo && this.loginUserInfo.login_user_type === 'user'
				}else{
					return false
				}
			},
			roleList() {
				if (this.loginUserInfo && Array.isArray(this.loginUserInfo.roles)) {
					return this.loginUserInfo.roles
				} else {
					return []
				}
			},
			// curRoleInfo() {
			// 	if (this.roleList.length > 0) {
			// 		let role = this.roleList[this.curRole]
			// 		let info = this.deepClone(this.roleInfo)
			// 		if (role === 'street_manager') {
			// 			return info['streetInfo']
			// 		} else if (role === 'village_user') {
			// 			return info['villageInfo']
			// 		} else if (role === 'street_user') {
			// 			return info['streetRoadInfo']
			// 		}
			// 	}
			// }
		},
		data() {
			return {
				userInfo: {},
				curRole: 0,
				modalName: '',
				passwordModel: {
					pwd: "",
					newpwd2: "",
					newpwd: ""
				},
			};
		},
		methods: {
			changeArea(index) {
				this.curRole = index
			},
			logout() {
				uni.showModal({
					title: '提示',
					content: '是否继续退出登录？',
					cancelText: "不用了",
					confirmText: "是",
					success: (res) => {
						if (res.confirm) {
							uni.setStorageSync('isLogin', false);
							this.$store.commit('setLoginUser', {})
							uni.reLaunch({
								url: "/pages/public/accountExec/accountExec?isBind=true"
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			toLogin() {
				uni.redirectTo({
					url: '/pages/public/accountExec/accountExec?isBind=true'
				})
			},
			resetPwd() {
				let self = this
				let url = self.$api.changePassword;
				if (!this.passwordModel.pwd) {
					uni.showToast({
						title: '请输入旧密码',
						icon: 'none'
					})
					return
				}
				if (!this.passwordModel.newpwd) {
					uni.showToast({
						title: '请输入新密码',
						icon: 'none'
					})
					return
				}
				if (this.passwordModel.newpwd !== this.passwordModel.newpwd2) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					})
					return
				}
				let reqData = [{
					"serviceName": "srvsso_user_pwd_reset",
					"data": [{
						"pwd": this.passwordModel.pwd,
						"newpwd": this.passwordModel.newpwd
					}]
				}]
				uni.showModal({
					title: '修改密码',
					content: `确认将密码修改为[${this.passwordModel.newpwd}]?`,
					success: (res) => {
						if (res.confirm) {
							self.$http.post(url, reqData).then(res => {
								if (res.data.state === 'SUCCESS') {
									uni.setStorageSync('isLogin', false);
									uni.showModal({
										title: '修改成功！',
										content: '请重新登录，即将跳转到登录页面',
										showCancel: false,
										success(r) {
											if (r.confirm) {
												uni.reLaunch({
													url: "/pages/public/accountExec/accountExec?isBind=true"
												})
											}
										}
									})
								}
							})
						}
					}
				})

			},
			showModal(name = "") {
				this.modalName = name
			},
			init() {
				if (this.loginUserInfo.login_user_type ===
					'user') {
					item['data'].push({
						display: "显示",
						icon: 'unbind',
						dest_menu_no: "退出登录",
						dest_app: 'sso',
						dest_page: 'srvwx_user_unbind',
						id: 183,
						seq: 1
					})
					item['data'].push({
						display: "显示",
						icon: 'cpwd',
						dest_menu_no: "修改密码",
						dest_app: 'sso',
						dest_page: 'srvsso_user_pwd_reset',
						id: 183,
						seq: 1
					})
				}
			}
		},

		onShow() {},
		mounted() {}
	};
</script>

<style lang="scss" scoped>
	.user-box {
		overflow-x: hidden;
	}

	// 微信登录蒙层
	.login-box {
		position: fixed;
		z-index: 9999;
		width: 100%;
		height: 100%;
		background: none;
	}

	.head_box {
		position: relative;

		.user-bg {
			width: 100%;
			min-height: 250rpx;
			max-height: 300rpx;
		}

		.head-wrap {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			width: 100%;
			z-index: 9;
			top: 0;

			.nav-title {
				font-size: 38rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(51, 51, 51, 1);
			}

			.status-bar {
				// #ifndef H5
				height: var(--status-bar-height);
				// #endif
				// #ifdef H5
				height: 50rpx;
				// #endif
				width: 750rpx;
			}
		}

		.user-head {
			padding-top: 20px;

			.info-box-top {
				display: flex;
				padding-left: 20px;
			}

			.info-content {
				display: flex;
				padding-left: 90px;

				.area {
					display: flex;
					align-items: center;
					flex-wrap: wrap;

					.role-item {
						padding: 10rpx;
						border-radius: 50rpx;
						border: 1px solid #f1f1f1;
						margin-right:10rpx;
						margin-bottom: 10rpx;
						&.active {
							background-color: #007AFF;
							color: #fff;
							border-color: #007AFF;
						}
					}
				}
			}

			// padding: 0 20rpx;
			.head-img-wrap {
				position: relative;
			}

			.head-img {
				width: 120rpx;
				height: 120rpx;
				font-size: 80rpx;
				text-align: center;
				line-height: 120rpx;
				border-radius: 50%;
				background: #f1f1f1;
				margin-right: 25rpx;
				overflow: hidden;
			}

			.user-name {
				font-size: 30rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(51, 51, 51, 1);
				line-height: 30rpx;
				width: 150rpx;
			}

			.tag-box {
				background: rgba(0, 0, 0, 0.2);
				border-radius: 21rpx;
				line-height: 38rpx;
				padding-right: 10rpx;
				margin-left: 10rpx;

				.cuIcon-refresh {
					color: #fff;
					margin: 0 10rpx;
				}

				.tag-img {
					width: 40rpx;
					height: 40rpx;
					margin-right: 6rpx;
					border-radius: 50%;
				}

				.tag-title {
					font-size: 20rpx;
					font-family: PingFang SC;
					font-weight: 500;
					color: rgba(255, 255, 255, 1);
					line-height: 20rpx;
				}
			}

			.code-btn {
				background: none;

				.cuIcon-qr_code {
					font-size: 50rpx;
				}
			}
		}

		.wallet {
			font-size: 20rpx;
			padding-left: 140rpx;

			.money {
				margin-right: 40rpx;
			}
		}
	}

	// 订单卡片
	.order-wrap {
		height: 180rpx;
		background: #fff;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;

		.order-box {
			flex: 4;
			display: flex;
			justify-content: center;
			align-content: center;
		}

		.all-order {
			position: relative;

			.cut-off--line {
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				right: (750rpx/5) - 15rpx;
				width: 30rpx;
				height: 136rpx;
			}
		}

		.order-item {
			flex: 1;

			.item-box {
				position: relative;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}

			.order-img {
				width: 46rpx;
				height: 46rpx;
				// background: #ccc;
			}

			.item-title {
				font-size: 24rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(153, 153, 153, 1);
				line-height: 24rpx;
				padding-top: 10rpx;
			}
		}
	}

	// 绑定微信公众号
	.notice-box {
		width: 750rpx;
		height: 70rpx;
		background: rgba(253, 239, 216, 1);
		padding: 0 35rpx;

		.notice-detail {
			font-size: 24rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: rgba(204, 149, 59, 1);
		}

		.bindPhone {
			width: 135rpx;
			height: 52rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			border-radius: 26rpx;
			padding: 0;
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(255, 255, 255, 1);
		}
	}

	// 钱包卡片
	.wallet-box {
		background: #fff;
		height: 180rpx;
		margin-bottom: 20rpx;
		position: relative;

		.wallet-left {
			flex: 4;
		}

		.wallet-right {
			position: relative;

			.cut-off--line {
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				right: (750rpx/5) - 15rpx;
				width: 30rpx;
				height: 136rpx;
			}
		}

		.wallet-item {
			flex: 1;

			.wallet-img {
				width: 46rpx;
				height: 46rpx;
			}

			.wallet-item__detail {
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(168, 112, 13, 1);
			}

			.wallet-item__title {
				font-size: 24rpx;
				font-family: PingFang SC;
				font-weight: 400;
				color: rgba(153, 153, 153, 1);
				margin-top: 20rpx;
			}

			.item-balance::after {
				content: '元';
				font-size: 16rpx;
				margin-left: 4rpx;
			}

			.item-score::after {
				content: '个';
				font-size: 14rpx;
				margin-left: 4rpx;
			}

			.item-coupon::after {
				content: '张';
				font-size: 16rpx;
				margin-left: 4rpx;
			}
		}
	}

	.tools-box {
		background: #fff;
		display: flex;
		flex-wrap: wrap;
		padding-bottom: 40rpx;
		margin-bottom: 20rpx;

		.tool-item {
			width: (750rpx/4);
			padding-top: 40rpx;

			.tool-img {
				width: 44rpx;
				height: 44rpx;
				// background: #ccc;
			}

			.item-title {
				font-size: 24rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(153, 153, 153, 1);
				line-height: 24rpx;
				padding-top: 30rpx;
			}
		}
	}

	.foot_box {
		margin-top: 200rpx;
		padding-bottom: var(--window-bottom);
		margin-bottom: 50rpx;
	}

	.copyright {
		color: #999;

		.code1 {
			font-size: 24rpx;
		}

		.code2 {
			font-size: 20rpx;
			margin-top: 10rpx;
		}
	}

	.btn {
		position: static !important;
		background-color: transparent;
		color: #8799a3;
		padding: 0;
		display: inline;
		font-size: 30rpx;
	}

	/deep/ uni-button:after {
		border: none;
		border-radius: 0;
	}

	button:after {
		border: none;
		border-radius: 0;
	}
</style>
