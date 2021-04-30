<template>
	<view class="statement-wrap">
		<view class="u-subsection" v-if="roleList.length>0">
			<view class="subsection1">
				<u-subsection class="" :list="subList" :current="curSub" @change="changeSub"></u-subsection>
			</view>
			<view class="subsection2" :style="{flex:roleList.length}">
				<u-subsection class="" :list="roleList" :current="curRole" @change="changeRoleSub"
					v-if="roleList.length>0" mode="subsection"></u-subsection>
			</view>
		</view>
		<view class="content-wrap">
			<!-- 所有内容的容器 -->
			<view class="table-header">
				<view class="table-header-item">
					<!-- 住户 -->
					<text v-if="roleType==='streetRoadInfo'">住户</text>
					<text v-if="roleType==='villageInfo'">街片区</text>
					<text v-if="roleType==='streetInfo'">村</text>
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
				<view class="table-content-item" v-for="item in listData" :key="item.house_no">
					<view class="table-header" v-if="curTab===0">
						<view class="table-header-item">
							{{item.holder||item._road_no_disp||item._village_no_disp}}
						</view>
						<view class="table-header-item">
							{{item.questNum||'0'}}
						</view>
						<view class="table-header-item">
							{{item.handled||'0'}}
						</view>
						<view class="table-header-item">
							{{item.unhandled||'0'}}
						</view>
					</view>
					<view class="table-header" v-if="curTab===1">
						<view class="table-header-item">
							{{item.holder||item._road_no_disp||item._village_no_disp}}
						</view>
						<view class="table-header-item">
							{{item.isSure||'0'}}
						</view>
						<view class="table-header-item">
							{{item.noSure||'0'}}
						</view>
					</view>
					<view class="table-header" v-if="curTab===2">
						<view class="table-header-item">
							{{item.holder||item._road_no_disp||item._village_no_disp}}
						</view>
						<view class="table-header-item">
							{{item.today||'0'}}
						</view>
						<view class="table-header-item">
							{{item.nextDay||'0'}}
						</view>
						<view class="table-header-item">
							{{item.up||'0'}}
						</view>
					</view>
				</view>

			</view>
		</view>
		<!-- 与包裹页面所有内容的元素u-page同级，且在它的下方 -->
		<u-tabbar v-model="curTab" :list="tabList" @change="changeTab"></u-tabbar>
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
			roleList() {
				let roleList = []

				if (this.roleInfo.streetInfo) {
					roleList.push({
						name: "街道",
						_name: this.roleInfo.streetInfo._street_no_disp,
						no: this.roleInfo.streetInfo.street_manager,
						type: "street_manager",
						roleType: "streetInfo"
					})
				}
				if (this.roleInfo.villageInfo) {
					roleList.push({
						name: "村",
						_name: this.roleInfo.villageInfo.village_name,
						no: this.roleInfo.villageInfo.village_no,
						type: "street_manager",
						roleType: "villageInfo"
					})
				}
				if (this.roleInfo.streetRoadInfo) {
					roleList.push({
						name: "片区",
						_name: this.roleInfo.streetRoadInfo.road_name,
						no: this.roleInfo.streetRoadInfo.road_no,
						type: "street_manager",
						roleType: "streetRoadInfo"
					})
				}
				return roleList
			},
			timeRangeCondition() {
				let start = ''
				let end = ''
				if (this.curSub === 0) {
					// 周排名
					start = dayjs().startOf('week').add(1, 'day').format("YYYY-MM-DD")
					end = dayjs().endOf('week').add(1, 'day').format("YYYY-MM-DD")
				} else if (this.curSub === 1) {
					// 月排名
					start = dayjs().startOf('month').format("YYYY-MM-DD")
					end = dayjs().endOf('month').format("YYYY-MM-DD")
				} else if (this.curSub === 2) {
					// 年排名
					start = dayjs().startOf('year').format("YYYY-MM-DD")
					end = dayjs().endOf('year').format("YYYY-MM-DD")
				}
				let cond = [{
					colName: "check_date",
					ruleType: "between",
					value: [start, end].toString()
				}]
				return cond
			},
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
				curRole: 0,
				tabList: [{
						iconPath: "question-circle",
						selectedIconPath: "question-circle-fill",
						text: '整改情况',
						count: 0,
						isDot: true,
						customIcon: false,
					},
					{
						iconPath: "grid",
						selectedIconPath: "grid-fill",
						text: '确认情况',
						customIcon: false,
					},
					{
						iconPath: "clock",
						selectedIconPath: "clock-fill",
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
			option = this.roleList[this.curRole]
			if (option.roleType) {
				this.roleType = option.roleType
				let type = option.roleType === 'streetRoadInfo' ? '片区负责人' : option.roleType === 'villageInfo' ? '村长' :
					option.roleType === 'streetInfo' ? "街道办负责人" : null
				this.getStreetManagerInfo().then(result => {
					debugger
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
			init(option) {
				this.listData = []
				let type = option.roleType === 'streetRoadInfo' ? '片区负责人' : option.roleType === 'villageInfo' ? '村长' :
					option.roleType === 'streetInfo' ? "街道办负责人" : null
				this.roleType = option.roleType
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
			},
			changeSub(e) {
				this.curSub = e
				this.buildParams()
			},
			changeRoleSub(e) {
				this.curRole = e
				this.init(this.roleList[e])
			},
			changeTab(e) {
				this.curTab = e
				this.buildParams()
			},
			async buildParams(info) {
				info = info || this.accountInfo
				let cond = []
				let group = [{
					"colName": "id",
					"type": "count",
					"aliasName": 'num'
				}]
				info = info || this.accountInfo
				let type = []
				switch (this.curTab) {
					case 0:
						type = ["问题数", "已处理", "未处理"]
						break;
					case 1:
						type = ["已确认", "未确认"]
						break;
					case 2:
						type = ["当日", "两日内", '上报']
						break;
				}
				let datas = []
				for (let item of type) {
					debugger
					switch (info.type) {
						case '片区负责人':
							cond = [{
								colName: 'road_no',
								ruleType: 'eq',
								value: info.road_no
							}]
							group = [...group, {
									"colName": "house_no",
									"type": "by"
								},
								{
									"colName": "holder",
									"type": "by"
								}
							]
							break;
						case '街道办负责人':
							cond = [{
								colName: 'street_no',
								ruleType: 'eq',
								value: info.street_no
							}]
							break;
						case '村长':
							cond = [{
								colName: 'village_no',
								ruleType: 'eq',
								value: info.village_no
							}]
							group = [...group, {
								"colName": "road_no",
								"type": "by"
							}]
							break;
					}
					switch (item) {
						case '问题数':
							// cond.push({
							// 	colName: 'proc_status',
							// 	ruleType: 'ne',
							// 	value: '巡查问题发布'
							// })
							break;
						case '已处理':
							cond.push({
								colName: 'proc_status',
								ruleType: 'ne',
								value: '巡查问题发布'
							})
							break;
						case '未处理':
							cond.push({
								colName: 'proc_status',
								ruleType: 'eq',
								value: '巡查问题发布'
							})
							break;
						case '已确认':
							cond.push({
								colName: 'proc_status',
								ruleType: 'eq',
								value: '完成'
							})
							break;
						case '未确认':
							cond.push({
								colName: 'proc_status',
								ruleType: 'eq',
								value: '巡查结果确认'
							})
							break;
						case '当日':
							cond.push({
								colName: 'report',
								ruleType: 'like',
								value: '当日整改完毕'
							})
							break;
						case '两日内':
							cond.push({
								colName: 'report',
								ruleType: 'like',
								value: '2日内整改完毕'
							})
							break;
						case '上报':
							cond.push({
								colName: 'report',
								ruleType: 'like',
								value: '上报村街长制领导小组处理'
							})
							break;
					}
					let result = await this.getCountData(cond, group)
					if (Array.isArray(result)) {
						result.forEach(data => {
							let objIndex = datas.findIndex(val => val.house_no === data.house_no)
							let obj = {}
							if (this.curTab === 0) {
								if (objIndex !== -1) {
									obj = datas[objIndex]
									if (item === '未处理') {
										obj.unhandled += data.num
									} else if (item === '已处理') {
										obj.handled += data.num
									} else if (item === '问题数') {
										obj.questNum += data.num
									}
									datas[objIndex] = obj
								} else {
									obj = {
										house_no: data.house_no,
										questNum: 0,
										handled: 0,
										unhandled: 0,
										holder: data.holder,
										_road_no_disp: data._road_no_disp,
										_village_no_disp: data._village_no_disp,
										_street_no_disp: data._street_no_disp
									}
									if (item === '未处理') {
										obj.unhandled += data.num
									} else if (item === '已处理') {
										obj.handled += data.num
									} else if (item === '问题数') {
										obj.questNum += data.num
									}
									datas.push(obj)
								}
							} else if (this.curTab === 1) {
								if (objIndex !== -1) {
									obj = datas[objIndex]
									if (item === '已确认') {
										obj.isSure += data.num
									} else {
										obj.noSure += data.num
									}
									datas[objIndex] = obj
								} else {
									obj = {
										house_no: data.house_no,
										isSure: 0,
										noSure: 0,
										holder: data.holder,
										_road_no_disp: data._road_no_disp,
										_village_no_disp: data._village_no_disp,
										_street_no_disp: data._street_no_disp
									}
									if (item === '已确认') {
										obj.isSure += data.num
									} else {
										obj.noSure += data.num
									}
									datas.push(obj)
								}
							} else if (this.curTab === 2) {
								if (objIndex !== -1) {
									obj = datas[objIndex]
									if (item === '当日') {
										obj.today += data.num
									} else if (item === '两日内') {
										obj.nextDay += data.num
									} else if (item === '上报') {
										obj.up += data.num
									}
									datas[objIndex] = obj
								} else {
									obj = {
										house_no: data.house_no,
										today: 0,
										nextDay: 0,
										up: 0,
										holder: data.holder,
										_road_no_disp: data._road_no_disp,
										_village_no_disp: data._village_no_disp,
										_street_no_disp: data._street_no_disp
									}
									if (item === '当日') {
										obj.today += data.num
									} else if (item === '两日内') {
										obj.nextDay += data.num
									} else if (item === '上报') {
										obj.up += data.num
									}
									datas.push(obj)
								}
							}
						})
					}
				}

				this.listData = datas
				// debugger
			},
			async getCountData(cond = [], group = [], order = []) {
				let req = {
					"serviceName": "srvdaq_street_check_record_report_select",
					"colNames": ["*"],
					condition: [...this.timeRangeCondition, ...cond],
					group: group,
					order: [{
						"colName": "num",
						"orderType": "desc" // asc升序  desc降序
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 999
					},
					"order": order,
				}
				let url = this.getServiceUrl('daq', 'srvdaq_street_check_record_report_select', 'select');
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
			margin: 0 auto;
			margin-bottom: 20rpx;
			display: flex;
			flex-wrap: wrap;

			.subsection1 {
				flex: 3;
				margin-right: 20rpx;
				min-width: 50%;
			}

			.subsection2 {
				flex: 2;
			}
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

	.table-content {
		.table-header {
			background-color: #fff;
			border: 1px solid #F1f1f1;
			border-top: none;

			.table-header-item {
				&+.table-header-item {
					border-left: 1px solid #f1f1f1;
				}
			}
		}
	}
</style>
