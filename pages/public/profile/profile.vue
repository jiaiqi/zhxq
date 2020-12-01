<template>
	<view class="user-box">
		<view class="head_box">
			<image class="user-bg" src="http://shopro.7wpp.com/imgs/user/user_bg.png" mode=""></image>
			<view class="head-wrap pad">
				<!-- <view class="titleNav ">
					<view class="status-bar"></view>
				</view> -->
				<view class="user-head x-bc">
					<view class="x-f">
						<!-- 微信小程序 -->
						<view class="info-box">
							<view class="x-f info-box-top">
								<view class="head-img-wrap"><image class="head-img" :src="userInfo.avatarUrl || '/static/imgs/base_avatar.png'" mode="aspectFill"></image></view>
								<view style="margin-top: 20px;" class="">
									<text>{{ userInfo.nickName }}</text>
									<view style="margin-top: 10px;"></view>
								</view>
							</view>
						</view>
					</view>
					<button class="cu-btn code-btn" v-if="userInfo.avatar" @tap="jump('/pages/public/poster/index', { posterType: 'user' })"><text class="cuIcon-qr_code"></text></button>
				</view>
			</view>
		</view>
		<view class="content_box">
			<view class="cu-list menu" :class="[menuBorder ? 'sm-border' : '', menuCard ? 'card-menu margin-top' : '']">
				<view @tap="toPerson" class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="../../../static/xx.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">个人信息</text>
					</view>
				</view>
				<view @tap="toHouse" class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="../../../static/house.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">房屋信息</text>
					</view>
				</view>
				<view @tap="toFamily" class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="../../../static/family.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">家庭成员</text>
					</view>
				</view>
				<view @tap="toMyCar" class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="../../../static/car.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">我的车辆</text>
					</view>
				</view>
				<view @tap="toVisitor" class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="../../../static/fk.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">访客记录</text>
					</view>
				</view>
				<view @tap="toRepair" class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="../../../static/repair.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">报修记录</text>
					</view>
				</view>
				<view @click="toApply" class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="../../../static/yq.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">邀请来访</text>
						<!-- <button open-type="share" class="btn">邀请来访</button> -->
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'profile',
	components: '',
	data() {
		return {
			isRefresh: false, //更新
			showFollowWechat: false, //绑定公众号
			orderScrollLeft: 0, //订单卡片滑动。
			userInfo: uni.getStorageSync('wxuserinfo'),
			loginUserInfo: uni.getStorageSync('login_user_info'),
			menuArrow: true,
			menuBorder: true,
			menuCard: false,
			infoObj: ''
		};
	},
	methods: {
		toApply() {
			if (uni.getStorageSync('infoObjArr').length > 0) {
				let date = this.getDayDate(new Date(), 'all');
				let userIf = uni.getStorageSync('infoObj');
				let cond = [
					{ colName: 'fwrq', ruleType: 'eq', value: date },
					{
						colName: 'bfr',
						ruleType: 'eq',
						value: userIf.xm
					},
					{
						colName: 'bfrxm',
						ruleType: 'eq',
						value: userIf.xm
					},
					{
						colName: 'lybm',
						ruleType: 'eq',
						value: userIf.lybm
					},
					{
						colName: 'fwbm',
						ruleType: 'eq',
						value: userIf.fwbm
					},
					{
						colName: 'dybm',
						ruleType: 'eq',
						value: userIf.dybm
					},
					{
						colName: 'confirm_user',
						ruleType: 'eq',
						value: '被访人'
					},
					{
						colName: 'bfrbm',
						ruleType: 'eq',
						value: userIf.syrkbm
					}
				];
				uni.navigateTo({
					url: '/pages/public/shareApply/shareApply?serviceName=srvzhxq_guest_mgmt_yezhu_add&cond=' + JSON.stringify(cond)
				});
			} else {
				uni.showToast({
					title: '未进行住户登记',
					duration: 2000,
					icon: 'none'
				});
			}
		},
		toPerson() {
			uni.navigateTo({
				url: '/pages/public/personInfo/personInfo?serviceName=srvzhxq_guest_mgmt_yezhu_add&type=person'
			});
		},
		toHouse() {
			uni.navigateTo({
				// url: '/pages/public/personInfo/personInfo?serviceName=srvzhxq_guest_mgmt_yezhu_add&type=house',
				url:
					'/pages/public/list/list?serviceName=srvzhxq_syrk_select&showRowButton=true&navigationBarTitle=房屋信息&showAdd=false&from=house&pageType=list&viewTemp={"title":"_fwbm_disp","img":"zp","tip":"xm","gmsfzh":"rylx"}&cond=[{"colName":"is_fuzeren","ruleType":"like","value":"是"},{"colName":"openid","ruleType":"like","value":"user_no"},{"colName":"status","ruleType":"eq","value":"有效"}]'
			});
		},
		async toFamily() {
			let params = {
				defaultVal: {
					// openid:uni.getStorageSync('login_user_info').user_no
				}
			};
			let fwbms = uni.getStorageSync('infoObjArr');
			let str = [];

			if (fwbms && Array.isArray(fwbms) && fwbms.length > 0) {
				fwbms.forEach(item => {
					str.push(item.fwbm);
				});
			}
			let strs = str.toString();
			const url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
			let req = {
				serviceName: 'srvzhxq_syrk_select',
				colNames: ['*'],
				condition: [
					{ colName: 'fwbm', ruleType: 'in', value: strs },

					{ colName: 'proc_status', ruleType: 'eq', value: '完成' },
					{ colName: 'status', ruleType: 'eq', value: '有效' }
					// { colName: 'is_fuzeren', ruleType: 'eq', value: '是' }
				]
			};
			const res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				let openidList = res.data.data.map(item => {
					return item.openid;
				});
				openidList = openidList.filter(item => item&&item!=='a' && item);
				
				let relation_condition = {};
				relation_condition = {
					relation: 'OR',
					data: [{ colName: 'create_user', ruleType: 'eq', value: uni.getStorageSync('login_user_info').user_no }]
				};

				if (uni.getStorageSync('basics_info').person_no) {
					relation_condition.data.push({ colName: 'person_no', ruleType: 'in', value: uni.getStorageSync('basics_info').person_no });
				}
				if (openidList.length > 0) {
					relation_condition.data.push({ colName: 'openid', ruleType: 'in', value: openidList.toString() });
				}
				uni.navigateTo({
					url:
						'/pages/public/list/list?serviceName=srvzhxq_member_front_select&navigationBarTitle=家庭成员&params=' +
						JSON.stringify(params) +
						'&pageType=list&viewTemp={"title":"real_name","tip":"gender","footer":"tel","img":"head_img"}&relation_condition=' +
						JSON.stringify(relation_condition)
				});
				// uni.navigateTo({
				// 	url:
				// 		'/pages/public/list/list?serviceName=srvzhxq_member_front_select&params=' +
				// 		JSON.stringify(params) +
				// 		'&pageType=list&viewTemp={"title":"real_name","tip":"gender","footer":"tel","img":"head_img"}&relation_cond=[{"colName":"openid","ruleType":"in","value":"' +
				// 		fwbms.toString() +
				// 		'"}]'
				// });
			}
		},
		toRepair() {
			if (uni.getStorageSync('infoObjArr').length > 0) {
				let user = uni.getStorageSync('login_user_info').user_no;
				let viewTemp = {
					title: '_fwbm_disp',
					tip: 'type',
					img: 'pic',
					footer: 'remark'
				};
				let cond = [
					{
						colName: 'create_user',
						ruleType: 'eq',
						value: 'user_no'
					}
				];
				uni.navigateTo({
					url:
						'/pages/public/list/list?serviceName=srvzhxq_repairs_select&pageType=list&viewTemp=' +
						decodeURIComponent(JSON.stringify(viewTemp)) +
						'&cond=' +
						decodeURIComponent(JSON.stringify(cond))
				});
			} else {
				uni.showToast({
					title: '未进行住户登记',
					duration: 2000,
					icon: 'none'
				});
			}
		},
		toMyCar() {
			if (uni.getStorageSync('infoObjArr').length > 0) {
				let user = uni.getStorageSync('login_user_info').user_no;
				let viewTemp = {
					title: 'cphm',
					tip: '_csys_disp',
					img: 'pic',
					footer: '_cllx_disp'
				};
				let cond = [
					{
						colName: 'create_user',
						ruleType: 'eq',
						value: 'user_no'
					}
				];
				let viewLeftTemp = {
					tip: '车辆颜色',
					footer: '车辆类型'
				};
				uni.navigateTo({
					url:
						'/pages/public/list/list?serviceName=srvzhxq_clgl_select&navigationBarTitle=我的车辆&pageType=list&type=skip&viewTemp=' +
						decodeURIComponent(JSON.stringify(viewTemp)) +
						'&cond=' +
						decodeURIComponent(JSON.stringify(cond)) +
						'&tempWord=' +
						decodeURIComponent(JSON.stringify(viewLeftTemp))
				});
			} else {
				uni.showToast({
					title: '未进行住户登记',
					duration: 2000,
					icon: 'none'
				});
			}
		},
		async toVisitor() {
			if (uni.getStorageSync('infoObjArr').length > 0) {
				let userArr = uni.getStorageSync('infoObjArr')
				let strArr = userArr.map(item=>{
					return item.fwbm
				})
				let cond = [
					{
						colName: 'fwbm',
						ruleType: 'in',
						value: strArr.toString()
					},
					{
						colName:"bfr",
						ruleType:"eq",
						value:userArr[0].xm
					},
					{
						colName: 'proc_status',
						ruleType: 'eq',
						value: '完成'
					}
				];
				let viewTemp = {
					title: 'xm',
					tip: 'fwrq',
					img: null,
					footer: 'remark'
				};
				let viewLeftTemp = {
					tip: '访问日期',
					footer: '访问事由'
				};
				uni.navigateTo({
					url:
						'/pages/public/list/list?serviceName=srvzhxq_guest_mgmt_select&navigationBarTitle=访客记录&pageType=list&type=skip&viewTemp=' +
						decodeURIComponent(JSON.stringify(viewTemp)) +
						'&cond=' +
						decodeURIComponent(JSON.stringify(cond)) +
						'&tempWord=' +
						decodeURIComponent(JSON.stringify(viewLeftTemp))
				});
				
				// const url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
				// let user = uni.getStorageSync('login_user_info').user_no;
				// let req = {
				// 	serviceName: 'srvzhxq_syrk_select',
				// 	colNames: ['*'],
				// 	condition: [
				// 		{ colName: 'openid', ruleType: 'eq', value: user },
				// 		{ colName: 'proc_status', ruleType: 'eq', value: '完成' },
				// 		{ colName: 'status', ruleType: 'eq', value: '有效' }
				// 		// { colName: 'is_fuzeren', ruleType: 'eq', value: '是' }
				// 	]
				// };
				// const res = await this.$http.post(url, req);
				// console.log('访客-----', res.data.data);
				// if (res.data.data.length > 0) {
				// 	let viewTemp = {
				// 		title: 'xm',
				// 		tip: 'fwrq',
				// 		img: null,
				// 		footer: 'remark'
				// 	};
				// 	let cond = [
				// 		{
				// 			colName: 'fwbm',
				// 			ruleType: 'in',
				// 			value: strArr.
				// 		},
				// 		{
				// 			colName: 'proc_status',
				// 			ruleType: 'eq',
				// 			value: '完成'
				// 		}
				// 	];
					
				// }
			} else {
				uni.showToast({
					title: '未进行住户登记',
					duration: 2000,
					icon: 'none'
				});
			}
		},
		onShareAppMessage(res) {
			console.log('res=====>>>>>', res);
			// return {
			//   title: '邀请来访',
			//   path: '/pages/public/proc/apply/apply?serviceName=srvzhxq_guest_mgmt_add',
			//   imageUrl:'../../../static/xx.png'
			// }
			//  onShareAppMessage(res) {
			return {
				title: '自定义分享标题',
				path: '/pages/public/proc/apply/apply?serviceName=srvzhxq_guest_mgmt_add',
				success: function(res) {
					console.log('成功', res);
				}
			};
			//  }
		},
		getWxUserInfo() {
			let self = this;
			wx.getUserInfo({
				success: function(res) {
					self.userInfo = res.userInfo;
					uni.setStorageSync('wxuserinfo', res.userInfo);
					uni.setStorageSync('isAuth', true);
					self.getWxUserInfo(res.userInfo);
				},
				fail: function() {
					uni.setStorageSync('isAuth', false);
					console.log('checkAuthorization');
					// self.checkAuthorization();
				}
			});
		},
		async getUserInfo() {
			const url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
			let user = uni.getStorageSync('basics_info').picp;
			let req = {
				serviceName: 'srvzhxq_syrk_select',
				colNames: ['*'],
				condition: [
					{ colName: 'gmsfhm', ruleType: 'eq', value: user },
					{ colName: 'proc_status', ruleType: 'eq', value: '完成' },
					{ colName: 'status', ruleType: 'eq', value: '有效' }
					// { colName: 'is_fuzeren', ruleType: 'eq', value: '是' }
				]
			};
			const res = await this.$http.post(url, req);
			console.log('res-----点击----', res);
			if (res.data && res.data.data && res.data.data.length > 0) {
				this.infoObj = res.data.data[0];
				console.log('*****', this.infoObj);
			}
		}
	},

	onShow() {
		console.log('onShow:checkAuthorization');
		// this.getWxUserInfo();
		// this.checkAuthorization()
		this.userInfo = uni.getStorageSync('wxuserinfo');
		if (!uni.getStorageSync('wxuserinfo')) {
			console.log('!uni.getStorageSync(wxuserinfo)----onShow');
			this.checkAuthorization();
		}
	},
	mounted() {
		// this.getWxUserInfo();
		this.getUserInfo();
		this.userInfo = uni.getStorageSync('wxuserinfo');
		if (!uni.getStorageSync('wxuserinfo')) {
			console.log('!uni.getStorageSync(wxuserinfo)----mounted');
			this.checkAuthorization();
		}
	}
	// onLoad() {
	// 	this.getWxUserInfo()
	// 	this.getUserInfo()
	// }
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
		height: 250rpx;
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
		padding-top: 50rpx;
		.info-box {
			.info-box-top {
				display: flex;
				padding-left: 20px;
			}
			// padding: 0 20rpx;
			.head-img-wrap {
				position: relative;
				.refresh-btn {
					position: absolute;
					padding: 0;
					background: none;
					width: 34rpx;
					height: 34rpx;
					border-radius: 50%;
					background: #c9912c;
					top: 0;
					right: 20rpx;
					.cuIcon-refresh {
						color: #fff;
						font-size: 24rpx;
					}
					.refresh-rotate {
						transform: rotate(360deg);
						transition: all 0.2s;
					}
				}
			}
			.head-img {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				background: #ccc;
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
