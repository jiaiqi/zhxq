<template>
	<view>
		<view class="form-wrap" v-if="fields.length > 0">
			<bxform ref="bxForm" :pageType="type" :BxformType="type" :fields="fields"></bxform>
			<view class="btn-box"><button @click="submitData" class="cu-btn bg-blue">提交</button></view>
		</view>
	</view>
</template>

<script>
	import bxform from '@/components/bx-form/bx-form.vue';
	import {
		mapGetters
	} from 'vuex'
	export default {
		components: {
			bxform
		},
		computed: {
			...mapGetters(['wxUserInfo', 'loginUserInfo', 'staffInfo', 'roleInfo']),
		},
		data() {
			return {
				type: 'add',
				serviceName: '',
				fields: [],
				procBasicConfig: {},
				colsV2Data: {},
				defaultCondition: [],
				app: ''
			};
		},
		methods: {
			async submitData() {
				let serviceName = this.serviceName;
				let itemData = this.$refs.bxForm.getFieldModel();
				if (!itemData) {
					return;
				} else {
					let req = [{
						data: [itemData],
						serviceName: serviceName
					}];
					console.log(req, 'req');
					let res = await this.onRequest('apply', serviceName, req, this.app ? this.app : 'oa');
					if (res.data.state === 'SUCCESS') {
						console.log(res.data, 'res.data');
						uni.showToast({
							title: res.data.resultMessage,
							icon: 'none'
						});
						uni.showModal({
							title: '提示',
							content: res.data.resultMessage + ',即将返回流程列表',
							showCancel: false,
							success(res) {
								if (res.confirm) {
									let service_name = serviceName;
									if (service_name.indexOf('_add')) {
										service_name = service_name.replace('_add', '_select');
									}
									uni.redirectTo({
										url: `../procList/procList?serviceName=${service_name}`
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
				let req = {
					serviceName: 'srvprocess_basic_cfg_select',
					colNames: ['*'],
					condition: [{
						colName: 'service_name',
						ruleType: 'eq',
						value: serviceName
					}]
				};
				let res = await this.onRequest('select', 'srvprocess_basic_cfg_select', req, this.app ? this.app :
					'oa');
				if (res.data.state === 'SUCCESS') {
					this.procBasicConfig = res.data;
				}
			},
			async getColV2() {
				let colVs = await this.getServiceV2(this.serviceName, this.type, this.type, this.app ? this.app :
					'oa');
				this.colsV2Data = colVs;
				let type = this.type;
				console.log('colsV2Data', colVs);
				let fields = [];
				switch (type) {
					case 'update':
						fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
						break;
					case 'add':
						if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs._fieldInfo && Array
							.isArray(colVs._fieldInfo)) {
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
						fields = colVs._fieldInfo;
						break;
					case 'detail':
						fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
						break;
					default:
						break;
				}
				if (fields && Array.isArray(fields)) {
					fields = fields.filter((item, index) => {
						if (!item.value) {
							item.value = '';
						}
						if (item.column === 'activity_no') {
							item['disabled'] = true;
						}
						if (item['in_' + type] === 1) {
							return item;
						}
						// return item
					}).map(item => {
						if (this.serviceName === 'srvdaq_street_house_add') {
							if (this.roleInfo.streetRoadInfo) {
								if (['road_no', 'village_no', 'street_no'].includes(item.column)) {
									item.value = this.roleInfo.streetRoadInfo[item.column]
									item.disabled = true
								}
							}
						}
						return item
					})
					console.log('this.fields ', fields);
					this.fields = fields;
				}
			}
		},
		onLoad(option) {
			if (option.cond) {
				this.defaultCondition = JSON.parse(option.cond);
			}
			if (option.serviceName) {
				// uni.setStorageSync('activeApp', );
				this.app = uni.getStorageSync('activeApp');
				this.serviceName = option.serviceName;
				this.getBasicCfg();
				this.getColV2();
			}
		}
	};
</script>

<style lang="scss" scoped>
	.form-wrap {
		min-height: calc(100vh - 100upx);
		display: flex;
		flex-direction: column;

		.btn-box {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 150upx;
			background-color: #fff;

			.cu-btn {
				width: 30%;
			}
		}
	}
</style>
