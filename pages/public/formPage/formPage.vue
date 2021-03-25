<template>
	<view class="form-page">
		<view class="main-table">
			<!-- <view class="normal-title">子表</view> -->
			<bxform ref="bxForm" :service="serviceName" :addType="addType" :pageType="type" :BxformType="type"
				:fields="fields" :moreConfig="colsV2Data && colsV2Data.more_config ? colsV2Data.more_config : null">
			</bxform>
		</view>
		<view class="child-service-box" v-if="type === 'detail' && childService && childService.length > 0">
			<view class="normal-title">子表</view>
			<view class="child-service-item" v-for="item in childService" @click="toChildServiceList(item)">
				<view class="child-service-title">
					{{ item.foreign_key && item.foreign_key.section_name ? item.foreign_key.section_name : item.service_view_name }}
				</view>
				<view class="child-list">{{ item.listTotal }}</view>
			</view>
		</view>
		<view class="button-box" v-if="colsV2Data && isArray(fields) && fields.length > 0">
			<view class="button" v-if="type === 'detail'"><button class="cu-btn bg-blue"
					@click="toUpdatePages">编辑</button></view>
			<view v-for="(item, index) in buttons" :key="index" class="button">
				<button v-if="item.display !== false" @click="onButton(item)"
					class="cu-btn bg-blue">{{ item.button_name }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import bxform from '@/components/bx-form/bx-form.vue';
	export default {
		components: {
			bxform
		},
		props: {},
		data() {
			return {
				fields: [],
				buttons: [],
				colsV2Data: null,
				type: '',
				serviceName: '',
				condition: [],
				defaultCondition: [],
				params: {},
				addType: '',
				fieldsCond: [], //treeSelector类型字段的条件
				refreshWithKey: false, //提交成功并返回上一页面时是否刷新上个页面的数据
			};
		},
		computed: {
			childService() {
				if (this.colsV2Data && Array.isArray(this.colsV2Data.child_service)) {
					return this.colsV2Data.child_service;
				}
			},
			// buttons: function() {
			// 	let buttons = [];
			// 	if (this.colsV2Data && this.colsV2Data._buttonInfo) {
			// 		buttons = this.colsV2Data._buttonInfo;
			// 	} else if (this.colsV2Data && this.colsV2Data._formButtons) {
			// 		buttons = this.colsV2Data._formButtons;
			// 	}
			// 	buttons = buttons.filter(item => item.button_name !== '重置');
			// 	console.log("buttons",buttons)
			// let data = {};
			// this.fields.forEach(item => {
			// 	data[item['column']] = item['value'];
			// });
			// let fieldModel = data;
			// buttons.forEach(btn => {
			// if (btn.disp_exps) {
			// btn['display'] = eval(btn.disp_exps);
			// }
			// if (btn.operate_params) {
			// 	let fieldData = btn.operate_params['data'];
			// 	if (fieldData && Array.isArray(fieldData) && fieldData.length > 0) {
			// 		fieldData = fieldData[0];
			// 		let newData = {};
			// 		Object.keys(fieldData).forEach(data_item => {
			// 			let item = fieldData[data_item];
			// 			if (item.value_type && item.value_type === 'rowData') {
			// 				newData[data_item] = fieldModel[item.value_key];
			// 			}
			// 		});
			// 		btn['requestData'] = newData;
			// 		btn['requestCondition'] = this.condition;
			// 	}
			// }
			// });
			// return buttons;
			// }
		},
		created() {
			const destApp = this.$route ? this.$route.query.destApp : '';
			if (destApp) {
				uni.setStorageSync('activeApp', destApp);
			}
		},
		onPullDownRefresh() {
			if (this.serviceName && this.type) {
				this.getFieldsV2();
				setTimeout(() => {
					uni.stopPullDownRefresh();
				}, 1000);
			}
		},
		onLoad(option) {
			const destApp = option.destApp;
			if (destApp) {
				uni.setStorageSync('activeApp', destApp);
			}
			uni.$on('form-data-change', () => {
				if (this.serviceName && this.type) {
					uni.startPullDownRefresh();
					// this.getFieldsV2();
				}
			});
			if (option.fieldsCond) {
				this.fieldsCond = JSON.parse(decodeURIComponent(option.fieldsCond));
			}
			if (option.refreshWithKey) {
				this.refreshWithKey = true
			}
			if (option.params) {
				this.params = JSON.parse(decodeURIComponent(option.params));
			}
			if (option.addType) {
				this.addType = option.addType;
			}
			if (option.cond) {
				this.defaultCondition = JSON.parse(decodeURIComponent(option.cond));
			}
			if (option.hasOwnProperty('params')) {
				this.serviceName = this.params.serviceName;
				this.type = this.params.type;
				this.condition = this.params.condition;
				this.defaultVal = this.params.defaultVal;
				uni.startPullDownRefresh();
			} else if (option.serviceName && option.type) {
				this.serviceName = option.serviceName;
				this.type = option.type;
				// this.getFieldsV2();
				uni.startPullDownRefresh();
			} else {
				uni.showToast({
					title: '加载错误',
					icon: 'none'
				});
			}
		},
		methods: {
			toChildServiceList(e) {
				let data = this.deepClone(e);
				let formData = this.params.defaultVal;
				let condition = [{
					colName: e.foreign_key.column_name,
					ruleType: 'eq',
					value: formData[e.foreign_key.referenced_column_name]
				}];
				if (e.foreign_key && e.foreign_key.more_config && typeof e.foreign_key.more_config === 'string') {
					try {
						e.foreign_key.more_config = JSON.parse(e.foreign_key.more_config);
					} catch (e) {
						//TODO handle the exception
					}
				}
				if (e.foreign_key && e.foreign_key.more_config && formData[e.foreign_key.referenced_column_name]) {
					let moreConfig = e.foreign_key.more_config;
					if (e.foreign_key.more_config.targetType) {
						let targetType = e.foreign_key.more_config.targetType;
						if (targetType === 'list') {
							uni.navigateTo({
								url: '/pages/public/list/list?pageType=list&serviceName=' + e.service_name +
									'&cond=' + JSON.stringify(condition)
							});
						} else if (targetType === 'detail') {
							if (e.childData && e.childData.data && e.childData.data.length > 0) {
								let params = {
									type: 'update',
									formDisabled: true,
									condition: [{
										colName: 'id',
										ruleType: 'in',
										value: e.childData.data[0].id
									}],
									serviceName: e.service_name
									// "defaultVal": row
								};
								uni.navigateTo({
									url: '/pages/public/formPage/formPage?params=' + JSON.stringify(params)
								});
							} else {
								uni.showModal({
									title: '提示',
									content: '暂无数据，是否添加数据',
									success(res) {
										if (res.confirm) {
											let params = {
												type: 'add',
												serviceName: e.service_name.replace('_select', '_add')
												// defaultVal:formData
											};
											// referenced_column_name //被引用的字段
											// column //子表字段
											console.log(e);
											if (e.foreign_key && e.foreign_key.referenced_column_name && e
												.foreign_key.column_name) {
												params.defaultCondition = [{
													colName: e.foreign_key.referenced_column_name,
													ruleType: 'eq',
													value: formData[e.foreign_key.column_name]
												}];
											}
											uni.navigateTo({
												url: '/pages/public/formPage/formPage?params=' + JSON
													.stringify(params)
											});
										}
									}
								});
							}
						}
					}
					if (moreConfig.app_list_column && typeof moreConfig.app_list_column == 'object' && moreConfig
						.app_list_column.title) {
						uni.navigateTo({
							url: '/pages/public/list/list?pageType=list&serviceName=' +
								e.service_name +
								'&cond=' +
								JSON.stringify(condition) +
								'&viewTemp=' +
								JSON.stringify(moreConfig.app_list_column)
						});
					}
				} else {
					uni.navigateTo({
						url: '/pages/public/list/list?pageType=list&serviceName=' + e.service_name + '&cond=' +
							JSON.stringify(condition)
					});
				}
			},
			toUpdatePages() {
				let params = {
					type: 'update',
					condition: this.params.condition,
					serviceName: this.params.serviceName.replace('_select', '_update'),
					defaultVal: this.params.defaultVal
				};
				uni.navigateTo({
					url: '/pages/public/formPage/formPage?params=' + encodeURIComponent(JSON.stringify(params))
				});
			},
			async getDefaultVal() {
				if (this.type === 'detail' || this.type === 'update') {
					let app = uni.getStorageSync('activeApp');
					if (this.params.serviceName.indexOf('_update') !== -1) {
						this.params.serviceName = this.params.serviceName.replace('_update', '_select');
					}
					if (this.params.serviceName.indexOf('_add') !== -1) {
						this.params.serviceName = this.params.serviceName.replace('_add', '_select');
					}
					let url = this.getServiceUrl(app, this.params.serviceName, 'select');
					let req = {
						serviceName: this.params.serviceName,
						colNames: ['*'],
						condition: this.params.condition ? this.params.condition : [],
						page: {
							pageNo: 1,
							rownumber: 10
						}
					};
					let res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS') {
						if (Array.isArray(res.data.data) && res.data.data.length > 0) {
							return res.data.data[0];
						}
					}
				}
			},
			async onSelect(appNo, serviceName, condition, page) {
				const url = this.getServiceUrl(appNo, serviceName, 'select');
				let req = {
					serviceName: serviceName,
					colNames: ['*'],
					condition: condition ? condition : [],
					page: page ? page : {
						pageNo: 1,
						rownumber: 20
					}
				};
				const res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
					return {
						data: res.data.data,
						page: res.data.page
					};
				} else {
					return false;
				}
			},
			getFieldsV2: async function() {
				let app = uni.getStorageSync('activeApp');
				let colVs = await this.getServiceV2(this.serviceName, this.type, this.type, app);
				colVs = this.deepClone(colVs);
				let buttons = []
				if (colVs && colVs._buttonInfo) {
					buttons = colVs._buttonInfo;
				} else if (colVs && colVs._formButtons) {
					buttons = colVs._formButtons;
				}
				buttons = buttons.filter(item => item.button_name !== '重置')
				this.buttons = buttons
				if (Array.isArray(colVs.child_service) && colVs.child_service.length > 0) {
					for (let item of colVs.child_service) {
						if (item.service_name) {
							let formData = this.params.defaultVal;
							let condition = [{
								colName: item.foreign_key.column_name,
								ruleType: 'eq',
								value: formData[item.foreign_key.referenced_column_name]
							}];
							let result = await this.onSelect(app, item.service_name, condition);
							if (result && Array.isArray(result.data)) {
								item.listData = result.data;
							} else {
								item.listData = [];
							}
							if (result && result.page && result.page.total) {
								item.listTotal = result.page.total;
							} else {
								item.listTotal = 0;
							}
						}
					}
				}
				let defaultVal = null;
				if (colVs.service_view_name) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				}
				switch (this.type) {
					case 'add':
						this.fields = colVs._fieldInfo.map(field => {
							if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs
								._fieldInfo && Array.isArray(colVs._fieldInfo)) {
								this.defaultCondition.forEach(cond => {
									colVs._fieldInfo.forEach(field => {
										if (cond.colName === field.column) {
											field['value'] = cond['value'];
											// field['disabled'] = true;
										}
									});
								});
							}
							if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
								// 从上一页面传来的某个字段的条件（fk类型的字段才用得上）
								this.fieldsCond.forEach(item => {
									if (item.column === field.column) {
										if (field.option_list_v2 && Array.isArray(field.option_list_v2
												.conditions) && Array.isArray(item.condition)) {
											field.option_list_v2.conditions = field.option_list_v2
												.conditions.concat(item.condition);
										}
										if (item.value) {
											field.value = item.value;
										}
									}
								});
							}
							return field;
						});
						break;
					case 'detail':
					case 'update':
						defaultVal = await this.getDefaultVal();
						this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, defaultVal ? defaultVal : this.params
							.defaultVal);
						break;
				}
				this.colsV2Data = colVs;
			},
			async onButton(e) {
				let req = this.$refs.bxForm.getFieldModel();
				for (let key in req) {
					if (!req[key]) {
						delete req[key];
					}
				}
				switch (e.button_type) {
					case 'edit':
						if (e.page_type === '详情' && this.type === 'detail') {
							this.type = 'update';
							await this.getFieldsV2();
						} else {
							if (req) {
								req = [{
									serviceName: e.service_name,
									data: [req],
									condition: this.condition
								}];
								let app = uni.getStorageSync('activeApp');
								let url = this.getServiceUrl(app, e.service_name, 'add');
								let res = await this.onRequest('update', e.service_name, req);
								console.log('res:' + e.service_name, res);
								if (res.data.state === 'SUCCESS') {
									let resData = this.getResData(res.data.response);
									console.log('resData', resData);
									this.type = 'detail';
									await this.getFieldsV2();
								}
							}
						}
						break;
					case 'submit':
						if (req) {
							let data = this.deepClone(req);
							for (let key in data) {
								if (!data[key]) {
									delete data[key];
								}
							}
							req = [{
								serviceName: e.service_name,
								data: [data]
							}];
							let app = uni.getStorageSync('activeApp');
							let url = this.getServiceUrl(app, e.service_name, 'add');
							let res = await this.$http.post(url, req);
							if (res.data.state === 'SUCCESS') {
								uni.showModal({
									title: '提示',
									content: '添加成功',
									showCancel: false,
									success(res) {
										if (res.confirm) {
											uni.$emit('form-data-change', {
												refreshWithKey: true
											});
											uni.navigateBack();
										}
									}
								});
							}
						}
						break;
					case 'reset':
						this.$refs.bxForm.onReset().then(res => {
							if (res) {
								uni.showToast({
									title: '已重置'
								});
							} else {
								uni.showToast({
									title: '无效操作'
								});
							}
						});
						break;
					case 'customize':
						if (e.application && e.operate_service) {
							const url = this.getServiceUrl(e.application, e.operate_service, 'operate');
							const req = [{
								data: [e.requestData],
								serviceName: e.operate_service,
								srvApp: e.application
							}];
							let res = await this.$http.post(url, req);
							if (res.data.state === 'SUCCESS') {
								uni.showModal({
									title: '提示',
									content: e.tip_msg ? e.tip_msg : res.data.resultMessage,
									showCancel: false,
									success(res) {
										if (res.confirm) {
											uni.navigateBack();
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

<style lang="scss">
	.form-page {
		min-height: 100vh;
		background-color: #fff;
		height: auto;

		.normal-title {
			margin-bottom: 20rpx;
			margin-left: 10rpx;
			padding: 0;
			display: inline-block;
			position: relative;
			width: 100%;
			text-indent: 30rpx;
			font-weight: bold;
			font-size: 32rpx;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 10%;
				height: 80%;
				width: 5px;
				background-color: #0081ff;
				border-radius: 5rpx;
			}
		}

		.main-table {
			.normal-title {
				margin-left: 20rpx;
			}
		}

		.child-service-box {
			margin: 20rpx;
			padding: 20rpx 10rpx;
			display: flex;
			flex-wrap: wrap;
			box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

			.child-service-item {
				min-height: 100rpx;
				width: calc(33% - 6rpx);
				display: flex;
				justify-content: center;
				align-items: center;
				transform: translate(2px, 2px);
				background-color: #409eff;
				color: #fff;
				transition: 0.2s all ease-in-out;
				border-radius: 10rpx;
				margin-right: 10rpx;
				margin-bottom: 10rpx;
				flex-wrap: wrap;

				&:nth-child(3n + 1) {
					margin-right: 0;
				}

				&:active {
					transform: translate(2px, 2px);
					color: #409eff;
					background: #ecf5ff;
					box-shadow: 0px 0px 4px #ecf5ff, 0 0 6px #b3d8ff;
				}

				.child-service-title {
					// color: #0081ff;
					width: 100%;
					text-indent: 20rpx;
					font-weight: bold;
				}

				.child-list {
					width: 100%;
					text-align: center;
					font-size: 40rpx;
				}
			}
		}
	}

	.button-box {
		display: flex;
		justify-content: space-around;
		align-items: center;
		min-height: 200upx;
		background-color: #fff;
		flex-wrap: wrap;

		.button {
			width: 40%;

			.cu-btn {
				// background-color: #14c4bd;
				width: 100%;
			}
		}
	}
</style>
