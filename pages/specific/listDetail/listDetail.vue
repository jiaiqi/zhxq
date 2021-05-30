<template>
	<view class="list-wrap">
		<view class="road-info bg-blue" v-if="(loginUserInfo.real_name || loginUserInfo.user_disp)&& detail.proc_status === '巡查问题发布'">当前步骤：整改确认，负责人：{{ loginUserInfo.real_name || loginUserInfo.user_disp }} </view>
		<view class="road-info bg-green" v-if="(loginUserInfo.real_name || loginUserInfo.user_disp)&& detail.proc_status === '巡查结果确认'">当前步骤：整改结果确认，负责人：{{ loginUserInfo.real_name || loginUserInfo.user_disp }} </view>
		<view class="road-info bg-blue" v-if="roadInfo">{{ roadInfo || '' }}街长 </view>
		<view class="road-info bg-green" v-if="villager">{{ villager || '' }}村长 </view>
		<view class="list" v-if="detail">
			<view class="list-item">
				<view class="first-step" :class="{ 'second-step': detail.proc_status }">
					<view class="item-top">
						<view class="item-title">
							<view class="label">户主:</view>
							<view class="value">{{ detail._house_no_disp || '' }}</view>
						</view>
						<view class="item-title">
							<view class="label">检查日期:</view>
							<view class="value">{{ detail.check_date || '' }}</view>
						</view>
					</view>
					<view class="item-list">
						<view class="check-item">
							<view class="lable">垃圾乱倒</view>
							<view class="vale">{{ detail.col_1 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">乱堆乱放</view>
							<view class="vale">{{ detail.col_2 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">污水乱流</view>
							<view class="vale">{{ detail.col_3 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">暴露养殖粪污及其他农业生产废弃物</view>
							<view class="vale">{{ detail.col_4 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">黑臭水体</view>
							<view class="vale">{{ detail.col_5 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">乱搭乱建</view>
							<view class="vale">{{ detail.col_6 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">乱贴乱画乱挂</view>
							<view class="vale">{{ detail.col_7 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">水体漂浮物</view>
							<view class="vale">{{ detail.col_8 || 'x' }}</view>
						</view>
						<view class="check-item">
							<view class="lable">残垣断壁</view>
							<view class="vale">{{ detail.col_9 || 'x' }}</view>
						</view>
						<view class="check-item"></view>
					</view>

					<view class="item-content" v-if="detail.check_result !== '全部通过'">
						<view class="result-remark">
							<view class="title">问题说明：</view>
							<view class="text-area result-content">{{ detail.remark || '' }}</view>
						</view>
						<view class="result-remark">
							<view class="title">巡查附件：</view>
							<view class="result-image result-content" v-if="detail.file_no" @click="toPreviewImage(detail.imageList.map(e => e.originUrl))">
								<image class="image" :src="pic.originUrl" v-for="pic in detail.imageList"></image>
							</view>
						</view>
						<view class="result-remark">
							<view class="title">整改最后期限</view>
							<view class="result-content">{{ detail.report_over_time || '' }}</view>
						</view>
					</view>
				</view>

				<view class="second-step" :class="{ 'third-step': detail.proc_status === '巡查结果确认' }">
					<view class="cu-form-group margin-top border-top">
						<view class="title">整改后照片</view>
						<robby-image-upload
							:enableAdd="!detail.report_status"
							:enableDel="!detail.report_status"
							v-model="imgList"
							:enable-del="true"
							:server-url="upLoadUrl"
							:form-data="formDatas"
							:header="reqHeader"
							:server-url-delete-image="deleteFileUrl"
							@add="getImageInfo"
							@delete="deleteImage"
							:showUploadProgress="true"
							:limit="9"
						></robby-image-upload>
					</view>
					<view class="cu-form-group">
						<textarea maxlength="-1" v-model="fieldModel.report_txt" @input="textareaAInput" placeholder="整改说明" class="text-area"></textarea>
					</view>
					<view class="item-footer">
						<view class="title cu-bar">
							<text>整改结果</text>
							<view class="result" v-if="detail.report_status">{{ detail.report_status }}</view>
						</view>
						<radio-group class="block" @change="RadioChange" v-if="!detail.report_status">
							<radio
								class="margin-right"
								:class="radioVal == radio.value ? 'checked' : ''"
								:checked="radioVal == radio.value ? true : false"
								v-model="radio.value"
								v-for="radio in radioList"
							>
								{{ radio.label }}
							</radio>
						</radio-group>
					</view>
					<view class="center" v-if="detail.proc_status === '巡查问题发布'">
						<button type="primary" class="cu-btn bg-blue margin-top" @click="updateDetail(false)">整改确认</button>
					</view>
				</view>
				<view class="third-step" v-if="detail.proc_status !== '巡查问题发布'">
					<view class="item-footer margin-top" v-if="detail.proc_status === '完成' || (detail.proc_status === '巡查结果确认' && roleInfo.villageInfo)">
						<view class="title">
							<text class="text-red margin-right-xs"></text>
							整改结果评分
						</view>
						<input type="digit" class="text-area" :disabled="!isVillageManage" v-model.number="confirmModel.score" placeholder="输入整改结果评分" />
					</view>
					<view class="item-footer margin-top" v-if="detail.proc_status === '完成' || (detail.proc_status === '巡查结果确认' && roleInfo.villageInfo)">
						<view class="title">
							<text class="text-red margin-right-xs"></text>
							整改结果说明
						</view>
						<textarea class="text-area high-height" :disabled="!isVillageManage" v-model="confirmModel.confirm_txt" placeholder="输入整改结果说明" />
					</view>
					<view class="center" v-if="detail.proc_status === '巡查结果确认' && isVillageManage">
						<button type="primary" class="cu-btn bg-blue margin-top" @click="updateDetail(true)">整改结果确认</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
	computed: {
		...mapGetters(['wxUserInfo', 'loginUserInfo', 'roleInfo']),
		isVillageManage() {
			return !!this.roleInfo.villageInfo;
		},
		staffInfo() {
			if (this.roleInfo?.streetRoadInfo?.id) {
				return this.roleInfo.streetRoadInfo;
			}
		},
		roadInfo() {
			if (this.staffInfo.id&&this?.detail?.proc_status === '巡查问题发布') {
				return this.staffInfo?._street_no_disp + this.staffInfo?._village_no_disp + this.staffInfo?.road_name;
			}
		},
		villager(){
			// 村长信息
			if(this.villageInfo?.id){
				return this.villageInfo._street_no_disp+this.villageInfo.village_name
			}
		},
		villageInfo(){
			if (this.roleInfo?.villageInfo?.id&&this?.detail?.proc_status === '巡查结果确认') {
				return this.roleInfo.villageInfo;
			}
		}
	},
	mounted() {
		this.fieldModel.report_user = this.loginUserInfo.user_no;
		if (this.isVillageManage) {
			this.confirmModel.confirm_user = this.roleInfo.villageInfo.village_manager;
		}
	},
	data() {
		return {
			detail: null,
			fieldModel: {
				report_file_no: '',
				report_txt: '', // 整改说明
				report_user: '',
				report_status: '已整改', //整改结果
				proc_status: '巡查结果确认', //步骤
				report_time: this.formateDate(new Date(), 'full') // 整改完检查时间
			},
			confirmModel: {
				score: '', // 整改得分
				confirm_txt: '', //整改结果确认说明
				confirm_user: '', // 整改结果确认人
				proc_status: '完成' // 步骤
			},
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
			loadStatus: 'more', // more noMore loading
			record_no: '',
			radioVal: '已整改',
			radioList: [
				{
					label: '已整改',
					value: '已整改'
				},
				{
					label: '上报',
					value: '上报'
				}
			]
		};
	},

	methods: {
		async deleteImage(e) {
			let fileDatas = await this.getFilePath(this.fieldModel.report_file_no);
			this.imgList = [];
			if (fileDatas) {
				for (let i = 0; i < fileDatas.length; i++) {
					this.imgList.push(this.$api.getFilePath + fileDatas[i].fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket'));
				}
			}
		},
		async getImageInfo(e) {
			let res = JSON.parse(e.allImages[0]);
			this.fieldModel.report_file_no = res.file_no;
			this.formDatas.file_no = res.file_no;
			let fileDatas = await this.getFilePath(res.file_no);
			this.imgList = [];
			if (fileDatas) {
				for (let i = 0; i < fileDatas.length; i++) {
					this.imgList.push(this.$api.getFilePath + fileDatas[i].fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket'));
				}
			}
		},

		RadioChange(e) {
			this.fieldModel.report_status = e.detail.value;
		},
		updateDetail(thirdStep = false) {
			let serviceName = 'srvdaq_street_check_record_update';
			if (thirdStep) {
				serviceName = 'srvdaq_street_check_record_check_update';
			}
			let req = [
				{
					serviceName: serviceName,
					condition: [
						{
							colName: 'id',
							ruleType: 'eq',
							value: this.detail.id
						}
					],
					data: [this.fieldModel]
				}
			];
			if (thirdStep) {
				req[0].data[0] = this.confirmModel;
			}
			let url = this.getServiceUrl('daq', serviceName, 'operate');
			this.$http.post(url, req).then(res => {
				if (res.data.state === 'SUCCESS') {
					this.selectDetail();
					uni.showToast({
						title: '提交成功'
					});
				}
			});
		},
		async getImage(e) {
			if (e) {
				let imagesUrl = [];
				let images = await this.getFilePath(e);
				if (Array.isArray(images)) {
					for (let i = 0; i < images.length; i++) {
						const obj = {
							originUrl: `${this.$api.getFilePath}${images[i].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`,
							smallUrl: `${this.$api.getFilePath}${images[i].fileurl}&thumbnailType=fwsu_100&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
						};
						imagesUrl.push(obj);
					}
				}
				return imagesUrl;
			}
		},
		async selectDetail() {
			let req = {
				serviceName: 'srvdaq_street_check_record_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'record_no',
						ruleType: 'eq',
						value: this.record_no
					}
				],
				page: {
					pageNo: 1,
					rownumber: 1
				}
			};
			let url = this.getServiceUrl('daq', 'srvdaq_street_check_record_select', 'select');
			this.loadStatus = 'loading';
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
				let detail = res.data.data[0];
				if (detail.file_no) {
					detail.imageList = await this.getImage(detail.file_no);
				}
				this.fieldModel.report_file_no = detail.report_file_no;
				if (detail.report_file_no) {
					let fileDatas = await this.getFilePath(detail.report_file_no);
					this.imgList = [];
					if (fileDatas) {
						for (let i = 0; i < fileDatas.length; i++) {
							this.imgList.push(this.$api.getFilePath + fileDatas[i].fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket'));
						}
					}
				}
				this.fieldModel.report_txt = detail.report_txt;
				if (detail.proc_status === '完成') {
					this.confirmModel.score = detail.score;
					this.confirmModel.confirm_txt = detail.confirm_txt;
				}
				this.detail = detail;
			}
		}
	},
	onLoad(option) {
		if (option.record_no) {
			this.record_no = option.record_no;
			this.selectDetail();
		}
		if(this.loginUserInfo?.user_disp){
			uni.setNavigationBarTitle({
				title:this.loginUserInfo.user_disp
			})
		}else if(this.loginUserInfo?.real_name){
			uni.setNavigationBarTitle({
				title:this.loginUserInfo.real_name
			})
		}
	},
	onPullDownRefresh() {
		// 下拉刷新
		this.selectDetail().then(_ => {
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 500);
		});
	}
};
</script>

<style scoped lang="scss">
.list-wrap {
	min-height: 100vh;
	background-color: #fff;
	// min-height: calc(100vh - var(--window-top) - var(--window-bottom));
}
.road-info {
	text-align: center;
}
.list {
	.list-item {
		padding: 20rpx;
		margin-bottom: 10px;
		background-color: #fff;

		.first-step.second-step {
			padding: 10px;
			border-radius: 10rpx;
			background: #f3f3f3;
		}

		.second-step.third-step {
			margin-top: 10px;
			padding: 10px;
			border-radius: 10rpx;
			background: #f3f3f3;
		}

		.second-step.finish {
			margin-top: 10px;
			padding: 10px;
			border-radius: 10rpx;
			background: #f3f3f3;
		}

		.item-top {
			padding: 20rpx 0;
			display: flex;
			justify-content: space-between;
			border-bottom: 1px solid #dcdfe6;

			.item-title {
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.item-list {
			display: flex;
			flex-wrap: wrap;
			border-bottom: 1rpx solid #f1f1f1;
			padding: 20rpx 0;
			flex-wrap: wrap;

			.check-item {
				min-width: 50%;
				padding-right: 20rpx;
				padding: 10rpx 20rpx 10rpx 0;
				display: flex;
				flex: 1;

				.lable {
					margin-right: 20rpx;
				}

				.vale {
					flex: 1;
					text-align: right;
					padding-right: 20rpx;
					justify-content: center;
				}
			}
		}

		.item-content {
			margin-top: 10rpx;

			.result-remark {
				display: flex;
				margin-bottom: 10rpx;
				padding: 10rpx 0;

				.title {
					min-width: 150rpx;
				}

				.result-content {
					flex: 1;
					padding: 0 10rpx;
					border-radius: 5rpx;
					min-height: 50px;
					// border: 1px solid #dcdfe6;
				}

				.text-area {
					background-color: #fafafa;
				}

				.result-image {
					display: flex;

					.image {
						height: 120rpx;
						max-width: 33%;
					}
				}
			}
		}

		.item-footer {
			border-top: 1px solid #dcdfe6;

			.result {
				font-weight: 600;
				font-size: 18px;
			}

			.cu-form-group {
				display: flex;
				flex-direction: row;
				min-height: 50rpx;
				justify-content: center;
			}
		}

		.center {
			text-align: center;
		}
	}

	.text-area {
		border-radius: 10rpx;
		padding: 20rpx;
		background-color: #fafafa;
		width: 100%;
		height: auto;

		&.high-height {
			min-height: 200rpx;
		}
	}

	.border-top {
		border-top: 1px solid #f1f1f1;
	}
}
</style>
