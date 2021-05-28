<template>
	<view>
		<view class="add-form">
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>住户</view>
				<!-- 		<bx-radio-group class="input" v-model="formData.house_no" mode="button">
					<bx-radio class="radio" color="#2979ff" v-for="item in houseList" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group> -->
				<picker class="pickers" @change="PickerChange" :value="pickerIndex" :range="pickerList">
					<view class="uni-input">{{pickerList[pickerIndex]||"请选择"}}</view>
				</picker>

			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>检查日期</view>
				<picker mode="date" v-model="formData.check_date" :disabled="true" @change="DateChange">
					<view class="uni-input">
						{{formData.check_date||"请选择"}}
					</view>
				</picker>
			</view>

			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>垃圾乱倒</view>
				<bx-radio-group class="input" v-model="formData.col_1">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>乱堆乱放</view>
				<bx-radio-group class="input" v-model="formData.col_2">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>污水乱流</view>
				<bx-radio-group class="input" v-model="formData.col_3">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>暴露养殖粪<br>污及其他农业<br>生产废弃物</view>
				<bx-radio-group class="input" v-model="formData.col_4">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group ">
				<view class="title"><text class="text-red margin-right-xs"></text>黑臭水体</view>
				<bx-radio-group class="input" v-model="formData.col_5">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>乱搭乱建</view>
				<bx-radio-group class="input" v-model="formData.col_6">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>乱贴乱画乱挂</view>
				<bx-radio-group class="input" v-model="formData.col_7">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>水体漂浮物</view>
				<bx-radio-group class="input" v-model="formData.col_8">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>残垣断壁</view>
				<bx-radio-group class="input" v-model="formData.col_9">
					<bx-radio class="radio" color="#2979ff" v-for="item in options" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
			</view>
			<view class="cu-form-group">
				<view class="title w100">
					存在问题照片
				</view>
				<robby-image-upload v-model="imgList" :enable-del="true" :server-url="upLoadUrl" :form-data="formDatas"
					:header="reqHeader" :server-url-delete-image="deleteFileUrl" @add="getImageInfo"
					@delete="deleteImage" :showUploadProgress="true" :limit="9">
				</robby-image-upload>
			</view>
			<view class="cu-form-group">
				<textarea maxlength="-1" placeholder="整改问题说明" class="text-area" v-model="formData.remark"></textarea>
			</view>
			<view class="cu-form-group">
				<view class="title"><text class="text-red margin-right-xs"></text>整改时限</view>
				<!-- 		<bx-radio-group class="input" v-model="formData.report" mode="button" @change="overTimeChange">
					<bx-radio class="radio" color="#2979ff" v-for="item in reportOption" :key="item.value"
						:name="item.value">
						{{ item.label }}
					</bx-radio>
				</bx-radio-group> -->

				<picker class="pickers" @change="overTimeChange" :value="reportIndex" :range="reportOption">
					<view class="uni-input">{{reportOption[reportIndex]||"请选择"}}</view>
				</picker>

			</view>
			<view class="cu-form-group" v-if="formData.report_over_time">
				<view class="title"><text class="text-red margin-right-xs"></text>整改检查过期时间</view>
				<picker mode="date" :disabled="true" v-model="formData.report_over_time" start="2021-04-01"
					end="2022-09-01" @change="DateChange2">
					<view class="uni-input">
						{{formData.report_over_time}}
					</view>
				</picker>
			</view>
			<view class="button-box">
				<button type="primary" class="button cu-btn bg-blue" @click="submitForm">提交</button>
			</view>
		</view>
	</view>
</template>

<script>
	// 创建巡查记录
	const dayjs = require('@/static/js/dayjs.min.js')
	import {
		mapGetters
	} from 'vuex'
	export default {
		computed: {
			...mapGetters(['wxUserInfo', 'loginUserInfo', 'roleInfo']),
			pickerList() {
				if (Array.isArray(this.houseList) && this.houseList.length > 0) {
					return this.houseList.map(item => item.label)
				} else {
					return ['网络状况较差，请稍后进行选择']
				}
			}
		},
		data() {
			return {
				formData: {
					house_no: "", // 住户
					check_date: '', // 检查日期
					col_1: "", //垃圾乱倒
					col_2: "", //乱堆乱放
					col_3: "", //污水乱流
					col_4: "", //暴露养殖粪污及其他农业生产废弃物
					col_5: "", //黑臭水体
					col_6: "", //乱搭乱建
					col_7: "", //乱贴乱画乱挂
					col_8: "", //水体漂浮物
					col_9: "", //残垣断壁
					file_no: "", // 存在问题照片
					remark: "", // 整改问题说明
					report: "", //整改时限
					report_over_time: "", //整改检查过期时间
					check_user: "", //街长
					proc_status: "巡查问题发布"
				},
				// reportOption: [{
				// 		label: '当日整改完毕',
				// 		value: '当日整改完毕'
				// 	},
				// 	{
				// 		label: '2日内整改完毕',
				// 		value: '2日内整改完毕'
				// 	},
				// 	{
				// 		label: '上报村街长制领导小组处理',
				// 		value: '上报村街长制领导小组处理'
				// 	}
				// ],
				pickerIndex: -1,
				reportIndex: -1,
				reportOption: ['当日整改完毕', '2日内整改完毕', '上报村街长制领导小组处理'],
				deleteFileUrl: this.$api.deleteFile,
				upLoadUrl: this.$api.upload,
				reqHeader: {
					bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
				},
				formDatas: {
					serviceName: 'srv_bxfile_service',
					interfaceName: 'add',
					app_no: 'daq',
					table_name: 'bxdaq_street_check_record',
					thumbnailType: 'fwsu_100',
					columns: 'file_no'
				},
				imgList: [],
				imageListData: [],
				houseList: [],
				options: [{
						label: "√",
						value: '√'
					},
					{
						label: "×",
						value: '×'
					},
				]
			}
		},
		onLoad(option) {
			if (option.house_no) {
				this.formData.house_no = option.house_no
				this.pickerIndex = this.pickerList.findIndex(item => item.house_no === option.house_no)
			}
		},
		created() {
			if (this.staffInfo && this.staffInfo.road_no) {
				this.getManageHouse()
				this.formData.check_date = this.formateDate(new Date(), 'date')
				this.formData.check_user = this.loginUserInfo.user_no
			}
		},
		methods: {
			PickerChange(e) {
				let self = this;
				this.pickerIndex = e.detail.value;
				let oriItem = this.houseList[e.detail.value]
				if (oriItem && oriItem['no']) {
					this.formData.house_no = oriItem['no']
				}
			},
			overTimeChange(info) {
				this.reportIndex = info.detail.value
				const e = this.reportOption[this.reportIndex]
				this.formData.report = e
				if (e === '当日整改完毕') {
					this.formData.report_over_time = dayjs().format('YYYY-MM-DD 23:59:59')
				} else if (e === '2日内整改完毕') {
					this.formData.report_over_time = dayjs().add(2, 'day').format('YYYY-MM-DD 23:59:59')
				} else if (e === '上报村街长制领导小组处理') {
					this.formData.report_over_time = null
				}
			},
			DateChange(e) {
				this.formData.check_date = e.detail.value
			},
			DateChange2(e) {
				this.formData.report_over_time = e.detail.value
			},
			async submitForm(e) {
				let req = [{
					"serviceName": "srvdaq_street_check_record_add",
					"condition": [],
					"data": [this.formData]
				}]
				let url = this.getServiceUrl('daq', 'srvdaq_street_check_record_add', 'operate');
				let res = await this.$http.post(url, req)
				if (res.data.state == 'SUCCESS') {
					uni.showModal({
						title: '提示',
						content: '提交成功',
						showCancel: false,
						success() {
							uni.redirectTo({
								url: '/pages/specific/list/list'
							})
						}
					})
				}
			},
			async getManageHouse() {
				// 查找当前管理人员负责的住户
				if (this.staffInfo && this.staffInfo.road_no) {
					let req = {
						"serviceName": "srvdaq_street_house_select",
						"colNames": ["*"],
						"condition": [{
							"colName": "road_no",
							"ruleType": "eq",
							"value": this.staffInfo.road_no
						}],
						"page": {
							"pageNo": 1,
							"rownumber": 99
						},
					}
					let url = this.getServiceUrl('daq', 'srvdaq_street_house_select', 'select');
					let res = await this.$http.post(url, req)
					if (res.data.state === 'SUCCESS') {
						if (Array.isArray(res.data.data) && res.data.data.length === 0) {
							// 没有住户 跳转到住户新增页面
							uni.redirectTo({
								url: "/pages/public/formPage/formPage?serviceName=srvdaq_street_house_add&type=add&cond=[]&from=checkRecord"
							})
							return
						}
						this.houseList = res.data.data.map(item => {
							item.label = item.holder
							item.value = item.no
							return item
						})
					}
				}
			},
			async deleteImage(e) {
				let fileDatas = await this.getFilePath(this.formData.file_no);
				this.imgList = []
				if (fileDatas) {
					for (let i = 0; i < fileDatas.length; i++) {
						this.imgList.push(this.$api.getFilePath + fileDatas[i].fileurl + '&bx_auth_ticket=' + uni
							.getStorageSync('bx_auth_ticket'));
					}
				}
			},
			async getImageInfo(e) {
				let res = JSON.parse(e.allImages[0]);
				this.formData.file_no = res.file_no;
				this.formDatas.file_no = res.file_no;
				let fileDatas = await this.getFilePath(res.file_no);
				this.imgList = []
				if (fileDatas) {
					for (let i = 0; i < fileDatas.length; i++) {
						this.imgList.push(this.$api.getFilePath + fileDatas[i].fileurl + '&bx_auth_ticket=' + uni
							.getStorageSync('bx_auth_ticket'));
					}
				}
			},

			uploadFile(imagePathArr) {
				const _self = this
				var completeImages = 0
				let data = {
					serviceName: 'srv_bxfile_service',
					interfaceName: 'add',
					app_no: 'daq',
					table_name: 'bxdaq_street_check_record',
					thumbnailType: 'fwsu_100',
					columns: 'file_no'
				}
				if (this.formData.file_no) {
					data.file_no = this.formData.file_no
				}
				uni.uploadFile({
					url: _self.$api.upload,
					header: {
						bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
					},
					formData: data,
					filePath: imagePathArr,
					name: 'file',
					success: function(res) {
						console.log(res)
						if (res.statusCode === 200) {
							if (typeof res.data === 'string') {
								res.data = JSON.parse(res.data)
							}
							if (res.data.file_no) {
								_self.formData.file_no = res.data.file_no
							}
							console.log('success to upload image: ' + res.data)
						} else {
							console.log('fail to upload image:' + res.data)
						}
					},
					fail: function(res) {
						console.log('fail to upload image:' + JSON.stringify(res))
					}
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	// .add-form{
	// 	display: flex;
	// 	flex-wrap: wrap;
	// }
	.cu-form-group {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		min-height: 80rpx;
		height: auto;
		flex-wrap: wrap;

		.uni-input {
			flex: 1;
			text-align: left;
			line-height: 100rpx;
			padding-left: 20rpx;
		}

		.text-area {
			background-color: #f1f1f1;
			border-radius: 10rpx;
			padding: 10rpx;
			margin: 20rpx auto;
		}

		.title {
			width: 33%;
			white-space: nowrap;
			margin-right: 20rpx;
			height: auto !important;
			line-height: inherit !important;

			&.w100 {
				width: 100%;
				padding-bottom: 10rpx;
				word-wrap: break-word;
			}
		}

		.input {
			flex: 1;
		}
	}

	.button-box {
		background-color: #fff;
		padding: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-bottom: 50px;

		.button {
			width: 60%;
		}
	}
</style>
