<template>
	<view class="info-wrap">
		<view v-if="personInfo && pageType === 'person'" class="cu-list menu" :class="[menuBorder ? 'sm-border' : '', menuCard ? 'card-menu margin-top' : '']">
			<view class="cu-bar justify-start bg-white account-info-card">
				<view class="action border-title">
					<text class="text-xl text-bold text-green">个人信息</text>
					<text class="bg-gradual-blue" style="width:3rem"></text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content content_info">
					<text class="text-grey">姓名：</text>
					<text class="text-grey">{{ personInfo.real_name ? personInfo.real_name : personInfo.openid ? personInfo.openid : '未知' }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content content_info">
					<text class="text-grey">性别：</text>
					<text class="text-grey">{{ personInfo.gender == 1 ? '男' : personInfo.gender == 2 ? '女' : '' }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content content_info">
					<text class="text-grey">电话号码：</text>
					<text class="text-grey">{{ personInfo.tel }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content content_info">
					<text class="text-grey">身份证号：</text>
					<text class="text-grey">{{ personInfo.picp }}</text>
				</view>
			</view>
		</view>
		<view v-if="houseList && Array.isArray(houseList) && !isSingleHouse && pageType === 'house'">
			<view class="cu-list menu account-info-card title" :class="[menuCard ? 'card-menu margin-top' : '']">
				<view class="cu-bar justify-start bg-white">
					<view class="action border-title">
						<text class="text-xl text-bold text-green">房屋信息</text>
						<text class="bg-gradual-blue" style="width:3rem"></text>
					</view>
				</view>
			</view>
			<view class="account-info-card cu-list menu" v-for="(item, index) in houseList" :key="index" :class="[menuBorder ? 'sm-border' : '', menuCard ? 'card-menu' : '']">
				<view class="cu-item" :class="menuArrow ? 'arrow' : ''" @click="showHouseDetail(item)">
					<view class="content content_info">
						<text class="text-grey">房间号:</text>
						<text class="text-grey">
							{{ item._fwbm_disp }}
							<text style="margin-left: 10rpx;" class="lg text-gray  cuIcon-right"></text>
						</text>
					</view>
				</view>
				<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content content_info">
						<text class="text-grey">居住类型:</text>
						<text class="text-grey">{{ item.fwyt }}</text>
					</view>
				</view>
				<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content content_info">
						<text class="text-grey">联系方式:</text>
						<text class="text-grey">{{ item.lxfs }}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-popup ref="popup" type="bottom">
			<view class="cu-list menu">
				<view class="cu-bar justify-start bg-white">
					<view class="action border-title">
						<text class="text-xl text-bold text-green">房屋人员</text>
						<text class="bg-gradual-blue" style="width:3rem"></text>
					</view>
				</view>
			</view>
			<view class="house-people-list">
				<view class="cu-list menu house-people" v-for="(item, index) in peopleList" :key="index" :style="{ 'margin-top': '10rpx' }">
					<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
						<view class="content content_info">
							<text class="text-grey">姓名:</text>
							<text class="text-grey">{{ item.xm }}</text>
						</view>
					</view>
					<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
						<view class="content content_info">
							<text class="text-grey">性别:</text>
							<text class="text-grey">{{ item._sex_disp }}</text>
						</view>
					</view>
					<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
						<view class="content content_info">
							<text class="text-grey">居住类型:</text>
							<text class="text-grey">{{ item.fwyt }}</text>
						</view>
					</view>
					<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
						<view class="content content_info">
							<text class="text-grey">与房主关系:</text>
							<text class="text-grey">{{ item._yfzgx_disp }}</text>
						</view>
					</view>
					<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
						<view class="content content_info">
							<text class="text-grey">联系方式:</text>
							<text class="text-grey">{{ item.lxfs }}</text>
						</view>
					</view>
					<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
						<view class="content content_info">
							<text class="text-grey">身份号码:</text>
							<text class="text-grey">{{ item.gmsfhm }}</text>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import uniPopup from '@/components/uni-popup/uni-popup.vue';
export default {
	name: 'personInfo',
	components: {
		uniPopup
	},
	data() {
		return {
			menuBorder: true,
			menuCard: true,
			menuArrow: false,
			houseList: [],
			peopleList: [],
			personInfo: null,
			isSingleHouse: false, //只有一套房产
			pageType: 'person' //页面类型 展示房屋还是个人信息
		};
	},
	computed: {
		name() {
			if (Array.isArray(this.houseList) && this.houseList.length > 0) {
				return this.houseList[0].xm;
			} else if (typeof this.houseList === 'object' && !Array.isArray(this.houseList)) {
				return this.houseList.xm;
			}
		}
	},
	methods: {
		clear(e) {
			// TODO nvue 取消冒泡
			e.stopPropagation();
		},
		startScroll(e) {},
		showHouseDetail(e) {
			this.getHousePeopleList(e.fwbm).then(_ => {
				this.$refs.popup.open();
			});
		},
		async getHousePeopleList(fwbm) {
			const url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
			let user = uni.getStorageSync('basics_info').picp;
			let req = {
				serviceName: 'srvzhxq_syrk_select',
				colNames: ['*'],
				condition: [
					{ colName: 'gmsfhm', ruleType: 'eq', value: user },
					{ colName: 'proc_status', ruleType: 'eq', value: '完成' },
					// { colName: 'is_fuzeren', ruleType: 'eq', value: '是' },
					{ colName: 'status', ruleType: 'eq', value: '有效' }
				]
			};
			if (fwbm) {
				req.condition = [
					{ colName: 'fwbm', ruleType: 'eq', value: fwbm },
					{ colName: 'proc_status', ruleType: 'eq', value: '完成' },
					{ colName: 'status', ruleType: 'eq', value: '有效' }
				];
			}
			const res = await this.$http.post(url, req);
			console.log('访客-----', res.data.data);
			if (res.data.state === 'SUCCESS') {
				let data = res.data.data;
				data = data.filter(item => item.fwbm && item.fwbm);
				if (data.length > 0) {
					if (!fwbm) {
						this.houseList = data;
					} else {
						this.peopleList = data;
					}
				} else {
					uni.showToast({
						title: '未发现当前账号下所属房屋，请确认已进行信息登记',
						icon: 'none',
						duration: 3000
					});
				}
			}
		},
		async getPersonInfo() {
			const url = this.getServiceUrl('zhxq', 'srvzhxq_member_select', 'select');
			let user = uni.getStorageSync('login_user_info').user_no;
			let personInfo = {};
			let req = {
				serviceName: 'srvzhxq_member_select',
				colNames: ['*'],
				condition: [{ colName: 'openid', ruleType: 'eq', value: uni.getStorageSync('login_user_info').user_no }]
			};
			const res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				let data = res.data.data;
				if (Array.isArray(data) && data.length > 0) {
					personInfo = data[0];
				}
				this.personInfo = personInfo;
			}
		},
		async getHouseNum() {
			const url = this.getServiceUrl('zhxq', 'srvzhxq_buiding_house_select', 'select');
			let user = uni.getStorageSync('login_user_info').user_no;
			let req = {
				serviceName: 'srvzhxq_buiding_house_select',
				colNames: ['*'],
				condition: [{ colName: 'is_bind', ruleType: 'eq', value: '是' }, { colName: 'bind_user', ruleType: 'notnull' }]
			};
			const res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				let data = res.data.data;
				data = data.filter(item => item.is_fuzeren === '是' && item.status === '有效' && item.fwbm);
				if (data.length > 0) {
					this.isSingleHouse = false;
					this.houseList = data;
				} else {
					uni.showToast({
						title: '未发现当前账号下所属房屋，请确认已进行信息登记',
						icon: 'none'
					});
					this.isSingleHouse = false;
				}
			}
		}
	},
	mounted() {
		console.log('hook:mounted');
	},
	onLoad(option) {
		if (option.type) {
			this.pageType = option.type;
		}
	},
	onShow() {
		console.log('hook:onShow');
		// this.getUserInfo();
		if (this.pageType === 'person') {
			this.getPersonInfo(); //在基础信息表中查找当前用户信息
		} else if (this.pageType === 'house') {
			this.getHousePeopleList(); //查找当前帐号登记的房子
		}
	}
};
</script>

<style lang="scss" scoped>
.info-wrap {
	margin: 20rpx 0;
	height: auto;
	.bg-gradual-blue {
		background-color: #0bc99d;
		background-image: none;
	}
	.text-green {
		color: #0bc99d;
	}
}
.content_info {
	display: flex;
	justify-content: space-between;
}
.account-name {
	color: #333;
	line-height: 60rpx;
	font-size: 30rpx;
	font-weight: 700;
	text-indent: 30rpx;
	text-align: center;
	background-color: #fff;
	// margin-bottom: 30rpx;
}
.account-info-card {
	margin-bottom: 10rpx;
	border-radius: 0;
	&:first-child {
		margin-bottom: 2px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
	}
	&:last-child {
		border-top-right-radius: 0;
		border-top-left-radius: 0;
		border-bottom-right-radius: 20rpx;
		border-bottom-left-radius: 20rpx;
	}
	&.title {
	}
}
// .card-menu.margin-top {
// 	margin-top: 10rpx;
// }
.cu-list + .cu-list {
	margin-top: 0;
}
.little-title {
	background-color: #fff;
	border-bottom: 1px dashed #efefef;
	text-indent: 30rpx;
	line-height: 60rpx;
	padding-top: 30rpx;
}
.house-people-list {
	background-color: #f1f1f1;
	min-height: 30vh;
	max-height: 80vh;
	overflow: scroll;
	// overflow: hidden;
	.house-people {
		// height: 100%;

		// overflow: scroll;
	}
}
</style>
