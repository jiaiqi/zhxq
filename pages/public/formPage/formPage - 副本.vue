<template>
	<view>
		<!-- <cu-custom bgColor="bg-gradual-blue" :isBack="true"> -->
		<!-- <block slot="backText">返回</block> -->
		<!-- <block slot="content" v-if="colsV2Data && colsV2Data.service_view_name">{{ colsV2Data.service_view_name }}</block> -->
		<!-- </cu-custom> -->
		<bxform
			:service="serviceName"
			ref="bxForm"
			:pageType="type"
			:defaultCondition="defaultCondition"
			:BxformType="type"
			:fields="fields"
			:moreConfig="colsV2Data && colsV2Data.more_config ? colsV2Data.more_config : null"
		></bxform>
		<bxButtons :buttons="buttons" @on-button-change="onButton($event)"></bxButtons>
		<!-- <button class="bg-green cu-btn lg">查看列表</button> -->
	</view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
import bxButtons from '@/components/bx-buttons/bx-buttons.vue';
export default {
	components: { bxform, bxButtons },
	props: {
		// serviceName:{
		// 	type:String,
		// 	default() {
		// 		return '';
		// 	}
		// },
		// type:{
		// 	type:String,
		// 	default(){
		// 		return ''; // add || update || detail
		// 	}
		// },
		// loadedType:{
		// 	type:String,
		// 	default(){
		// 		return "srvV2"; // srvV2 : 加载 serviceName v2 配置数据。
		// 	}
		// }
	},
	data() {
		return {
			fields: [],
			loadedType: 'srvV2',
			colsV2Data: null,
			type: '',
			serviceName: '',
			condition: [],
			defaultCondition: [],
			params: {}
		};
	},
	computed: {
		buttons: function() {
			let buttons = [];
			if (this.colsV2Data && this.colsV2Data._buttonInfo) {
				buttons = this.colsV2Data._buttonInfo;
				// return this.colsV2Data._buttonInfo;
			} else if (this.colsV2Data && this.colsV2Data._formButtons) {
				buttons = this.colsV2Data._formButtons;
				// return this.colsV2Data._formButtons;
			}
			let data = {};
			if (Array.isArray(this.fields)) {
				this.fields.forEach(item => {
					data[item['column']] = item['value'];
				});
				let fieldModel = data;
				console.log(data, 'getDetailfieldModel');
			}

			buttons.forEach(btn => {
				if (btn.disp_exps) {
					btn['display'] = eval(btn.disp_exps);
				}
				if (btn.operate_params) {
					let fieldData = btn.operate_params['data'];
					if (fieldData && Array.isArray(fieldData) && fieldData.length > 0) {
						fieldData = fieldData[0];
						let newData = {};
						Object.keys(fieldData).forEach(data_item => {
							let item = fieldData[data_item];
							if (item.value_type && item.value_type === 'rowData') {
								newData[data_item] = fieldModel[item.value_key];
							}
						});
						btn['requestData'] = newData;
						btn['requestCondition'] = this.condition;
					}
				}
			});
			return buttons;
		}
	},
	created() {
		// #ifdef H5
		const destApp = this.$route.query.destApp;
		if (destApp) {
			uni.setStorageSync('activeApp', destApp);
		}
		// #endif
	},
	onLoad(option) {
		let query = JSON.parse(decodeURIComponent(option.query ? option.query : option.params ? option.params : '{}'));
		console.log('---------', option);
		const destApp = query.destApp;
		if (destApp) {
			uni.setStorageSync('activeApp', destApp);
		}
		if (option.serviceName) {
			query = option;
		}
		if (query.params) {
			this.params = JSON.parse(query.params);
		}
		if (option.params) {
			this.params = query;
		}
		if (query.cond || query.condition) {
			let cond = '';
			if (typeof query.cond === 'string' && query.cond) {
				cond = JSON.parse(query.cond);
			}
			if (typeof query.condition === 'object') {
				cond = query.condition;
			}
			if (query.serviceName == 'srvzhxq_clgl_add') {
				this.getUserInfo().then(u => {
					cond.forEach(con => {
						if (con.colName === 'glry' && con.value === 'user_no') {
							con.value = uni.getStorageSync('login_user_info').user_no;
						} else {
							con.value = u[con.colName];
						}
					});
					this.defaultCondition = cond;
					this.getFieldsV2();
					console.log('this.defaultCondition', this.defaultCondition);
				});
			}
		}
		if (option.hasOwnProperty('loadedType')) {
			this.loadedType = option.loadedType;
		} else if (option.hasOwnProperty('params')) {
			this.serviceName = this.params.serviceName;
			this.type = this.params.type;
			this.condition = this.params.condition;
			this.defaultVal = this.params.defaultVal;
			let cond = [];
			if (this.params.cond && Array.isArray(this.params.cond)) {
				cond = this.params.cond;
			}
			this.getFieldsV2(cond);
		} else if (query.serviceName && query.type) {
			this.serviceName = query.serviceName;
			this.type = query.type;
			if(option.hasOwnProperty('cond')){
				try{
					this.condition = JSON.parse(decodeURIComponent(option.cond))
				}catch(e){
					//TODO handle the exception
					console.log(e)
				}
			}
			this.getFieldsV2();
		} else {
			uni.showToast({
				title: '加载错误',
				icon: 'none'
			});
		}
	},

	methods: {
		getFieldsV2: async function(condition) {
			let app = uni.getStorageSync('activeApp');
			let colVs = await this.getServiceV2(this.serviceName, this.type, this.type, app);
			if(!this.navigationBarTitle){
				uni.setNavigationBarTitle({
					title:colVs.service_view_name
				})
			}
			this.colsV2Data = colVs;
			let self = this;
			switch (this.type) {
				case 'update':
				//
				//       this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.params.defaultVal);
				//       break;
				case 'add':
					if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs._fieldInfo && Array.isArray(colVs._fieldInfo)) {
						console.log('this.defaultCondition', this.defaultCondition, colVs._fieldInfo);
						let arr = [];
						this.defaultCondition.forEach(cond => {
							colVs._fieldInfo.forEach(field => {
								if (cond.colName === field.column) {
									field['value'] = cond['value'];
									field['disabled'] = true;
								}
							});
						});
					}
					if (condition && Array.isArray(condition)) {
						condition.forEach(item => {
							colVs._fieldInfo.forEach(field => {
								if (field.column === item.colName) {
									field.condition = item.value;
								}
								if (typeof item.value !== 'string' && Array.isArray(item.value)) {
									item.value.forEach(cond => {
										if (cond.colName === cond.value && field.column === cond.value) {
											field['display'] = false;
										}
									});
								}
								if (this.params.defaultVal) {
									 // 赋默认值
									if (
										field.column === 'xm' &&
										self.params.defaultVal['real_name'] &&
										self.params.eventOrigin &&
										(self.params.eventOrigin.service === 'srvzhxq_member_front_select' || self.params.eventOrigin.service_name === 'srvzhxq_syrk_wuye_add')
									) {
										// 如果是从人员登记列表进入的
										field.value = self.params.defaultVal['real_name'];
										field.disabled = true;
									}
									if (field.column === 'gmsfhm' && self.params.defaultVal['picp']) {
										field.value = self.params.defaultVal['picp'];
										field.disabled = true;
									}
									if (field.column === 'sex' && self.params.defaultVal['gender']) {
										field.value = self.params.defaultVal['gender'];
										// field.disabled = true;
									}
									if (field.column === 'openid' && self.params.defaultVal['openid']) {
										field.value = self.params.defaultVal['openid'];
										field.disabled = true;
									}
									if (field.column === 'person_no' && self.params.defaultVal['person_no']) {
										field.value = self.params.defaultVal['person_no'];
										// field.disabled = true;
									}
									if (field.column === 'lxfs' && self.params.defaultVal['tel']) {
										field.value = self.params.defaultVal['tel'];
										// field.disabled = true;
									}
									if (field.column === 'zp' && self.params.defaultVal['head_img']) {
										field.value = self.params.defaultVal['head_img'];
										// field.disabled = true;
									}
								}
							});
						});
					}
					this.fields = colVs._fieldInfo;
					break;
				case 'detail':
					this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.params.defaultVal);
					break;
				default:
					break;
			}
		},
		async onButton(e) {
			let req = this.$refs.bxForm.getFieldModel();
				console.log(this.condition)
			if ((e.service_name == 'srvzhxq_syrk_wuye_add' || e.service_name == 'srvzhxq_syrk_add') && (!req.proc_status || req.proc_status != '完成') && req) {
				req.proc_status = '完成';
			}
			console.log(e, req);
			switch (e.button_type) {
				case 'edit':
					if (e.page_type === '详情') {
					} else {
						if (req) {
							req = [{ serviceName: e.service_name, data: [req], condition: this.condition }];
							let app = uni.getStorageSync('activeApp');
							let url = this.getServiceUrl(app, e.service_name, 'add');
							this.onRequest('update', e.service_name, req).then(res => {
								console.log('res:' + e.service_name, res);
								if (res.data.state === 'SUCCESS') {
									let resData = this.getResData(res.data.response);
									console.log('resData', resData);
									uni.showModal({
										title: '提示',
										content: '修改成功',
										showCancel: false,
										success(res) {
											if (res.confirm) {
												uni.navigateBack();
											}
										}
									});
								}
							});
						}
					}
					break;
				case 'submit':
					console.log('addServiceName:', e.service_name);
					if (req) {
						req = [{ serviceName: e.service_name, data: [req] }];
						let app = uni.getStorageSync('activeApp');
						let url = this.getServiceUrl(app, e.service_name, 'add');
						console.log(url, e);
						let res = await this.$http.post(url, req);
						console.log(url, res.data);
						if (res.data.state === 'SUCCESS') {
							uni.showModal({
								title: '提示',
								content: '添加成功',
								showCancel: false,
								success(res) {
									if (res.confirm) {
										uni.navigateBack();
									}
								}
							});
						}
					}
					break;
				case 'reset':
					let res = this.$refs.bxForm.onReset();
					if (res) {
						uni.showToast({
							title: '已重置'
						});
					} else {
						uni.showToast({
							title: '无效操作'
						});
					}
					break;
				case 'customize':
					if (e.application && e.operate_service) {
						const url = this.getServiceUrl(e.application, e.operate_service, 'operate');
						const req = [
							{
								data: [e.requestData],
								serviceName: e.operate_service,
								srvApp: e.application
							}
						];
						let res = await this.$http.post(url, req);
						if (res.data.state === 'SUCCESS') {
							uni.showModal({
								title: '提示',
								content: e.tip_msg ? e.tip_msg : res.data.resultMessage,
								showCancel: false,
								success(res) {
									if (res.confirm) {
										setTimeout(() => {
											uni.navigateBack();
										}, 2000);
									}
								}
							});
						} else {
							uni.showToast({
								title: res.data.resultMessage,
								mask: false,
								icon: 'none'
							});
						}
					}
					// const url = this.getServiceUrl(e.application, e.operate_service, 'operate');
					// const req = [
					//   {
					//     data: [e.requestData],
					//     serviceName: e.operate_service,
					//     srvApp: e.application
					//   }
					// ];
					// let res = await this.$http.post(url, req);
					break;
				default:
					uni.showToast({
						title: e.button_name
					});
					break;
			}
		},
		async getUserInfo() {
			let user_no = uni.getStorageSync('basics_info').picp;
			let urls = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
			let reqs = {
				serviceName: 'srvzhxq_syrk_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'gmsfhm',
						ruleType: 'eq',
						value: user_no
					},
					{
						colName: 'proc_status',
						ruleType: 'eq',
						value: '完成'
					},
					{
						colName: 'status',
						ruleType: 'eq',
						value: '有效'
					}
				]
				// order: [{ colName: 'seq', orderType: 'asc' }] ,
			};
			let ress = await this.$http.post(urls, reqs);
			console.log('------------', ress);
			return ress.data.data[0];
		}
	}
};
</script>

<style></style>
