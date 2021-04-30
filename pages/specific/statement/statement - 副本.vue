<template>
	<view class="statement-wrap">
		<view class="u-subsection">
			<u-subsection :list="subList" :current="curSub"></u-subsection>
		</view>
		<view class="content-wrap">
			<!-- 所有内容的容器 -->
			<view class="table-header">
				<view class="table-header-item">
					住户
				</view>
				<view class="table-header-item" v-if="curTab===0">
					问题数
				</view>
				<view class="table-header-item" v-if="curTab===0">
					已处理
				</view>
				<view class="table-header-item" v-if="curTab===0">
					未处理
				</view>
				<view class="table-header-item" v-if="curTab===1">
					已确认
				</view>
				<view class="table-header-item" v-if="curTab===1">
					未确认
				</view>
				<view class="table-header-item" v-if="curTab===2">
					当日整改完毕
				</view>
				<view class="table-header-item" v-if="curTab===2">
					两日内整改完毕
				</view>
				<view class="table-header-item" v-if="curTab===2">
					上报处理
				</view>
			</view>
			<view class="table-content">
				<view class="content-item" v-for="item in listData" :key="item.house_no">
					<view class="item-cell">
						{{item._house_no_disp}}
					</view>
					<view class="item-cell">
						{{item.questNum}}
					</view>
					<view class="item-cell">
						{{item.handled}}
					</view>
					<view class="item-cell">
						{{item.unhandled}}
					</view>
				</view>
			</view>
		</view>
		<!-- 与包裹页面所有内容的元素u-page同级，且在它的下方 -->
		<u-tabbar v-model="curTab" :list="tabList"></u-tabbar>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import dayjs from '@/static/js/dayjs.min.js'

	export default {
		computed: {
			...mapGetters(['wxUserInfo', 'loginUserInfo', 'roleInfo']),
		},
		data() {
			return {
				subList: [{
						name: '周排名'
					},
					{
						name: '月排名'
					},
					{
						name: '年排名'
					},
				],
				curSub: 0,
				tabList: [{
						iconPath: "home",
						selectedIconPath: "home-fill",
						text: '问题统计',
						count: 0,
						isDot: true,
						customIcon: false,
					},
					{
						iconPath: "photo",
						selectedIconPath: "photo-fill",
						text: '确认情况',
						customIcon: false,
					},
					{
						iconPath: "play-right",
						selectedIconPath: "play-right-fill",
						text: '整改时限',
						customIcon: false,
					}
				],
				curTab: 0, //当前tab
				roleType: "", //当前报表对应的角色
				accountInfo: null,
				listData: []
			}
		},
		onLoad(option) {
			if (option.roleType) {
				this.roleType = option.roleType
				let type = option.roleType === 'streetRoadInfo' ? '片区负责人' : option.roleType === 'villageInfo' ? '村长' :
					option.roleType === 'streetInfo' ? "街道办负责人" : null

				this.getStreetManagerInfo().then(result => {
					if (result && result[option.roleType] && type) {
						this.accountInfo = {
							...result[option.roleType],
							type,
							user_no: this.loginUserInfo.user_no
						}
						this.buildParams(this.accountInfo)
					} else {
						uni.showModal({
							title: '身份信息有误',
							content: '请返回首页重新登录',
							showCancel: false,
							success() {
								uni.reLaunch({
									url: '/pages/public/home/home',
									fail() {
										uni.switchTab({
											url: '/pages/public/home/home',
										})
									}
								})
							}
						})
					}
				})
			}
		},
		methods: {
			async buildParams(info) {
				let cond = []
				let group = []
				switch (info.type) {
					case '片区负责人':
						cond.push({
							colName: 'report_user',
							ruleType: 'eq',
							value: info.user_no
						})
						break;
					default:
						break;
				}
				switch (this.curTab) {
					case 0:
						// 问题数，已处理数，未处理
						// group = [{
						// 		"colName": "house_no",
						// 		"type": "by"
						// 	},
						// 	// {
						// 	// 	"colName": "report_status",
						// 	// 	"type": "by"
						// 	// },
						// 	{
						// 		"colName": "id",
						// 		"type": "count",
						// 		"aliasName": 'num'
						// 	}
						// ]
						break;
					case 1:
						// 已确认，未确认
						// group = [{
						// 		"colName": "house_no",
						// 		"type": "by"
						// 	}, {
						// 		"colName": "report_status",
						// 		"type": "by"
						// 	},
						// 	{
						// 		"colName": "id",
						// 		"type": "count",
						// 		"aliasName": 'num'
						// 	}
						// ]
						break;
					case 2:
						group = [{
								"colName": "house_no",
								"type": "by"
							}, {
								"colName": "report",
								"type": "by"
							},
							{
								"colName": "id",
								"type": "count",
								"aliasName": 'num'
							}
						]
						// 两日内，当日，上报
						break;
				}
				debugger
				let result = await this.getCountData(cond, group)
				if (Array.isArray(result)) {
					result = result.reduce((pre, cur) => {
						let objIndex = pre.findIndex(item => item.house_no === cur.house_no)
						let obj = {}

						debugger
						if (objIndex !== -1) {
							obj = pre[objIndex]
							debugger
							switch (this.curTab) {
								case 0:
									if (cur.report_status) {
										obj.handled++
									} else {
										obj.unhandled++
									}
									break;
								case 1:
									break;
								case 2:
									break;
							}
						} else {
							switch (this.curTab) {
								case 0:
									obj = {
										house_no: cur.house_no,
										questNum: 0,
										handled: 0,
										unhandled: 0,
										_house_no_disp: cur._house_no_disp
									}
									if (cur.report_status) {
										obj.handled++
									} else {
										obj.unhandled++
									}
									break;
								case 1:
									break;
								case 2:
									break;
							}
							debugger
						}
						obj.questNum++
						if (objIndex !== -1) {
							pre[objIndex] = obj
						} else {
							pre.push(obj)
						}
						// pre.push(obj)
						return pre
					}, [])

					this.listData = result
				}

			},
			async getCountData(cond = [], group = [], order = []) {
				let req = {
					"serviceName": "srvdaq_street_check_record_select",
					"colNames": ["*"],
					condition: cond,
					group: group,
					"page": {
						"pageNo": 1,
						"rownumber": 999
					},
					"order": order,
				}
				let url = this.getServiceUrl('daq', 'srvdaq_street_check_record_select', 'select');
				let res = await this.$http.post(url, req)
				if (res.data.state === "SUCCESS") {
					return res.data.data
				}
			},
			async getStreetManagerInfo() {
				// 街道片区
				if (this.loginUserInfo && this.loginUserInfo.user_no) {
					let req = {
						"serviceName": "srvdaq_street_road_select",
						"colNames": ["*"],
						"condition": [{
							"colName": "street_manager",
							"ruleType": "eq",
							"value": this.loginUserInfo.user_no
						}],
						"page": {
							"pageNo": 1,
							"rownumber": 1
						},
					}
					let url = this.getServiceUrl('daq', 'srvdaq_street_road_select', 'select');
					let res = await this.$http.post(url, req)
					let result = {
						streetRoadInfo: {}, //片区
						villageInfo: {}, // 村
						streetInfo: {} // 街道办
					}
					if (res.data.state === "SUCCESS" && Array.isArray(res.data.data) && res.data.data.length > 0) {
						let streetRoadInfo = res.data.data[0]
						result.streetRoadInfo = streetRoadInfo
						this.$store.commit('SET_STAFF_INFO', streetRoadInfo)
					} else {
						result.streetRoadInfo = null
					}
					const villageInfo = await this.getVillageInfo()
					const streetInfo = await this.getVillageInfo(true)
					result.villageInfo = villageInfo; // 村
					result.streetInfo = streetInfo; // 街道办
					this.$store.commit('SET_ROLE_INFO', result)
					return result

				}
			},
			async getVillageInfo(streetInfo = false) {
				// 村信息
				let req = {
					"serviceName": "srvdaq_street_village_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "village_manager",
						"ruleType": "eq",
						"value": this.loginUserInfo.user_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					},
				}
				if (streetInfo) {
					req.condition = [{
						"colName": "street_manager",
						"ruleType": "eq",
						"value": this.loginUserInfo.user_no
					}]
				}
				let url = this.getServiceUrl('daq', 'srvdaq_street_village_select', 'select');
				let res = await this.$http.post(url, req)
				if (res.data.state === "SUCCESS" && Array.isArray(res.data.data) && res.data.data.length > 0) {
					let villageInfo = res.data.data[0]
					this.$store.commit('SET_VILLIAGE_INFO', villageInfo)
					return villageInfo
				} else return null
			},
		}
	}
</script>


<style scoped lang="scss">
	.statement-wrap {
		background-color: #fff;
		padding: 20rpx 40rpx;
		min-height: calc(100vh - var(--window-bottom) - var(--window-top));

		.u-subsection {
			width: 80%;
			margin: 0 auto;
			margin-bottom: 20rpx;
		}
	}

	.table-header {
		display: flex;
		background-color: #f5f5f5;
		padding: 10rpx;

		.table-header-item {
			flex: 1;
			text-align: center;

			&+.table-header-item {
				border-left: 1px solid #fff;
			}
		}
	}
</style>
