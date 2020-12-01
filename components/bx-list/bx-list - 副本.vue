<template>
	<view class="list-wrap">
		<view class="list-wrap">
			<scroll-view scroll-x class="bg-white nav cu-bar" v-if="listType === 'proc' && tabList.length > 1">
				<view class="flex text-center ">
					<view
						class="cu-item flex-sub"
						:class="index == TabCur ? 'current-tab cur' : ''"
						v-for="(item, index) in tabList"
						:key="index"
						@tap="tabSelect($event, item, index)"
						:data-id="index"
					>
						{{ item.label }}
						<text class="current-tab" style="margin-left: 10upx; padding:0 10upx;border-radius: 10upx;">{{ item.total }}</text>
					</view>
				</view>
			</scroll-view>
			<sPullScroll
				ref="pullScroll"
				:heightStyle="heightStyle"
				:pullDown="pullDown"
				:pullUp="loadData"
				:enablePullDown="enablePullDown"
				:enablePullUp="enablePullUp"
				:top="top"
				:fixed="fixed"
				:bottom="bottom"
				finishText="我是有底线的..."
			>
				<view class="" v-if="listType === 'list'">
					<list-item
						:detailList="detailList"
						v-for="item in listData"
						:key="item[rowKey]"
						:itemData="item"
						:viewTemp="viewTemp"
						:queryLeftWord="queryLeftWord"
						:tempWord="tempWord"
						:viewType="viewType"
						:imageNum="imageNum"
						:showButton="showButton"
						:gridRowNum="gridRowNum"
						:rowButton="rowButton"
						:srv_cols="srv_cols"
						:listType="listType"
						@click-list-item="clickItem"
						@click-foot-btn="clickFootBtn"
					></list-item>
				</view>
				<view v-if="listType === 'proc'">
					<list-item
						:detailList="detailList"
						v-for="(item, index) in tabList[TabCur]['data']"
						:key="index"
						:itemData="item"
						:viewTemp="viewTemp"
						:queryLeftWord="queryLeftWord"
						:tempWord="tempWord"
						:viewType="viewType"
						:imageNum="imageNum"
						:gridRowNum="gridRowNum"
						:rowButton="rowButton"
						:srv_cols="srv_cols"
						:listType="listType"
						@click-list-item="clickItem"
						@click-foot-btn="clickFootBtn"
					></list-item>
				</view>
			</sPullScroll>
		</view>

		<view class="pagination">
			<text class="page-no">{{ pageInfo.pageNo }}</text>
			<text class="total">{{ pageInfo.total }}</text>
		</view>
	</view>
</template>

<script>
import listItem from '@/components/bx-list/bx-list-item.vue';
import sPullScroll from '@/components/s-pull-scroll';
export default {
	components: { listItem, sPullScroll },
	data() {
		return {
			index: -1,
			TabCur: 0,
			listData: [],
			noData: false,
			pageInfo: {
				total: 0,
				rownumber: this.rownumber,
				pageNo: 1
			},
			srv_cols: [],
			rowButton: this.rowButtons,
			searchCol: '',
			tabList: [],
			tabsLength: '',
			proc_data_type: 'wait'
		};
	},
	watch: {
		pageInfo: {
			deep: true,
			handler(newValue) {
				console.log('Page:', newValue.total <= newValue.rownumber * newValue.pageNo);
				if (newValue.total <= newValue.rownumber * newValue.pageNo) {
					this.noData = true;
					this.$emit('loadEnd', newValue);
				} else {
					this.noData = false;
				}
			}
		},
		relation_condition: {
			deep: true,
			immediate: true,
			handler(newValue) {
				console.log('relation_condition', newValue);
			}
		},
		listConfig: {
			deep: true,
			immediate: true,
			handler(newValue) {
				if (newValue && newValue.hasOwnProperty('srv_cols')) {
					this.srv_cols = newValue.srv_cols;
					let rowButton = newValue.rowButton;
					debugger
					if (rowButton) {
						rowButton = rowButton.filter(item => {
							if (item.button_type == 'procdetail' && uni.getStorageSync('activeApp') === 'zhxq') {
								item.button_name = '详情';
								return item;
							}
							if (item.more_config) {
								let more_config = {};
								try {
									more_config = JSON.parse(item.more_config);
									item['moreConfig'] = more_config;
								} catch (e) {
									console.log(e);
									//TODO handle the exception
								}
								if (
									// item.button_type === 'edit' ||
									// item.button_type === 'delete' ||
									item.button_type === 'procdetail' ||
									((item.button_type === 'customize' && more_config && more_config.type === 'share') || more_config.type === 'qrcode') ||
									more_config.type === 'primary' ||
									more_config.type === 'shareBind'
								) {
									return item;
								}
							}
							if (item.button_name === '住户登记' || item.button_name === '绑定房屋') {
								return item;
							}
						});
						this.rowButton = rowButton;
					}
				}
			}
		},
		searchColumn: {
			immediate: true,
			handler(newValue) {
				if (newValue) {
					this.searchCol = newValue;
				} else if (this.viewTemp && this.viewTemp.title) {
					this.searchCol = this.viewTemp.title;
				}
			}
		}
	},
	props: {
		// 是否允许下拉刷新
		enablePullDown: {
			type: Boolean,
			default: true
		},
		// 是否允许上拉加载
		enablePullUp: {
			type: Boolean,
			default: true
		},
		//是否是详情列表
		detailList: {
			type: Boolean,
			default: false
		},
		// height
		heightStyle: {
			type: String,
			default: ''
		},
		showButton: {
			type: String,
			default: 'true'
		},
		// class
		customClass: {
			type: String,
			default: ''
		},
		// 距顶部(rpx)
		top: {
			type: [Number, Array, String],
			default() {
				return 0;
			}
		},
		// 距底部(rpx)
		bottom: {
			type: [Number, Array, String],
			default() {
				return 0;
			}
		},

		// 是否通过fixed固定高度, 默认true
		fixed: {
			type: Boolean,
			default: true
		},
		listConfig: {
			type: Object,
			default: () => {}
		},
		viewType: {
			type: String,
			default: 'normal'
		},
		viewTemp: {
			type: Object,
			default: () => {}
		},
		tempWord: {
			type: Object,
			default: () => {}
		},
		queryLeftWord: {
			type: Object,
			default: () => {}
		},
		imageNum: {
			type: Number,
			default: 1
		},
		gridRowNum: {
			type: Number,
			default: 2
		},
		rowKey: {
			type: String,
			default: 'id'
		},
		serviceName: {
			type: String,
			default: ''
		},
		srvApp: {
			type: String,
			default: ''
		},
		condition: {
			type: Array,
			default: () => {
				[];
			}
		},
		relation_condition: {
			type: Object,
			default: () => {}
		},
		rownumber: {
			type: Number,
			default: 10
		},
		order: {
			type: Array,
			default: () => {
				[];
			}
		},
		searchWords: {
			//搜索关键词
			type: String,
			default: ''
		},
		isWy: {
			type: Boolean,
			default: false
		},
		searchColumn: {
			//搜索字段
			type: String,
			default: ''
		},
		rowButtons: {
			type: Array,
			default: () => {
				[];
			}
		},
		listType: {
			type: String, //list||proc
			default: 'list'
		}
	},
	methods: {
		tabSelect(e, item, index) {
			console.log(e);
			this.TabCur = e.currentTarget.dataset.id;
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
			this.proc_data_type = item.proc_data_type;
			this.tabList[this.TabCur]['data'] = [];
			this.pageInfo = { total: 0, rownumber: 5, pageNo: 1 };
			// this.tabList[this.TabCur]['page'] = { total: 0, rownumber: 5, pageNo: 1 };
			this.listData = [];
			this.onRefresh();
		},
		toSearch() {
			let keywords = this.searchWords;
			this.pageInfo.pageNo = 1;
			this.onRefresh();
		},
		trigger(e) {
			console.log('trigger', e);
			this.$emit('trigger', e);
		},
		fabClick(e) {
			console.log('fabClick', e);
			this.$emit('fab-click', e);
		},
		clickItem(data) {
			this.$emit('click-list-item', data);
		},
		clickFootBtn(data) {
			this.$emit('clickFootBtn', data);
		},
		async getListData(cond, proc_data_type, i) {
			
			uni.showLoading({
				mask: true
			});
			let self = this;
			let serviceName = this.serviceName;
			let app = uni.getStorageSync('activeApp');
			let url = this.getServiceUrl(this.srvApp ? this.srvApp : app, serviceName, 'select');
			let req = {
				serviceName: serviceName,
				colNames: ['*'],
				condition: this.condition,
				page: { rownumber: this.pageInfo.rownumber, pageNo: this.pageInfo.pageNo },
				order: this.order
			};
			if (self.relation_condition && Array.isArray(self.relation_condition.data) && self.relation_condition.data.length > 0) {
				req.condition = [];
				req.relation_condition = self.relation_condition;
			}
			if (this.listType === 'proc') {
				if (proc_data_type || this.proc_data_type) {
					req['proc_data_type'] = proc_data_type || this.proc_data_type;
				} else {
					req['proc_data_type'] = 'wait';
				}
			}
			if (cond && cond.length > 0) {
				req.condition = req.condition.concat(cond);
			}
			let keywords = this.searchWords;
			if (keywords) {
				req.condition = req.condition.concat([{ colName: this.searchCol, ruleType: 'like', value: keywords }]);
			}
			let res = await this.$http.post(url, req);
			uni.hideLoading();

			if (res.data.state === 'SUCCESS') {
				if (this.pageInfo.pageNo === 1) {
					self.listData = [];
				}
				self.listData = self.listData.concat(res.data.data);
				self.pageInfo.total = res.data.page.total;
				self.pageInfo.pageNo = res.data.page.pageNo;
				self.$emit('list-change', self.listData);

				if (self.listType === 'proc') {
					for (let i = 0; i < self.tabList.length; i++) {
						let item = self.tabList[i];
						if (item.proc_data_type === req.proc_data_type) {
							item.data = self.listData;
							item.total = res.data.page.total;
							item.page = res.data.page;
							self.$set(self.tabList, i, item);
						}
					}
					self.listData = [];
					self.listData = self.tabList[self.TabCur]['data'];
					let callBackData = {
						data: self.listData,
						page: res.data.page,
						proc_data_type: req.proc_data_type
					};
					let page = self.pageInfo;
					return callBackData;
				} else if (self.listType === 'list') {
					let page = self.pageInfo;
					if (page.rownumber * page.pageNo >= page.total) {
						// finish(boolean:是否显示finishText,默认显示)
						self.$refs.pullScroll.finish();
					} else {
						self.$refs.pullScroll.success();
					}
				}
				return self.listData;
			}
		},
		onRefresh() {
			this.pageInfo.pageNo = 1;
			// this.getListData();
			this.$nextTick(() => {
				this.$refs.pullScroll.refresh();
			});
		},
		pullDown(pullScroll) {
			console.log(pullScroll.page);
			let page = this.pageInfo;
			this.pageInfo.pageNo = 1;
			setTimeout(() => {
				this.getListData().then(callBackData => {
					if (this.listType === 'proc') {
						if (callBackData.page.rownumber * callBackData.page.pageNo >= callBackData.page.total) {
							// finish(boolean:是否显示finishText,默认显示)
							this.$refs.pullScroll.finish();
						} else {
							this.$refs.pullScroll.success();
						}
					}
				});
				// this.loadData(pullScroll);
			}, 200);
		},
		loadData(pullScroll) {
			console.log("上拉加载")
			let page = this.pageInfo;
			this.pageInfo.pageNo = pullScroll.page;
			if (this.listType === 'proc') {
				this.tabList[this.TabCur].page.pageNo = pullScroll.page;
			}
			console.log(pullScroll.page);
			this.getListData().then(res => {
				if (this.listType === 'proc') {
					if (res.page.rownumber * res.page.pageNo >= res.page.total) {
						// finish(boolean:是否显示finishText,默认显示)
						this.$refs.pullScroll.finish();
					} else {
						this.$refs.pullScroll.success();
					}
				}
				// if (page.rownumber * page.pageNo >= page.total) {
				// 	// finish(boolean:是否显示finishText,默认显示)
				// 	pullScroll.finish();
				// } else {
				// 	pullScroll.success();
				// }
			});
		},
		getAllData(pageNos) {
			// if(pageNos){
			this.pageInfo.pageNo = pageNos ? pageNos : this.pageInfo.pageNo == 0 ? 1 : this.pageInfo.pageNo;
			// }
			if (this.serviceName && this.listType === 'list') {
				this.getListData();
			} else if (this.serviceName && this.listType === 'proc') {
				this.tabList.forEach(item => {
					this.getListData([], item.proc_data_type).then(data => {
						console.log('PageInfo', data);
						if (data.proc_data_type === 'wait') {
							let pageInfo = data.page;
							if (pageInfo.rownumber * pageInfo.pageNo >= pageInfo.total) {
								// finish(boolean:是否显示finishText,默认显示)
								this.$refs.pullScroll.finish();
								// this.$refs.pullScroll.success();
							} else {
								// this.$refs.pullScroll.success();
							}
						} else {
							// this.$refs.pullScroll.finish();
						}
					});
					this.onRefresh();
				});
			}
		}
	},
	onReachBottom() {
		console.log('监听');
	},
	mounted() {
		console.log('---bxlist-----mounted---', uni.getStorageSync('isWy'));
		this.pageInfo.pageNo = 0;
		let serviceName = this.serviceName;
		let isOwner = uni.getStorageSync('is_owner');
		let isWy = uni.getStorageSync('isWy');
		let isBaoAn = uni.getStorageSync('is_baoan');
		if (isWy == true && (serviceName == 'srvzhxq_member_fuwu_select' || serviceName == 'srvzhxq_clgl_select')) {
			this.tabList = [
				{
					label: '待我处理',
					proc_data_type: 'wait',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				},
				{
					label: '我的全部',
					proc_data_type: 'myall',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				},
				{
					label: '我的申请',
					proc_data_type: 'mine',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				},
				{
					label: '我已处理',
					proc_data_type: 'processed',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				}
			];
			this.proc_data_type = 'wait';
		} else if ((isOwner || isBaoAn) && serviceName == 'srvzhxq_guest_mgmt_select') {
			this.tabList = [
				{
					label: '待我处理',
					proc_data_type: 'wait',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				},
				{
					label: '我的全部',
					proc_data_type: 'myall',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				},
				{
					label: '我的申请',
					proc_data_type: 'mine',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				},
				{
					label: '我已处理',
					proc_data_type: 'processed',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				}
			];
			this.proc_data_type = 'wait';
		} else if (!isOwner && serviceName == 'srvzhxq_guest_mgmt_select') {
			this.tabList = [
				{
					label: '我的申请',
					proc_data_type: 'mine',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				}
			];
			this.proc_data_type = 'mine';
		} else if (
			serviceName == 'srvzhxq_repairs_select' ||
			serviceName == 'srvzhxq_syrk_select' ||
			serviceName == 'srvzhxq_member_fuwu_select' ||
			serviceName == 'srvzhxq_clgl_select'
		) {
			this.tabList = [
				{
					label: '我的全部',
					proc_data_type: 'myall',
					data: [],
					total: 0,
					page: {
						total: 0,
						rownumber: 5,
						pageNo: 1
					}
				}
			];
			this.proc_data_type = 'myall';
		}
		
		this.getAllData();
		this.tabsLength = this.tabList.length;
	}
};
</script>

<style lang="scss" scoped>
.list-wrap {
	width: 100%;
	display: flex;
	flex-direction: column;
	.current-tab {
		color: #0bc99d;
	}
}
.pagination {
	position: fixed;
	bottom: 120rpx;
	right: 40upx;
	width: 80upx;
	height: 80upx;
	border-radius: 50%;
	border: 1px solid rgba($color: #999, $alpha: 0.5);
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	z-index: 100;
	&::after {
		content: '';
		position: absolute;
		background-color: rgba($color: #999, $alpha: 0.5);
		width: 80%;
		height: 2upx;
		top: 50%;
	}
	.page-no {
		font-size: 28upx;
	}
	.total {
		font-size: 20upx;
		color: #666;
		transform: scale(0.8, 0.8);
	}
}
.nav .cu-item {
	padding: 0;
}
.animation-slide-top {
	animation-name: slide-top;
}
@keyframes slide-top {
	0% {
		opacity: 0;
		height: 0;
		transform: translateY(-100%);
	}

	100% {
		opacity: 1;
		height: auto;
		transform: translateY(0);
	}
}
</style>
