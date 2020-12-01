<template>
	<view>
		<!-- <cu-custom bgColor="bg-blue" :isBack="true">
      <block slot="backText">返回</block>
      <block slot="content" v-if="colsV2Data.service_view_name">{{ colsV2Data.service_view_name }}</block>
    </cu-custom> -->
		<view class="form-wrap" v-if="fields.length > 0">
			<bxform
				ref="bxForm"
				:service="serviceName"
				:defaultCondition="defaultCondition"
				:pageType="type"
				:BxformType="type"
				@radio-benren-change="radioBenRen"
				:fields="fields"
			></bxform>
			<view class="apply_button_bot">
				<!-- <button class="bg-green cu-btn lg" @click="submitData">提交</button> -->
				<button class="bg-green cu-btn lg" @click="submitData" v-if="!showShareButton && hasSubmit === false">提交</button>
				<button class="bg-green cu-btn lg" @click="showShareButton = true" v-if="!showShareButton && hasSubmit">邀请绑定</button>
				<!-- <button class="bg-green cu-btn lg" open-type="share">邀请</button> -->
				<!-- <button class="bg-green cu-btn lg" @click="toList">查看记录</button> -->
				<!-- #ifdef MP-WEIXIN -->
				<!-- <button class="share-btn cu-btn lg bg-blue" open-type="share">分享</button> -->
				<!-- #endif -->
			</view>
		</view>
		<view class="cu-modal" :class="{ show: showShareButton }">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">分享登记页面</view>
					<view class="action" @tap="showShareButton = false"><text class="cuIcon-close text-red"></text></view>
				</view>
				<view class="padding-xl">点击下方邀请按钮，分享信息登记邀请页面</view>
				<view class="cu-bar bg-white justify-center">
					<view class="action">
						<!-- <button class="cu-btn line-green text-green" @tap="showShareButton=false">取消</button> -->
						<button class="bg-green cu-btn lg" v-if="showShareButton" open-type="share">邀请绑定</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
// import {Function,evaluate} from '@/common/eval5.js';
import evaluatorTo from '@/common/evaluator.js';
export default {
	components: { bxform },
	data() {
		return {
			type: 'add',
			serviceName: '',
			fields: [],
			procBasicConfig: {},
			colsV2Data: {},
			isTouchs: false,
			defaultCondition: [],
			showShareButton: false,
			proc_instance_no: '',
			hasSubmit: false,
			optionQuery: ''
		};
	},
	methods: {
		onShareAppMessage(res) {
			console.log(res.target.dataset.procno, 'onShareAppMessage');
			return {
				title: '绑定住户邀请',
				path: '/pages/specific/shareBind/shareBind?proc_instance_no=' + this.proc_instance_no
			};
			// return {
			// 	title: '绑定住户邀请',
			// 	path: '/pages/public/proc/apply/apply?serviceName=srvzhxq_guest_mgmt_add'
			// };
		},
		radioBenRen(e) {
			console.log('本人信息-------', e, this.fields);
			// let fields = this.allField;
			// fields.forEach((item, index) => {
			// 	if (item.formulaShow) {
			// 		let isIfShow = evaluatorTo(row, item.formulaShow);
			// 		item.display = isIfShow;
			// 		this.$set(this.fields, index, item);
			// 	}
			// });
		},
		toList() {
			let isOwner = uni.getStorageSync('is_owner');
			let serviceName = this.serviceName;
			let query = {};
			let viewTemp = {
				title: 'xm',
				tip: '',
				img: null,
				price: 'proc_status',
				footer: 'create_time'
			};
			let leftTempWord = {
				title: '身份证号',
				tip: '联系电话',
				footer: '访问时间',
				title_col: 'zjhm',
				tip_col: 'lxdh',
				footer_col: 'create_time'
			};
			if (serviceName.indexOf('zhxq_repairs') !== -1) {
				viewTemp.title = 'fwbm';
			}
			if (serviceName.indexOf('zhxq_guest_mgmt') !== -1 || serviceName.indexOf('zhxq_repairs') !== -1 || serviceName.indexOf('zhxq_syrk')) {
				if (serviceName.indexOf('zhxq_guest_mgmt') !== -1 && !isOwner) {
					leftTempWord.title = '访问地址';
				}
				if (serviceName.indexOf('zhxq_syrk') !== -1) {
					leftTempWord = {
						title: '人员类型',
						tip: '身份证号',
						footer: '联系电话',
						title_col: 'rylx',
						tip_col: 'gmsfhm',
						footer_col: 'lxfs'
					};
				}
				if (serviceName.indexOf('zhxq_repairs') !== -1) {
					leftTempWord = {
						title: '保修类型',
						tip: '联系电话',
						footer: '保修内容',
						title_col: 'type',
						tip_col: 'lxdh',
						footer_col: 'remark'
					};
				}
				if (serviceName.indexOf('zhxq_member_fuwu') !== -1) {
					leftTempWord = {
						title: '职业',
						tip: '联系电话',
						footer: '申请时间',
						title_col: 'zhiye',
						tip_col: 'lxdh',
						footer_col: 'create_time'
					};
				}
				if (serviceName.indexOf('zhxq_clgl') !== -1) {
					leftTempWord = {
						title: '车牌号',
						tip: '车辆类型',
						footer: '车辆颜色',
						title_col: 'cphm',
						tip_col: '_cllx_disp',
						footer_col: '_csys_disp'
					};
				}
				query = {
					serviceName: serviceName,
					viewTemp: viewTemp,
					destApp: 'zhxq',
					leftTempWord: leftTempWord
				};
			}

			uni.navigateTo({
				url: '/pages/public/proc/procList/procList?query=' + encodeURIComponent(JSON.stringify(query))
			});
		},
		async submitData() {
			let serviceName = this.serviceName;
			console.log('service_name', serviceName);
			let itemData = this.$refs.bxForm.getFieldModel();
			console.log('itemData', itemData);
			if (!itemData) {
				return;
			} else {
				Object.keys(itemData).forEach(item => {
					if (item == 'openid' && itemData['is_benren'] == '本人信息') {
						itemData[item] = uni.getStorageSync('login_user_info').user_no;
					}
				});
				if (serviceName == 'srvzhxq_member_fuwu_add') {
					Object.keys(itemData).forEach(item => {
						if (item == 'openid') {
							itemData[item] = uni.getStorageSync('login_user_info').user_no;
						}
					});
				}
				if (!itemData['child_data_list']) {
					itemData['child_data_list'] = [];
				}
				let req = [
					{
						data: [itemData],
						serviceName: this.serviceName
					}
				];
				console.log(req, 'req');
				let res = await this.onRequest('apply', this.serviceName, req, uni.getStorageSync('activeApp'));
				if (res.data.state === 'SUCCESS') {
					let resData = res.data.data[0];
					uni.showToast({
						title: res.data.resultMessage,
						icon: 'none'
					});
					if (itemData.is_benren && itemData.is_benren === '他人信息') {
						this.showShareButton = true;
						if (resData.proc_instance_no) {
							this.proc_instance_no = resData.proc_instance_no;
						}
						this.hasSubmit = true;
						return;
					}
					uni.showModal({
						title: '提示',
						content: '申请成功',
						showCancel: false,
						success(res) {
							if (res.confirm) {
								if (serviceName.indexOf('_add')) {
									serviceName = serviceName.replace('_add', '_select');
								}
								let queryObj = {
									serviceName: serviceName,
									proc_instance_no: resData.proc_instance_no
								};
								console.log('queryObj', queryObj);
								// uni.redirectTo({
								//   url:'../procList/procList?query=' + JSON.stringify(queryObj)
								// })
								uni.redirectTo({
									url: '../procDetail/procDetail?query=' + JSON.stringify(queryObj)
								});
							}
						}
					});
				}
			}
		},
		async getBasicCfg() {
			// srvprocess_basic_cfg_select 流程初始化数据查询
			let serviceName = this.serviceName;
			let req = { serviceName: 'srvprocess_basic_cfg_select', colNames: ['*'], condition: [{ colName: 'service_name', ruleType: 'eq', value: serviceName }] };
			let res = await this.onRequest('select', 'srvprocess_basic_cfg_select', req, uni.getStorageSync('activeApp'));
			if (res.data.state === 'SUCCESS') {
				this.procBasicConfig = res.data;
			}
		},
		async getWyUserInfo() {
			let user_no = uni.getStorageSync('login_user_info').user_no;
			let urls = this.getServiceUrl('zhxq', 'srvzhxq_member_fuwu_select', 'select');
			let reqs = {
				serviceName: 'srvzhxq_member_fuwu_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'create_user',
						ruleType: 'eq',
						value: user_no
					},
					{
						colName: 'proc_status',
						ruleType: 'eq',
						value: '完成'
					},
					{
						colName: 'is_open',
						ruleType: 'eq',
						value: '是'
					},
					{
						colName: 'zhiye',
						ruleType: 'eq',
						value: '物业管理人员'
					}
				]
			};
			let ress = await this.$http.post(urls, reqs);

			return ress.data.data[0];
		},
		async getColV2() {
			let colVs = await this.getServiceV2(this.serviceName, this.type, this.type, uni.getStorageSync('activeApp'));
			this.colsV2Data = colVs;
			let type = this.type;
			console.log('colsV2Data', colVs);
			if (!this.navigationBarTitle) {
				uni.setNavigationBarTitle({
					title: colVs.service_view_name
				});
			}
			let fields = [];
			switch (type) {
				case 'update':
					fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
					break;
				case 'add':
					let bas = await this.getBasicsInfo();
					if (!uni.getStorageSync('activeApp') || uni.getStorageSync('activeApp') == 'zhxq') {
						let date = this.getDayDate(new Date(), 'all');
						if (this.optionQuery.serviceName == 'srvzhxq_guest_mgmt_add') {
							let shareConds = [
								{
									colName: 'fwrq',
									ruleType: 'eq',
									value: date
								},
								{
									colName: 'xm',
									ruleType: 'eq',
									value: bas.real_name
								},
								{
									colName: 'lxdh',
									ruleType: 'eq',
									value: bas.tel
								},
								{
									colName: 'zjhm',
									ruleType: 'eq',
									value: bas.picp
								},
								{
									colName: 'sex',
									ruleType: 'eq',
									value: bas.gender
								}
							];
							console.log('shareConds', shareConds);
							this.defaultCondition = shareConds;
						}
					}
					if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs._fieldInfo && Array.isArray(colVs._fieldInfo)) {
						let arr = [];
						let row = {};
						this.defaultCondition.forEach(cond => {
							colVs._fieldInfo.forEach(field => {
								if (cond.colName === field.column && field.bx_col_type !== 'fk') {
									field['value'] = cond['value'];
									if (field['value']) {
										field['disabled'] = false;
									}
								}
								row[field.column] = field.value;
							});
						});
						colVs._fieldInfo.forEach(fileIf => {
							if (fileIf.formulaShow) {
								let isIfShow = evaluatorTo(row, fileIf.formulaShow);
								fileIf.display = isIfShow;
							}
						});
					}
					fields = colVs._fieldInfo;
					break;
				case 'detail':
					fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
					break;
				default:
					break;
			}
			console.log('fields:', fields, type);
			if (fields && Array.isArray(fields)) {
				fields = fields.filter((item, index) => {
					if (!item.value) {
						item.value = '';
					}
					if (item.column === 'activity_no') {
						item['disabled'] = true;
					}
					if (item['in_' + type] === 1 || item['in_' + type] === 2) {
						return item;
					}
				});
				console.log('this.fields ', fields);
				this.fields = fields;
			}
		}
	},
	onLoad(option) {
		if (uni.getStorageSync('activeApp') == 'zhxq') {
			this.getWyUserInfo().then(wy => {
				if (wy) {
					uni.setStorageSync('isWy', true);
				} else {
					uni.setStorageSync('isWy', false);
				}
			});
		}
		this.optionQuery = option;
		console.log('---onLoad--------', option);
		let date = this.getDayDate(new Date(), 'all');
		let userInfo = uni.getStorageSync('infoObj');
		let basicInfo = uni.getStorageSync('basics_info');
		let query = {};
		if (!option.query) {
			query = option;
		} else {
			query = JSON.parse(decodeURIComponent(option.query));
		}
		if (query) {
			// query = JSON.parse(decodeURIComponent(option.query));
			if (query.cond) {
				let conds = JSON.parse(query.cond);
				conds.forEach(item => {
					if (item.colName === 'fwrq' && (item.value === 'dateTime' || item.value === 'date')) {
						item.value = item.value === 'dateTime' ? this.getDayDate(new Date(), 'all') : this.getDayDate(new Date());
					}
					if (item.colName === 'fwbm') {
						item.value = userInfo.fwbm;
					}
					if (item.colName === 'dybm') {
						item.value = userInfo.dybm;
					}
					if (item.colName === 'lybm') {
						item.value = userInfo.lybm;
					}
					if (item.colName === 'lxdh') {
						item.value = userInfo.lxfs;
					}
					if (uni.getStorageSync('activeApp') == 'zhxq') {
						if (item.colName === 'xm' || item.colName === 'glry') {
							item.value = basicInfo.real_name;
						}
						if (item.colName === 'lxfs' || item.colName === 'lxdh') {
							item.value = basicInfo.tel;
						}
						if (item.colName === 'gmsfhm' || item.colName === 'zjhm') {
							item.value = basicInfo.picp;
						}
						if (item.colName == 'sex') {
							item.value = basicInfo.gender;
						}
					}
				});
				this.defaultCondition = conds;
			}
		}

		if (query.serviceName) {
			this.serviceName = query.serviceName;
		}
	},
	onShow() {
		if (this.serviceName) {
			this.selectInfoFromMember().then(result => {
				this.getBasicCfg().then(_ => {
					this.getColV2().then(_ => {
						if (!uni.getStorageSync('activeApp') || uni.getStorageSync('activeApp') == 'zhxq') {
							if (!!result) {
							}
						}
					});
				});
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.form-wrap {
	min-height: calc(100vh - 100upx);
	.cu-modal {
		text-align: center;
		.cu-dialog {
			height: auto;
		}
	}
}
.apply_button_bot {
	padding: 15px;
	display: flex;
	justify-content: space-around;
	background-color: #fff;
}
.bg-green {
	background-color: #0bc99d;
	flex: 1;
	margin-left: 20rpx;
	&:first-child {
		margin-left: 0rpx;
	}
}
</style>
