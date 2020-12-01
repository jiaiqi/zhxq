<template>
	<view>
		<bxform
			:service="serviceName"
			ref="bxForm"
			:pageType="type"
			:BxformType="type"
			:fields="fields"
			:moreConfig="colsV2Data && colsV2Data.more_config ? colsV2Data.more_config : null"
		></bxform>
		<bxButtons :buttons="buttons" @on-button-change="onButton($event)"></bxButtons>
	</view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
import bxButtons from '@/components/bx-buttons/bx-buttons.vue';
export default {
	components: { bxform, bxButtons },
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
			} else if (this.colsV2Data && this.colsV2Data._formButtons) {
				buttons = this.colsV2Data._formButtons;
			}
			let data = {};
			this.fields.forEach(item => {
				data[item['column']] = item['value'];
			});
			let fieldModel = data;
			console.log(data, 'getDetailfieldModel');

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
	onShow() {
		// #ifdef MP-WEIXIN
		this.getWxUserInfo();
		// #endif
	},
	onLoad(option) {
		if (!option) {
			return;
		}
		let query = JSON.parse(decodeURIComponent(option.query ? option.query : option.params ? option.params : option));
		const destApp = query.destApp;
		if (destApp) {
			uni.setStorageSync('activeApp', destApp);
		}
		if (query.params) {
			this.params = JSON.parse(query.params);
		}
		if (option.params) {
			this.params = query;
		}
		let cond = '';
		if (typeof option.cond === 'string' && option.cond) {
			cond = JSON.parse(option.cond);
		}
		this.defaultCondition = cond;
		if (query.cond || query.condition) {
			let cond = '';
			if (typeof query.cond === 'string' && query.cond) {
				cond = JSON.parse(query.cond);
			}
			if (typeof query.condition === 'object') {
				cond = query.condition;
			}
		}
		if (option.hasOwnProperty('loadedType')) {
			this.loadedType = option.loadedType;
		} else if (option.hasOwnProperty('params')) {
			this.serviceName = this.params.serviceName;
			this.type = this.params.type;
			this.condition = this.params.condition;
			this.defaultVal = this.params.defaultVal;
			this.getFieldsV2();
		} else if (query.serviceName && query.type) {
			this.serviceName = query.serviceName;
			this.type = query.type;
			this.getFieldsV2();
		} else {
			uni.showToast({
				title: '加载错误',
				icon: 'none'
			});
		}
	},
	methods: {
		getWxUserInfo() {
			// 检测是否有userInfo授权
			let userInfo = uni.getStorageSync('login_user_info');
			let self = this;
			wx.getSetting({
				success(res) {
					if (!res.authSetting['scope.userInfo']) {
						uni.showModal({
							title: '提示',
							content: '您还未授权获取用户信息,点击确定按钮跳转到授权页面',
							success(res) {
								uni.setStorageSync('isToLogin', true);
								if (res.confirm) {
									self.judgeClientEnviroment();
									uni.navigateTo({
										url: '/pages/public/accountExec/accountExec'
									});
								} else {
									uni.setStorageSync('isToLogin', false);
								}
							}
						});
					} else {
						wx.authorize({
							scope: 'scope.userInfo',
							success() {
								// 用户已经授权访问用户信息
								wx.getUserInfo({
									success: function(infoRes) {
										let resData = [
											{
												colName: 'openid',
												value: userInfo.user_no
											},
											{
												colName: 'nick_name',
												value: infoRes.userInfo.nickName
											},
											{
												colName: 'avatar',
												value: infoRes.userInfo.avatarUrl
											},
											{
												colName: 'gender',
												value: infoRes.userInfo.gender
											},
											{
												colName: 'country',
												value: infoRes.userInfo.country
											},
											{
												colName: 'province',
												value: infoRes.userInfo.province
											},
											{
												colName: 'city',
												value: infoRes.userInfo.city
											}
										];
										self.defaultCondition = resData;
										uni.setStorageSync('wxuserinfo', infoRes.userInfo);
										self.getWxUserInfo(infoRes.userInfo);
									}
								});
							}
						});
					}
				}
			});
		},

		async addInfoIntoMember() {
			let userInfo = uni.getStorageSync('login_user_info');
			let wxUserInfo = uni.getStorageSync('wxuserinfo');
			let url = this.getServiceUrl('zhxq', 'srvzhxq_member_add', 'add');
			let req = [
				{
					serviceName: 'srvzhxq_member_add',
					condition: [],
					data: [
						{
							openid: userInfo.user_no,
							nick_name: wxUserInfo.nickName,
							avatar: wxUserInfo.avatarUrl,
							gender: wxUserInfo.gender,
							country: wxUserInfo.country,
							province: wxUserInfo.province,
							city: wxUserInfo.city,
							// phone_number: '',
							real_name: userInfo.real_name,
							// tel: '',
							// picp: '' ,//身份证号
							head_img: userInfo.headimgurl
						}
					]
				}
			];
			let res = await this.$http.post(url, req);
		},
		getFieldsV2: async function() {
			let app = uni.getStorageSync('activeApp');
			let colVs = await this.getServiceV2(this.serviceName, this.type, this.type, app);
			uni.setNavigationBarTitle({
				title: colVs.service_view_name
			});
			this.colsV2Data = colVs;
			switch (this.type) {
				case 'update':
					if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs._fieldInfo && Array.isArray(colVs._fieldInfo)) {
						console.log('this.defaultCondition', this.defaultCondition, colVs._fieldInfo);
						let arr = [];
						this.defaultCondition.forEach(cond => {
							colVs._fieldInfo.forEach(field => {
								if (cond.colName === field.column && field.isRequire !== true) {
									field['value'] = cond['value'];
									field['disabled'] = true;
									field['display'] = false;
									field['showExp'] = false;
								} else if (cond.colName === field.column && field.isRequire === true) {
									field['value'] = cond['value'];
								}
							});
						});
					}
					this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.params.defaultVal);
					break;
				case 'add':
					if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs._fieldInfo && Array.isArray(colVs._fieldInfo)) {
						console.log('this.defaultCondition', this.defaultCondition, colVs._fieldInfo);
						let arr = [];
						this.defaultCondition.forEach(cond => {
							colVs._fieldInfo.forEach(field => {
								if (cond.colName === field.column && field.isRequire !== true) {
									field['value'] = cond['value'];
									field['disabled'] = true;
									field['display'] = false;
									field['showExp'] = false;
								} else if (cond.colName === field.column && field.isRequire === true) {
									field['value'] = cond['value'];
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
		async checkBasicInfo(name, id) {
			// 以姓名和身份证号检测当前登录用户是否已经登记过居住信息
			let url = this.getServiceUrl('zhxq', 'srvzhxq_member_front_select', 'select');
			let req = {
				serviceName: 'srvzhxq_member_front_select',
				colNames: ['*'],
				condition: [{ colName: 'real_name', ruleType: 'like', value: name }, { colName: 'picp', ruleType: 'like', value: id }]
			};
			let res = await this.$http.post(url, req);
			console.log('checkBasicInfo', res);
			if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
				return res.data.data[0];
			} else {
				return false;
			}
		},
		async checkHouseInfo(xm, gmsfhm) {
			// 以姓名和身份证号检测当前登录用户是否已经登记过居住信息
			let url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
			let req = {
				serviceName: 'srvzhxq_syrk_select',
				colNames: ['*'],
				condition: [{ colName: 'xm', ruleType: 'like', value: xm }, { colName: 'gmsfhm', ruleType: 'like', value: gmsfhm }]
			};
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
				return true;
			} else {
				return false;
			}
		},
		async updateHouseInfo(xm, gmsfhm, openid) {
			let self = this;
			// 将当前帐号user_no的值赋给居住信息中和当前填写的姓名&身份证号相同的数据的openid字段
			let url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_update', 'operate');
			let req = [
				{
					serviceName: 'srvzhxq_syrk_update',
					condition: [{ colName: 'xm', ruleType: 'like', value: xm }, { colName: 'gmsfhm', ruleType: 'like', value: gmsfhm }],
					data: [{ openid: openid }]
				}
			];
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				uni.showModal({
					title: '提示',
					content: '绑定成功',
					showCancel: false,
					confirmColor: '#0BC99D',
					success(res) {
						if (res.confirm) {
							uni.navigateBack();
						}
					}
				});
				return true;
			} else {
				uni.showModal({
					title: '提示',
					content: '绑定失败，是否重试?',
					success(res) {
						if (res.confirm) {
							self.updateHouseInfo(xm, gmsfhm, openid);
						} else {
							uni.navigateBack();
						}
					}
				});
				return false;
			}
		},
		async onButton(e) {
			let req = this.$refs.bxForm.getFieldModel();
			let self = this;
			console.log(e, req);
			switch (e.button_type) {
				case 'edit':
					if (e.page_type === '详情') {
					} else {
						if (req) {
							req = [{ serviceName: e.service_name, data: [req], condition: this.condition }];
							let app = uni.getStorageSync('activeApp');
							let url = self.getServiceUrl(app, e.service_name, 'add');
							self.onRequest('update', e.service_name, req).then(res => {
								console.log('res:' + e.service_name, res);
								if (res.data.state === 'SUCCESS') {
									let resData = self.getResData(res.data.response);
									console.log('resData', resData);
									uni.showModal({
										title: '提示',
										content: '修改成功',
										confirmText: '返回',
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
					if (req) {
						let name = req.real_name;
						let id = req.picp;
						let openid = uni.getStorageSync('login_user_info').user_no;
						let hasBasicInfo = await self.checkBasicInfo(name, id);
						if (hasBasicInfo && typeof hasBasicInfo === 'object' && Object.keys(hasBasicInfo).length > 0) {
							uni.showModal({
								title: '提示',
								content: '检测到系统中已存在您的基础信息，是否将此信息关联到当前账号',
								confirmText: '关联信息',
								success(res) {
									if (res.confirm) {
										uni.showModal({
											title: '提示',
											content: '基础信息只能提交一次，本次提交后将不能再更改，是否确定提交?',
											success(res) {
												if (res.confirm) {
													// TODO 根据身份证号和姓名查询基础信息表，如果已存在，提示是否关联用户信息
													let app = uni.getStorageSync('activeApp');
													let url = self.getServiceUrl(app, e.service_name, 'add');
													if (hasBasicInfo !== false) {
														// update
														url = self.getServiceUrl(app, e.service_name.replace('_add', '_update'), 'operate');
														req = [{ serviceName: e.service_name.replace('_add', '_update'), condition: [{ colName: 'id', ruleType: 'eq', value: hasBasicInfo.id }], data: [req] }];
													} else {
														req = [{ serviceName: e.service_name, data: [req] }];
													}
													console.log(url, e, req);
													self.$http.post(url, req).then(res => {
														// console.log("==============>>>>>>",url, res.data);
														uni.setStorageSync('basics_info', res.data?.response[0]?.response?.effect_data[0]);
														if (res.data.state === 'SUCCESS') {
															uni.showModal({
																title: '提示',
																content: hasBasicInfo === false ? '登记成功' : '关联成功',
																showCancel: false,
																success(res) {
																	self.wxLogin();
																	if (res.confirm) {
																		// uni.setStorageSync("basics_info",hasBasicInfo)
																		self.checkHouseInfo(name, id).then(result => {
																			if (result) {
																				uni.showModal({
																					title: '提示',
																					content: '检测到系统中已存在您的住房信息，是否将住房信息绑定到当前帐号',
																					cancelText: '不绑定',
																					confirmText: '绑定',
																					confirmColor: '#0BC99D',
																					success(res) {
																						if (res.confirm) {
																							self.updateHouseInfo(name, id, openid).then(_ => {});
																						} else {
																							uni.navigateBack();
																						}
																					}
																				});
																			} else {
																				uni.navigateBack({
																					delta: 1
																				});
																			}
																		});
																	}
																}
															});
														}
													});
												} else if (res.cancel) {
													// 不提交
												}
											}
										});
									} else if (res.cancel) {
										// 不关联信息
										// uni.showToast({
										// 	title:"",
										// 	icon:'none'
										// })
									}
								}
							});
						} else {
							uni.showModal({
								title: '提示',
								content: '基础信息只能提交一次，本次提交后将不能再更改，是否点击确定提交?',
								success(res) {
									if (res.confirm) {
										self.checkBasicInfo(name, id).then(res => {
											if (res !== false) {
											}
										});
										// TODO 根据身份证号和姓名查询基础信息表，如果已存在，提示是否关联用户信息
										req = [{ serviceName: e.service_name, data: [req] }];
										let app = uni.getStorageSync('activeApp');
										let url = self.getServiceUrl(app, e.service_name, 'add');
										console.log(url, e);
										self.$http.post(url, req).then(res => {
											console.log(url, res.data);
											if (res.data.state === 'SUCCESS') {
												console.log('res.data', res.data.response[0].response.effect_data[0]);
												uni.setStorageSync('basics_info', res.data?.response[0]?.response?.effect_data[0]);
												uni.showModal({
													title: '提示',
													content: '登记成功',
													showCancel: false,
													success(res) {
														if (res.confirm) {
															self.wxLogin();
															self.checkHouseInfo(name, id).then(result => {
																if (result) {
																	uni.showModal({
																		title: '提示',
																		content: '检测到系统中已存在您的住房信息，是否将住房信息绑定到当前帐号',
																		cancelText: '不绑定',
																		confirmText: '绑定',
																		confirmColor: '#0BC99D',
																		success(res) {
																			if (res.confirm) {
																				self.updateHouseInfo(name, id, openid).then(_ => {});
																			} else {
																				uni.navigateBack();
																			}
																		}
																	});
																} else {
																	uni.navigateBack({
																		delta: 1
																	});
																}
															});
														}
													}
												});
											}
										});
									} else if (res.cancel) {
										//不提交
									}
								}
							});
						}
					}
					break;
				case 'reset':
					let res = self.$refs.bxForm.onReset();
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
						const url = self.getServiceUrl(e.application, e.operate_service, 'operate');
						const req = [
							{
								data: [e.requestData],
								serviceName: e.operate_service,
								srvApp: e.application
							}
						];
						let res = await self.$http.post(url, req);
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
		}
	}
};
</script>

<style></style>
