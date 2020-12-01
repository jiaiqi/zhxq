<template>
	<view>
		<view class="tip">
			<text class="text-red">*</text>
			请检查以下信息是否跟您本人信息匹配，确定信息匹配后请点击确定按钮{{
				serviceName && (serviceName === 'srvzhxq_member_update' || serviceName === 'srvzhxq_member_select') ? '绑定您的基本信息' : '登记您的入住信息'
			}}
		</view>
		<bxform
			:service="serviceName"
			ref="bxForm"
			:pageType="type"
			:BxformType="type"
			:fields="fields"
			:moreConfig="colsV2Data && colsV2Data.more_config ? colsV2Data.more_config : null"
		></bxform>
		<view class="button-box" v-if="fields && fields.length > 0"><button class="bg-green cu-btn lg" @click="confirmInfo">确认</button></view>
	</view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
export default {
	components: { bxform },
	data() {
		return {
			fields: [],
			colsV2Data: null,
			type: 'detail',
			serviceName: '',
			condition: [],
			proc_instance_no: '',

			dataid: ''
		};
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
		if (option.proc_instance_no) {
			this.proc_instance_no = option.proc_instance_no;
			this.getFieldsV2();
		}
		if (option.dataid && option.serviceName) {
			this.serviceName = option.serviceName;
			this.dataid = option.dataid;
			this.getFieldsV2();
		}
	},
	methods: {
		async getV2Data() {
			let url = this.getServiceUrl('zhxq', 'srvsys_service_columnex_v2_select', 'select');
			let serviceName = 'srvzhxq_syrk_select';
			if (this.serviceName) {
				serviceName = this.serviceName.replace('_update', '_select');
			}
			let req = {
				serviceName: 'srvsys_service_columnex_v2_select',
				colNames: ['*'],
				condition: [{ colName: 'service_name', value: serviceName, ruleType: 'eq' }, { colName: 'use_type', value: 'list', ruleType: 'eq' }],
				order: [{ colName: 'seq', orderType: 'asc' }]
			};
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				return res.data.data.srv_cols;
			}
		},
		async getDefaultValue() {
			let serviceName = 'srvzhxq_syrk_select';
			if (this.serviceName) {
				serviceName = this.serviceName.replace('_update', '_select');
			}
			let url = this.getServiceUrl('zhxq', serviceName, 'select');
			let req = {
				serviceName: serviceName,
				colNames: ['*'],
				condition: [{ colName: 'proc_instance_no', value: this.proc_instance_no, ruleType: 'eq' }],
				page: { pageNo: 1, rownumber: 10 },
				order: []
			};

			if (!this.proc_instance_no && this.dataid) {
				req.condition = [{ colName: 'id', value: this.dataid, ruleType: 'eq' }];
			}
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
				return res.data.data[0];
			}
		},
		getFieldsV2: async function() {
			let colVs = await this.getV2Data();
			let defaultData = await this.getDefaultValue();
			let serviceName = 'srvzhxq_syrk_select';
			if (this.serviceName) {
				serviceName = this.serviceName;
			}
			colVs = await this.getServiceV2(serviceName, 'update', 'update', 'zhxq');
			this.colsV2Data = colVs;
			let fieldsArr = this.setFieldsDefaultVal(colVs._fieldInfo, defaultData);
			fieldsArr.forEach(item => {
				item.disabled = true;
				if (item.column == 'is_benren') {
					item.value = '本人信息';
				}
			});
			this.fields = this.deepClone(fieldsArr);
		},
		confirmInfo() {
			let self = this;
			let data = this.$refs.bxForm.getFieldModel();

			if (data) {
				uni.showModal({
					title: '警告',
					content: '请确认上述信息跟您本人信息相符，如果不符合您本人信息，请联系邀请人',
					success(res) {
						if (res.confirm) {
							console.info('11111111111111111', self.proc_instance_no);
							let serviceName = 'srvzhxq_syrk_update';
							if (self.serviceName) {
								serviceName = self.serviceName;
								if (serviceName === 'srvzhxq_member_update') {
									let wxuserinfo = uni.getStorageSync('wxuserinfo');
									let user_no =  uni.getStorageSync('login_user_info').user_no;
									if (wxuserinfo && typeof wxuserinfo === 'object') {
										if(wxuserinfo.nickName){
											data['nick_name'] = wxuserinfo.nickName
										}
										if(wxuserinfo.gender){
											data['gender'] = wxuserinfo.gender
										}
										if(wxuserinfo.city){
											data['city'] = wxuserinfo.city
										}
										if(wxuserinfo.country){
											data['country'] = wxuserinfo.country
										}
										if(wxuserinfo.avatar){
											data['avatar'] = wxuserinfo.avatar
										}
										if(wxuserinfo.province){
											data['province'] = wxuserinfo.province
										}
										if(user_no){
											data['openid'] = user_no
										}
										console.log('------基础信息绑定------', data, wxuserinfo);
									}
								}
							} else {
								data.is_benren = '本人信息';
								console.log('-------------data-----------------', data);
								Object.keys(data).forEach(item => {
									if (!data[item]) {
										delete data[item];
									}
								});
							}
							let req = [];
							if (serviceName === 'srvzhxq_member_update' && self.dataid) {
								req = [{ serviceName: serviceName, condition: [{ colName: 'id', value: self.dataid, ruleType: 'eq' }], data: [data] }];
							} else if (self.proc_instance_no) {
								req = [{ serviceName: serviceName, condition: [{ colName: 'proc_instance_no', ruleType: 'eq', value: self.proc_instance_no }], data: [data] }];
							}
							if(Array.isArray(req)&&req.length>0){
								if (!req[0].condition || Array.isArray(req[0].condition) !== true || req[0].condition.length < 1) {
									console.log('没有condition', req);
									return;
								}
							}
							let app = uni.getStorageSync('activeApp');
							let url = self.getServiceUrl(app, serviceName, 'operate');
							self.$http.post(url, req).then(res => {
								console.log('req------\n', req);
								console.log('res------\n', res);
								console.log(url, res.data);
								uni.showToast({
									title: res.data.resultMessage,
									icon: 'none'
								});
								if (res.data.state === 'SUCCESS') {
									uni.showModal({
										title: '提示',
										content: self.serviceName ? '登记成功' : '您的住户信息已成功登记',
										showCancel: false,
										success(res) {
											if (res.confirm) {
												uni.navigateTo({
													url: '/pages/public/sitePage/sitePage?website_no=WS2020060611100007&destApp=zhxq'
												});
											}
										}
									});
								}
							});
						} else if (res.cancel) {
						}
					}
				});
			}
		}
	}
};
</script>

<style scoped lang="scss">
.tip {
	background-color: #fff;
	padding: 20rpx;
	color: #999;
	border-bottom: 1px dashed #efefef;
}
.button-box {
	width: 100%;
	height: 200rpx;
	background-color: #ffffff;
	display: flex;
	justify-content: center;
	align-items: center;
	.bg-green {
		background-color: rgb(11, 201, 157);
		width: 50%;
	}
}
</style>
