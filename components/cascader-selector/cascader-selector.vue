<template>
	<view class="cascader-wrap">
		<cascader
			:insert="insert"
			:hideBorder="hideBorder"
			:hidePath="hidePath"
			@tag-click="clickTag"
			:areaList="oldAreaList"
			:currentNo="current_no"
			@line-click="clickLine"
			@show-more="showMore"
			:showSelect="showSelect"
			:column="srvInfo.column||srvInfo.refed_col"
			:showCol="srvInfo.showCol||srvInfo.key_disp_col"
			:isShowMore="isShowMore"
			:lineDataDefault="lineDataDefault"
		></cascader>
		<view class="button-box" v-if="!hideButton">
			<button class="cu-btn bg-green" @click="resetData">重 置</button>
			<button class="cu-btn bg-blue" @click="emitSelectVal">{{ lineDataDefault[lineDataDefault.length - 1] ? '确 定' : '取 消' }}</button>
		</view>
	</view>
</template>

<script>
import cascader from './cascader.vue';
export default {
	name: 'cascaderSelector', //层叠选择器外层，处理数据
	components: { cascader },
	data() {
		return {
			areaList: [],
			total: 0,
			confirmText: '',
			parent_no: '',
			page: { total: 0, pageNo: 1, rownumber: 50 },
			showSelect: true,
			isShowMore: false, //是否显示‘更多’按钮
			outputData: {},
			currentClick: null,
			lineDataDefault: [], //线数据默认值
			searchKey: '', // 搜索关键词
			oldAreaList: [],
			current_no: ''
		};
	},
	methods: {
		resetData() {
			this.clickLine();
			this.parent_no = '';
		},
		showMore() {
			// 点击了‘更多’按钮
			// uni.showLoading()
			this.page.pageNo++;
			let condition = [];
			if (this.parent_no) {
				condition = [
					{
						colName: 'parent_no',
						ruleType: 'eq',
						value: this.parent_no
					}
				];
			} else if (this.srvInfo.isTree === false) {
				condition = [];
			} else {
				condition = [
					{
						colName: 'parent_no',
						ruleType: 'isnull'
					}
				];
			}
			this.getAreaData(condition, true);
			this.showSelect = true;
		},
		searchWithKey() {
			let condition = [];
			if (this.srvInfo.isTree) {
				condition.push({
					colName: 'parent_no',
					ruleType: this.parent_no ? 'eq' : 'isnull',
					value: this.parent_no
				});
			}
			if (this.searchKey) {
				condition.push({
					colName: this.srvInfo.key_disp_col,
					ruleType: 'like',
					value: this.searchKey
				});
			}
			this.getAreaData(condition).then(data => {
				this.oldAreaList = this.deepClone(data);
			});
			this.showSelect = true;
		},
		async getAreaData(cond, ismore, defaultVal, index, lastListIndex) {
			const srvInfo = this.srvInfo;
			const serviceName = srvInfo.serviceName;
			const appName = srvInfo.appNo;
			const that = this;
			let url = this.getServiceUrl(appName, serviceName, 'select');
			let condition = [];
			if (cond && !ismore) {
				condition = cond;
			} else if (cond && ismore) {
				condition = cond;
			} else if (srvInfo.isTree === false) {
				condition = [];
			} else {
				condition = [
					{
						colName: 'parent_no',
						ruleType: 'isnull'
					}
				];
			}
			let req = {
				serviceName: serviceName,
				colNames: ['*'],
				condition: condition,
				page: {
					pageNo: this.page.pageNo,
					rownumber: this.page.rownumber
				}
			};
			const res = await this.$http.post(url, req);
			if (res && res.data && res.data.state === 'SUCCESS') {
				if (!defaultVal) {
					const page = res.data.page;
					that.page.pageNo = page.pageNo;
					that.page.total = page.total;
					if (ismore) {
						// 展示更多
						that.areaList = that.areaList.concat(res.data.data);
					} else {
						that.areaList = res.data.data;
					}
					if (page.total > page.pageNo * page.rownumber) {
						that.isShowMore = true;
					} else {
						that.isShowMore = false;
					}
					return that.areaList;
				} else {
					const data = res.data.data;
					that.$set(this.lineDataDefault, index, data[0]);
					if (index === lastListIndex) {
						that.areaList = res.data.data;
					}
					return data;
				}
			}
		},
		clickTag(e) {
			this.currentClick = e;
			this.current_no = e.no;
			if (this.srvInfo.isTree === false) {
				this.$emit('getCascaderValue', e, 'sure');
				this.areaList = [];
				this.showSelect = false;
				return;
			}
			if (e.no) {
				if (this.parent_no && e.no === this.parent_no) {
					return;
				}
				if (e.parent_no === null) {
					this.lineDataDefault = [];
				} else if (e.parent_no === this.outputData.parent_no) {
					// 同级
					this.lineDataDefault.splice(this.lineDataDefault.findIndex(item => item.parent_no === e.parent_no), 1);
				} else if (this.lineDataDefault.findIndex(item => item.parent_no === e.parent_no) !== -1) {
					this.lineDataDefault.splice(this.lineDataDefault.findIndex(item => item.parent_no === e.parent_no), this.lineDataDefault.length);
				}
				this.outputData = e;
				this.$emit('clickTag', e);
				this.page.pageNo = 1;
				let condition = [
					{
						colName: 'parent_no',
						ruleType: 'eq',
						value: e.no
					}
				];
				let lineDataDefault = [...this.lineDataDefault, e];
				this.lineDataDefault = lineDataDefault;
				this.parent_no = e.no;
				console.log('parent_no', e);
				if (e.is_leaf === '是') {
					// this.showSelect = false;
				} else {
					this.showSelect = true;
				}
				this.getAreaData(condition).then(data => {
					let oldAreaList = this.oldAreaList;
					this.valuationChild(oldAreaList, data, e);
				});
			}
		},
		valuationChild(oldAreaList, child, e) {
			if (oldAreaList.length > 0) {
				oldAreaList.forEach(item => {
					if (item.no === e.no) {
						this.$set(item, 'child', child);
					}
					if (item.child) {
						this.valuationChild(item.child, child, e);
					}
				});
			}
		},
		clickLine(e, index) {
			console.log('click-line:', e, index);
			this.page.pageNo = 1;
			if (index < this.lineDataDefault.length - 1) {
				this.lineDataDefault = this.lineDataDefault.slice(0, index + 1);
			}
			if (e && e.no) {
				if (e.parent_no === null) {
					this.lineDataDefault = this.lineDataDefault.slice(0, 1);
				} else if (e.parent_no === this.outputData.parent_no) {
					// 同级
					this.lineDataDefault.splice(this.lineDataDefault.findIndex(item => item.parent_no === e.parent_no) + 1, 1);
				} else if (this.lineDataDefault.findIndex(item => item.parent_no === e.parent_no) !== -1) {
					// 父级
					this.lineDataDefault.splice(this.lineDataDefault.findIndex(item => item.parent_no === e.parent_no) + 1, this.lineDataDefault.length);
				}
				this.outputData = e;
				this.$emit('clickLine', e);
				let condition = [
					{
						colName: 'parent_no',
						ruleType: 'eq',
						value: e.no
					}
				];
				this.parent_no = e.no;
				this.getAreaData(condition).then(data => {
					let oldAreaList = this.oldAreaList;
					this.valuationChild(oldAreaList, data, e);
				});
				if (e.is_leaf === '是') {
					// this.showSelect = false;
				} else {
					this.showSelect = true;
				}
			} else if (!e) {
				this.lineDataDefault = [];
				this.getAreaData().then(data => {
					this.oldAreaList = this.deepClone(data);
				});
				this.showSelect = true;
			}
		},

		emitSelectVal() {
			if (this.lineDataDefault[this.lineDataDefault.length - 1]) {
				// 确定
				this.$emit('getCascaderValue', this.lineDataDefault[this.lineDataDefault.length - 1], 'sure');
			} else {
				// 取消
				this.$emit('getCascaderValue', false);
			}
		}
	},
	created() {
		if (this.srvInfo && this.srvInfo.serviceName) {
			this.getAreaData().then(data => {
				this.oldAreaList = this.deepClone(data);
			});
		}
	},
	props: {
		insert: {
			type: Boolean,
			default: false
		},
		hideBorder: {
			type: Boolean,
			default: false
		},
		hidePath: {
			type: Boolean,
			default: false
		},
		hideButton: {
			type: Boolean,
			default: false
		},
		srvInfo: {
			type: Object,
			default: () => {
				return {
					serviceName: 'srvdaq_check_area_select',
					appNo: 'daq'
				};
			}
		}
	}
};
</script>

<style lang="scss">
.cascader-wrap {
	width: 100%;
	background-color: #fff;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	overflow: scroll;
	.button-box {
		width: 100%;
		padding: 20rpx 0 40rpx;
		display: flex;
		justify-content: center;
		.cu-btn {
			width: 45%;
			margin-right: 20rpx;
			&:nth-child(2n) {
				margin-right: 0;
			}
		}
	}
}
</style>
