<template>
	<view>
		<view class="search-bar" v-if="showSearchBar">
			<view class="cu-bar search bg-white fixed">
				<view class="search-form round">
					<text class="cuIcon-search"></text>
					<input @focus="searchBarFocus" @blur="serachBarBlur" :adjust-position="false" type="text"
						v-model="searchVal" :placeholder="placeholder" confirm-type="search" />
				</view>
				<view class="action"><button class="cu-btn bg-blue shadow-blur round" @click="toSearch">搜索</button>
				</view>
			</view>
			<view style="height: 100upx;width: 100%;"></view>
		</view>
		<bx-list ref="bxList" :serviceName="serviceName" :condition="condition" :relation_condition="relation_condition"
			:pageType="pageType" :listType="'list'"
			:rowButtons="listConfig && listConfig.rowButton ? listConfig.rowButton : []" :showTab="false"
			:viewTemp="viewTemp" :listConfig="listConfig" :showButton="showRowButton" :fixed="true" :top="listTop"
			:searchWords="searchVal" :searchColumn="keyColumn" :tempWord="tempWord" :rownumber="10"
			:showFootBtn="showFootBtn" @click-list-item="clickItem" @list-change="listChange"
			@clickFootBtn="clickFootBtn" @loadEnd="loadEnd" @login-fail="loginFail"></bx-list>
		<view class="public-button-box">
			<view class="add-button" @click="clickAddButton" v-if="showAdd"></view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import bxList from '@/components/bx-list/bx-list.vue';
	export default {
		components: {
			bxList
		},
		computed: {
			...mapGetters(['wxUserInfo', 'loginUserInfo', 'roleInfo']),
		},
		data() {
			return {
				serviceName: '',
				pageType: '',
				placeholder: '输入搜索关键词',
				listConfig: {},
				srv_cols: [],
				condition: [],
				relation_condition: null,
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF'
				},
				fabContent: [],
				fabHorizontal: 'left',
				fabVertical: 'bottom',
				fabDirection: 'horizontal',
				listTop: 0,
				showRowButton: 'true',
				viewTemp: {
					// title: 'name',
					// tip: 'desc',
					// img: 'img',
					// price: 'current_price',
					// footer: 'shop_name'
				},
				publicButton: [],
				searchVal: '',
				keyColumn: '',
				showAdd: false,
				noData: false,
				showSearchBar: false,
				showFootBtn: true,
				tempWord: {},
				queryParams: {},
				queryOption: {},
				navigationBarTitle: null
			};
		},
		onReachBottom() {
			console.log('触底');
			if (!this.noData) {
				this.$refs.bxList.pageInfo.pageNo++;
				this.$refs.bxList.getListData().then(data => {});
			}
		},
		onShow() {
			if (this.serviceName && this.$refs.bxList) {
				this.$refs.bxList.onRefresh();
			}
		},
		onLoad(option) {
			this.showSearchBar = true;
			// #ifdef MP-WEIXIN
			this.listTop = 100;
			// #endif
			let query = {};
			// #ifdef H5
			this.listTop = 0;
			if (option.query) {
				query = JSON.parse(decodeURIComponent(option.query));
			} else {
				query = option;
			}
			// #endif
			// #ifdef MP-WEIXIN
			if (option.serviceName) {
				query = option;
			} else {
				query = JSON.parse(decodeURIComponent(option.query));
			}
			if (option.navigationBarTitle) {
				this.navigationBarTitle = option.navigationBarTitle;
				uni.setNavigationBarTitle({
					title: option.navigationBarTitle
				});
			}
			// #endif
			if (option.hasOwnProperty('showAdd')) {
				this.queryOption = option;
			}
			if (query.viewTemp) {
				this.viewTemp = JSON.parse(query.viewTemp);
				if (this.viewTemp.title) {
					this.keyColumn = this.viewTemp.title;
				}
				if (query.destApp) {
					uni.setStorageSync('activeApp', query.destApp);
				}
			}
			if (query.cond) {
				try {
					let cond = JSON.parse(decodeURIComponent(query.cond));
					if (Array.isArray(cond)) {
						cond.forEach(item => {
							if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
									'glry') && item.value === 'user_no') {
								item.value = uni.getStorageSync('login_user_info').user_no;
							}
						});
						this.condition = cond;
					}
				} catch (e) {
					console.log(e);
					//TODO handle the exception
				}
				// this.condition = JSON.parse(this.getDecodeUrl(option.cond));
			}
			if (query.relation_condition) {
				try {
					let cond = JSON.parse(decodeURIComponent(query.relation_condition));
					if (Array.isArray(cond.data)) {
						cond.data.forEach(item => {
							if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
									'glry') && item.value === 'user_no') {
								item.value = uni.getStorageSync('login_user_info').user_no;
							}
						});
						this.relation_condition = cond;
					}
				} catch (e) {
					console.log(e);
					//TODO handle the exception
				}
			}
			if (query.tempWord) {
				this.tempWord = JSON.parse(query.tempWord);
			}
			if (query.showRowButton) {
				this.showRowButton = query.showRowButton;
			}
			if (query.serviceName && query.pageType) {
				this.serviceName = query.serviceName;
				this.pageType = query.pageType;
				if (query.params) {
					let params = {};
					if (typeof query.params === 'string') {
						try {
							params = JSON.parse(query.params);
							this.queryParams = params;
						} catch (e) {
							//TODO handle the exception
						}
					}
				}
				this.getListV2();
			}
		},
		methods: {
			loginFail() {
				setTimeout(() => {
					this.getListV2().then(_ => {
						this.$refs.bxList.onRefresh();
					});
				}, 2000);
			},
			async getUserInfo() {
				let user_no = uni.getStorageSync('basics_info').picp;
				let urls = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
				let reqs = {
					serviceName: 'srvzhxq_syrk_select',
					colNames: ['*'],
					condition: [{
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
			toSearch() {
				let keywords = this.searchVal;
				this.$refs.bxList.toSearch();
			},
			loadEnd(e) {
				this.noData = true;
			},
			clickAddButton() {
				if (this.pageType === 'proc') {
					this.publicButton.map(item => {
						if (item.button_type === 'add' || item.button_type === 'apply') {
							const url = '/pages/public/proc/apply/apply?serviceName=' + item.service_name +
								'&cond=' + decodeURIComponent(JSON.stringify(this.condition))
							uni.navigateTo({
								url: url
							});
						}
					});
				} else {
					this.publicButton.map(item => {
						if (item.button_type === 'add') {
							const params = {
								type: 'add',
								condition: [],
								serviceName: item.service_name,
								service_view_name: item.service_view_name
							};
							const url = '../formPage/formPage?serviceName=' + item.service_name +
								'&type=add&cond=' + decodeURIComponent(JSON.stringify(this.condition))
							uni.navigateTo({
								url: url
							});
						} else if (item.button_type === 'customize') {}
					});
				}
			},
			searchBarFocus(e) {
				console.log('searchBarFocus:', e);
			},
			serachBarBlur(e) {
				console.log('serachBarBlur:', e);
			},
			listChange(e) {
				console.log('listChange:', e);
			},
			clickItem(e) {
				if (this.pageType === 'proc') {
					uni.navigateTo({
						url: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + e.proc_instance_no
					});
				} else {
					let req = {
						button: {
							button_name: '详情',
							button_type: 'detail',
							service_name: this.serviceName
						},
						row: e
					};
					try {
						this.onButtonToUrl(req).then(res => {
							console.log('clickItem :', res);
						});
					} catch (e) {
						//TODO handle the exception
					}
				}
				console.log('click-list-item:', e);
			},
			async clickFootBtn(data) {
				let buttonInfo = data.button;
				let rowData = data.row;
				if (buttonInfo.operate_params && typeof buttonInfo.operate_params === 'string') {
					try {
						buttonInfo.operate_params = JSON.parse(buttonInfo.operate_params);
						if (Array.isArray(buttonInfo.operate_params.condition) && buttonInfo.operate_params.condition
							.length > 0) {
							buttonInfo.operate_params.condition.forEach(cond => {
								if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
									cond.value = data.row[cond.value.value_key];
								} else if (typeof cond.value === 'object' && cond.value.value_type ===
									'constant') {
									cond.value = cond.value.value;
								}
							});
						}
						if (Array.isArray(buttonInfo.operate_params.data) && buttonInfo.operate_params.data.length >
							0) {
							buttonInfo.operate_params.data.forEach(data => {
								if (typeof data === 'object') {
									Object.keys(data).forEach(item => {
										if (typeof data[item] === 'object' && data[item].value_type ===
											'rowData') {
											data[item] = rowData[data[item].value_key];
										} else if (typeof data[item] === 'object' && data[item]
											.value_type === 'constant') {
											data[item] = data[item].value;
										}
									});
								}
							});
						}
						if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
							let req = [{
								serviceName: buttonInfo.operate_service,
								condition: buttonInfo.operate_params.condition,
								data: buttonInfo.operate_params.data
							}];
							let app = uni.getStorageSync('activeApp');
							let url = this.getServiceUrl(buttonInfo.application ? buttonInfo.application : app,
								buttonInfo.operate_service, buttonInfo.servcie_type);
							let res = await this.$http.post(url, req);
							if (res.data.state === 'SUCCESS') {
								this.$refs.bxList.onRefresh();
							}
						} else if (buttonInfo.operate_type === '更新弹出') {
							let params = {
								type: buttonInfo.servcie_type,
								serviceName: buttonInfo.operate_service,
								defaultVal: {}
								// eventOrigin: buttonInfo
							};
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?serviceName=' +
									buttonInfo.operate_service +
									'&type=' +
									buttonInfo.servcie_type +
									'&cond=' +
									decodeURIComponent(JSON.stringify(buttonInfo.operate_params.condition))
							});
						}
					} catch (e) {
						console.error(e);
						//TODO handle the exception
					}
				}

				if (this.pageType === 'proc') {
					if (data.button && data.button.button_type === 'edit' && data.row.proc_instance_no) {
						uni.navigateTo({
							url: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + data.row
								.proc_instance_no
						});
					}
				} else {
					this.onButtonToUrl(data).then(res => {
						if (data.button && data.button.button_type === 'delete') {
							if (res.state === 'SUCCESS') {
								this.$refs.bxList.onRefresh();
							}
						}
						if (data.button && data.button.button_type === 'detail') {
							let row = res.row;
							let btn = res.button;
							let params = {
								type: 'detail',
								condition: [{
									colName: 'id',
									ruleType: 'in',
									value: row.id
								}],
								serviceName: btn.service_name
								// defaultVal: row
							};
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?params=' + encodeURIComponent(
									JSON.stringify(params))
							});
						} else if (data.button && data.button.button_type === 'customize') {
							let moreConfig = data.button.more_config;
							if (typeof moreConfig === 'string') {
								try {
									moreConfig = JSON.parse(moreConfig);
								} catch (e) {
									//TODO handle the exception
									console.log(e);
								}
							}
							if (data.button.servcie_type === 'add') {
								let params = {
									type: 'add',
									serviceName: res.button.service_name,
									defaultVal: res.row,
									eventOrigin: res.button
								};
								uni.navigateTo({
									url: '/pages/public/formPage/formPage?params=' +
										encodeURIComponent(JSON.stringify(params))
								});
							} else if (data.button.servcie_type === 'select') {
								let params = {
									type: 'select',
									serviceName: res.button.service_name,
									defaultVal: res.row,
									eventOrigin: res.button
								};
								//
								// uni.navigateTo({
								// 	url: '/pages/public/formPage/formPage?params=' + JSON.stringify(params)
								// });
								uni.navigateTo({
									url: '/pages/public/list/list?serviceName=srvzhxq_syrk_select&pageType=list&viewTemp={"title":"_fwbm_disp","tip":"fwyt","footer":"rylx"}&cond=[{"colName":"is_fuzeren","ruleType":"like","value":"是"},{"colName":"openid","ruleType":"like","value":"user_no"}]'
								});
							}
						} else if (data.button.servcie_type === 'add') {} else if (data.button && data.button
							.operate_type === '流程申请') {
							uni.navigateTo({
								url: '/pages/public/proc/apply/apply?serviceName=' + data.button
									.operate_service
							});
						}
					});
				}
				console.log('clickFootBtn:', data);
			},
			async getListV2() {
				let app = uni.getStorageSync('activeApp');
				let self = this;
				let colVs = await this.getServiceV2(this.serviceName, 'list', this.pageType === 'proc' ? 'proclist' :
					'list', app);
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				if (!this.navigationBarTitle) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				}
				this.listConfig = colVs;
				colVs = this.deepClone(colVs);
				console.log('colVs', colVs);
				if (this.pageType === 'proc') {
					this.showFootBtn = false;
				}
				this.publicButton = colVs.gridButton.filter(item => {
					// if (item.permission === true) {
					switch (item.button_type) {
						case 'add':
						if(self.serviceName==='srvdaq_street_exam_select'){
							if(!self.streetInfo.streetInfo){
								this.showAdd = false
							}
						}
						case 'apply':
							this.showAdd = true;
							if (self.serviceName === 'srvdaq_street_house_select') {
								// this.showAdd = false;
							}
							if (this.serviceName === 'srvdaq_street_house_add') {
								if (!this.roleInfo.streetRoadInfo) {
									this.showAdd = false;
								}
							}
							return item;
							break;
						case 'select':
							this.showSearchBar = true;
							// #ifdef MP-WEIXIN
							this.listTop = 100;
							// #endif
							return item;
							break;

					}
					// }
				});
				return colVs;
			}
		},
	};
</script>

<style lang="scss">
	.search-bar {
		// height: 100px;
	}

	.add-button {
		position: fixed;
		bottom: 100upx;
		left: calc(50% - 50upx);
		width: 100upx;
		height: 100upx;
		border-radius: 50%;
		// background-color: #0bc99d;
		background-color: #0081ff;
		z-index: 100;
		transition: all 0.2s;

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
			filter: blur(1px);
		}
	}
</style>
