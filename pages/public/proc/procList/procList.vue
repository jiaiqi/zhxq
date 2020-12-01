<template>
	<view>
		<bx-list
			v-if="listConfig.serviceName && listConfig.listConfig"
			ref="bxList"
			:srvApp="app"
			showLabel
			:pageType="listConfig.listType"
			:rowButtons="listConfig.rowButtons"
			:serviceName="listConfig.serviceName"
			:condition="listConfig.condition"
			:listType="listConfig.listType"
			:viewTemp="listConfig.viewTemp"
			:isWy="isWy"
			:listConfig="listConfig.listConfig"
			:searchWords="listConfig.searchVal"
			:queryLeftWord="listConfig.queryLeftWord"
			:searchColumn="'name'"
			:detailList="listConfig.detailList"
			:rownumber="5"
			:fixed="true"
			:top="listTop"
			:heightStyle="'calc(100vh-220upx)'"
			:order="listConfig.order"
			@click-list-item="clickItem"
			@list-change="listChange"
			@clickFootBtn="clickFootBtn"
			@loadEnd="loadEnd"
		></bx-list>
		<view class="cu-modal bottom-modal" :class="showModal ? 'show' : ''">
			<view class="cu-dialog" style="max-height: 800upx;">
				<view class="cu-bar bg-white">
					<view class="action text-green">确定</view>
					<view class="action text-blue" @tap="hideModal">取消</view>
				</view>
				<view class="padding-xl" v-if="listConfig.listConfig">
					<bxform ref="bxformApplyProc" :pageType="'add'" :fields="listConfig.listConfig.srv_cols" :BxformType="'add'" @value-blur="valueChange"></bxform>
				</view>
			</view>
		</view>
		<view class="public-button-box"><view class="add-button" @click="toApply"></view></view>
	</view>
</template>

<script>
import bxList from '@/components/bx-list/bx-list.vue';
import bxform from '@/components/bx-form/bx-form.vue';
export default {
	name: 'ProcList',
	components: { bxList, bxform },
	data() {
		return {
			publicButton: [],
			applyButton: {},
			applyFormFields: [],
			showModal: false,
			isWy: false,
			listConfig: {
				serviceName: '',
				addService: '',
				detailList: false,
				condition: [],
				order: [{ colName: 'create_time', orderType: 'desc' }],
				rowButtons: [],
				listType: 'proc',
				viewTemp: {
					title: 'issue_name',
					tip: '_executor_user_disp',
					img: null,
					price: 'proc_status',
					footer: 'create_time'
				},
				queryLeftWord: {},
				listConfig: null,
				searchVal: '',
				query: '',
				app: ''
			},
			condItem: [],
			listTop: 100
		};
	},
	onShow() {
		if (this.$refs.bxList) {
			this.$refs.bxList.getAllData(1);
		}
		// #ifdef H5
		this.listTop = 0;
		// #endif
	},
	methods: {
		hideModal() {
			this.showModal = false;
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
			return ress.data.data[0];
		},

		toApply() {
			// this.$refs.popup.open()
			// this.showModal = true
			let date = this.getDayDate(new Date());
			let cond = [];
			console.log('date-------', date);

			if (this.listConfig.addService == 'srvzhxq_guest_mgmt_add') {
				cond = [
					// {
					// 	colName: 'fwrq',
					// 	ruleType: 'eq',
					// 	value: date
					// },
					{
						colName: 'fwrq',
						ruleType: 'eq',
						value: 'dateTime'
					},
					{
						colName: 'xm',
						ruleType: 'eq',
						value: 'xm'
					},
					{
						colName: 'lxdh',
						ruleType: 'eq',
						value: 'lxdh'
					},
					{
						colName: 'zjhm',
						ruleType: 'eq',
						value: 'zjhm'
					},
					{
						colName: 'sex',
						ruleType: 'eq',
						value: 'sex'
					}
				];
			} else if (this.listConfig.addService == 'srvzhxq_repairs_add') {
				if (this.condItem) {
					cond = [
						{
							colName: 'lxdh',
							ruleType: 'eq',
							value: this.condItem.lxfs
						},
						{
							colName: 'lybm',
							ruleType: 'eq',
							value: 'lybm'
						},
						{
							colName: 'dybm',
							ruleType: 'eq',
							value: 'dybm'
						},
						{
							colName: 'fwbm',
							ruleType: 'eq',
							value: 'fwbm'
						}
					];
				}
			} else if (this.listConfig.addService == 'srvzhxq_syrk_add') {
				if (this.condItem) {
					cond = [
						{
							colName: 'xm',
							ruleType: 'eq',
							value: 'xm'
						},
						{
							colName: 'lxfs',
							ruleType: 'eq',
							value: 'lxfs'
						},
						{
							colName: 'gmsfhm',
							ruleType: 'eq',
							value: 'gmsfhm'
						}
					];
				}
			} else if (this.listConfig.addService == 'srvzhxq_clgl_add') {
				if (this.condItem) {
					cond = [
						{
							colName: 'lybm',
							ruleType: 'eq',
							value: 'lybm'
						},
						{
							colName: 'dybm',
							ruleType: 'eq',
							value: 'dybm'
						},
						{
							colName: 'fwbm',
							ruleType: 'eq',
							value: 'fwbm'
						}
					];
				}
			} else if (this.listConfig.addService == 'srvzhxq_member_fuwu_add') {
				if (this.condItem) {
					cond = [
						{
							colName: 'xm',
							ruleType: 'eq',
							value: 'xm'
						},
						{
							colName: 'lxdh',
							ruleType: 'eq',
							value: 'lxdh'
						}
					];
				}
			}

			uni.navigateTo({
				url: '../apply/apply?serviceName=' + this.listConfig.addService + '&cond=' + JSON.stringify(cond)
			});
		},
		async applyFlow() {
			//申请流程
			let serviceName = this.applyButton.serviceName;
			let req = [
				{
					serviceName: serviceName,
					data: [{}]
				}
			];
			let res = await this.onRequest('apply', serviceName, req, uni.getStorageSync('activeApp'));
		},
		clickItem(e) {
			console.log(e);
		},
		listChange(e) {
			console.log(e);
		},
		clickFootBtn(e) {
			console.log(e);
			if (e.button.button_type === 'edit') {
				//跳转到编辑页面
			} else if (e.button.button_type === 'delete' || e.button.button_type === 'deleteproc') {
				//删除页面
				this.deleteItem(e);
			} else if (e.button.button_type === 'procdetail') {
				uni.navigateTo({
					url: '../procDetail/procDetail?proc_instance_no=' + e.row.proc_instance_no
				});
			} else if (e.button.button_type === 'customize' && JSON.parse(e.button.more_config).type === 'share') {
				console.log('======');
				this.procNo = e.row.proc_instance_no;
			} else if (e.button.button_type === 'customize' && JSON.parse(e.button.more_config).type === 'qrcode') {
				console.log('======', e);
				uni.navigateTo({
					url: '/pages/specific/permit/permit?code=' + e.row.qr_code + '&rowData=' + encodeURIComponent(JSON.stringify(e.row))
				});
				// this.procNo = e.row.proc_instance_no
			} else if (e.button.button_type === 'customize' && JSON.parse(e.button.more_config).type === 'primary') {
				let params = {
					type: 'update',
					serviceName: e.button.service_name,
					condition: [
						{
							colName: 'id',
							ruleType: 'eq',
							value: e.row.id
						}
					]
				};
				if (e.button.servcie_type === 'delete') {
					if (e.button.operate_params && e.button.operate_service) {
						let condition = [];
						try {
							condition = JSON.parse(e.button.operate_params).condition;
							if (Array.isArray(condition)) {
								condition.forEach(item => {
									if (typeof item.value === 'object') {
										if (item.value.value_type === 'rowData' && item.value.value_key) {
											item.value = e.row[item.value.value_key];
										}
									}
								});
							}
						} catch (e) {
							console.log(e);
							//TODO handle the exception
						}
						let url = this.getServiceUrl(uni.getStorageSync('activeApp'), e.button.operate_service, 'operate');
						let req = [{ serviceName: e.button.operate_service, condition: condition, data: [{}], srvApp: uni.getStorageSync('activeApp') }];
						this.$http
							.post(url, req)
							.then(res => {
								if (res.data.state === 'SUCCESS') {
									uni.showToast({
										title: '删除成功',
										icon: 'none'
									});
									this.$refs.bxList.onRefresh();
								} else {
									uni.showToast({
										title: res.data.resultMessage,
										icon: 'none'
									});
								}
							})
							.catch(error => {
								console.error(error);
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							});
					}
				} else if (e.button.servcie_type === 'update') {
					uni.navigateTo({
						url: '/pages/public/formPage/formPage?params=' + decodeURIComponent(JSON.stringify(params))
					});
				}
			} else if (e.button.button_type === 'applyProc' && e.application === 'zhxq' && e.service_name === 'srvzhxq_syrk_select') {
			}
		},

		deleteItem(e) {
			let proc_instance_no = e.row.proc_instance_no;
			let serviceName = e.button.service_name;
			let req = [{ serviceName: serviceName, condition: [{ colName: 'proc_instance_no', ruleType: 'eq', value: proc_instance_no }] }];
			let url = this.getServiceUrl(uni.getStorageSync('activeApp'), serviceName, 'operate');
			this.$http
				.post(url, req)
				.then(res => {
					if (res.data.state === 'SUCCESS') {
						uni.showToast({
							title: '删除成功'
						});
						this.$refs.bxList.onRefresh();
					} else {
						uni.showToast({
							title: res.data.resultMessage
						});
					}
				})
				.catch(error => {
					console.error(error);
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				});
		},
		loadEnd(e) {
			console.log(e);
		},
		async getListV2() {
			let self = this;
			let app = uni.getStorageSync('activeApp');
			this.app = app;
			let serviceName = self.listConfig.serviceName;
			// app = 'oa';
			let colVs = await self.getServiceV2(self.listConfig.serviceName, 'list', 'proclist', app);
			colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1);
			console.log('colVs', colVs);
			if (!this.navigationBarTitle) {
				uni.setNavigationBarTitle({
					title: colVs.service_view_name
				});
			}
			if (serviceName.indexOf('issue_') !== -1) {
				colVs.rowButton = [
					{
						page_type: '流程列表',
						button_name: '流程详情',
						button_type: 'procdetail',
						service_name: 'srvoa_issue_info_select',
						service_view_name: '需求问题管理查询',
						permission: true
					}
				];
			} else if (serviceName.indexOf('task_') !== -1) {
				colVs.rowButton = [
					{
						page_type: '流程列表',
						button_name: '流程详情',
						button_type: 'procdetail',
						service_name: 'srvoa_project_task_plan_select',
						service_view_name: '任务计划跟踪列表',
						permission: true
					}
				];
			}

			this.listConfig.listConfig = colVs;
			console.log('this.listConfig.listConfig', this.listConfig.listConfig);
			this.applyFormFields = colVs;
			this.publicButton = colVs.gridButton.filter(item => {
				if (item.permission === true) {
					switch (item.button_type) {
						case 'add':
							this.showAdd = true;
							return item;
							break;
						case 'select':
							this.showSearchBar = true;
							return item;
							break;
						case 'apply':
							this.showAdd = true;
							this.applyButton = item;
							return item;
							break;
					}
				}
			});
			return colVs;
		}
	},
	onShareAppMessage(res) {
		// return {
		// 	title: '邀请来访',
		// 	path: '/pages/public/proc/apply/apply?serviceName=srvzhxq_guest_mgmt_add',
		// 	imageUrl: '../../../static/xx.png'
		// };
		if (res.target.dataset.info && res.target.dataset.info.button_type === 'applyProc' && res.target.dataset.info.button_name === '邀请' && res.target.dataset.procno) {
			return {
				title: '绑定住户邀请',
				path: '/pages/specific/shareBind/shareBind?proc_instance_no=' + res.target.dataset.procno
			};
		} else if (this.listConfig.serviceName === 'srvzhxq_guest_mgmt_select') {
			return {
				title: '邀请来访',
				path: '/pages/public/proc/apply/apply?serviceName=srvzhxq_guest_mgmt_add',
				imageUrl: '../../../static/xx.png'
			};
		} else {
			return {
				title: '访客分享审批',
				path: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + res.target.dataset.procno
			};
		}
	},
	onLoad(option) {
		console.log('option----', option);
		if (option.query) {
			console.log('option----', option.query);
			this.listConfig.query = JSON.parse(decodeURIComponent(option.query));
		}
	},
	mounted() {
		this.getUserInfo().then(u => {
			this.condItem = u;
		});
		// let activeApp = uni.getStorageSync('activeApp');
		// activeApp ? '' : uni.setStorageSync('activeApp', 'oa');
		let querysApp = '';
		let queryser = '';
		let queryViewTemp = '';
		let queryLeftWord = {};
		let queryWx = this.listConfig.query;
		console.log('queryWx', queryWx);
		// #ifdef H5
		querysApp = queryWx.destApp;
		queryser = queryWx.serviceName;
		queryViewTemp = queryWx.viewTemp;
		// #endif

		// #ifdef MP-WEIXIN
		querysApp = queryWx.destApp;
		queryser = queryWx.serviceName;
		queryViewTemp = queryWx.viewTemp;
		let isOwner = uni.getStorageSync('is_owner');
		let leftTempWord = {
			title: '访问房屋',
			tip: '联系电话',
			footer: '访问时间',
			title_col: '_fwbm_disp',
			tip_col: 'lxdh',
			footer_col: 'create_time'
		};
		// if (queryser.indexOf('zhxq_guest_mgmt') !== -1 && !isOwner) {
		// 	leftTempWord.title = '访问地址';
		// }
		if (queryser.indexOf('zhxq_syrk') !== -1) {
			leftTempWord = {
				title: '姓名',
				tip: '人员类型',
				footer: '联系电话',
				title_col: 'xm',
				tip_col: 'rylx',
				footer_col: 'lxfs'
			};
		}
		if (queryser.indexOf('zhxq_repairs') !== -1) {
			leftTempWord = {
				title: '保修类型',
				tip: '联系电话',
				footer: '保修内容',
				title_col: 'type',
				tip_col: 'lxdh',
				footer_col: 'remark'
			};
		}
		if (queryser.indexOf('zhxq_member_fuwu') !== -1) {
			leftTempWord = {
				title: '职业',
				tip: '联系电话',
				footer: '申请时间',
				title_col: 'zhiye',
				tip_col: 'lxdh',
				footer_col: 'create_time'
			};
		}
		if (queryser.indexOf('zhxq_clgl') !== -1) {
			leftTempWord = {
				title: '车牌号',
				tip: '车辆类型',
				footer: '车辆颜色',
				title_col: 'cphm',
				tip_col: '_cllx_disp',
				footer_col: '_csys_disp'
			};
		}
		this.listConfig.queryLeftWord = leftTempWord;
		// #endif
		if (querysApp) {
			uni.setStorageSync('activeApp', querysApp);
		}
		if (queryser) {
			this.listConfig.serviceName = queryser;
			if (this.listConfig.serviceName.indexOf('_select') !== -1) {
				this.listConfig.addService = this.listConfig.serviceName.replace('_select', '_add');
			} else {
				this.listConfig.serviceName = this.listConfig.serviceName.replace('_add', '_select');
			}

			if (this.listConfig.serviceName.indexOf('project_task_plan') !== -1) {
				this.listConfig.viewTemp = {
					title: 'task_name',
					tip: 'executor',
					img: null,
					// price: 'issue_level',
					footer: 'create_time'
				};
			}
			if (this.listConfig.serviceName.indexOf('zhxq_guest_mgmt') !== -1 || this.listConfig.serviceName.indexOf('zhxq_repairs') !== -1) {
				this.listConfig.viewTemp.title = 'xm';
			}
			if (queryViewTemp) {
				// this.listConfig.viewTemp = JSON.parse(decodeURIComponent(queryViewTemp));
				this.listConfig.viewTemp = queryViewTemp;
			}

			if (this.listConfig.serviceName.indexOf('issue_info') !== -1 || !queryser) {
				this.listConfig.addService = 'srvoa_issue_info_add';
				this.listConfig.serviceName = 'srvoa_issue_info_select';
				this.listConfig.viewTemp = {
					title: 'issue_name',
					tip: '_executor_user_disp',
					img: null,
					price: 'proc_status',
					footer: 'create_time'
				};
			}
		} else {
			this.listConfig.addService = 'srvoa_issue_info_add';
			this.listConfig.serviceName = 'srvoa_issue_info_select';
			this.listConfig.viewTemp = {
				title: 'issue_name',
				tip: '_executor_user_disp',
				img: null,
				price: 'proc_status',
				footer: 'create_time'
			};
		}
		this.getListV2();
	}
};
</script>

<style lang="scss">
.top_rig /deep/ .cu-bar {
	padding-right: 0;
	padding-top: 0 !important;
	height: 45px !important;
}
.top_rig /deep/.cu-custom {
	height: 45px !important;
}
.top_rig /deep/ .content {
	top: 0 !important;
}
.add-button {
	position: fixed;
	bottom: 100upx;
	left: calc(50% - 50upx);
	width: 100upx;
	height: 100upx;
	border-radius: 50%;
	background-color: #0bc99d;
	z-index: 100;
	&::before {
		position: absolute;
		width: 8upx;
		height: 60upx;
		left: calc(50% - 4upx);
		top: 20upx;
		content: '';
		background-color: #fff;
	}
	&::after {
		position: absolute;
		width: 60upx;
		height: 8upx;
		content: '';
		top: calc(50% - 4upx);
		left: 20upx;
		background-color: #fff;
	}
	&:active {
		transform: rotate(45deg);
		transition: all 0.2s;
	}
}
</style>
