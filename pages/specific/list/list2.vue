<template>
	<view class="list-wrap">
		<view class="cu-bar fixed bg-white">
			<scroll-view scroll-x class="bg-white nav" scroll-with-animation>
				<view class="flex text-center">
					<view class="cu-item flex-sub" :class="index==TabCur?'text-green cur':''"
						v-for="(item,index) in tabs" :key="index" @tap="tabSelect(index)">
						{{item}}
					</view>
				</view>
			</scroll-view>
			<!-- 	<view class="action">
				<button class="cu-btn bg-blue shadow-blur round add-btn" @click="toAdd">+</button>
			</view> -->
		</view>
		<view class="cu-bar ">

		</view>
		<view class="list" v-if="loadStatus!=='noMore'||(loadStatus==='noMore'&&list.length>0)">
			<view class="list-item" v-for="item in list" :key="item.id" @click="toDetail(item)">
				<view class="item-top">
					<view class="item-title">
						<view class="label">
							户主:
						</view>
						<view class="value text-bold">{{ item._house_no_disp || item.holder || '' }}</view>
						<view class="text-bold" v-if="item._road_no_disp">
							,{{item._road_no_disp||''}}
						</view>
					</view>
					<view class="item-title">
						<view class="label">
							检查日期:
						</view>
						<view class="value">
							{{item.check_date||''}}
						</view>
					</view>
				</view>
				<view class="item-content">
					<view class="result-remark">
						<view class="title">
							结果说明：
						</view>
						<view class="text-area result-content">
							{{item.remark||''}}
						</view>
					</view>
					<view class="result-remark" @click.stop="" v-if="item.file_no">
						<view class="title">
							巡查附件：
						</view>
						<view class="result-image result-content"
							@tap="toPreviewImage(item.imageList.map(e=>e.originUrl))">
							<image class="image" :src="pic.originUrl" v-for="pic in item.imageList"></image>
						</view>
					</view>
					<view class="result-remark" v-if="item.report">
						<view class="label margin-right">
							整改时限及结果: 
						</view>
						<view class="value">
							{{item.report||''}}
						</view>
					</view>
					<view class="result-remark" v-if="item.report_txt">
						<view class="title">
							整改说明
						</view>
						<view class="text-area result-content">
							{{item.report_txt||''}}
						</view>
					</view>
				</view>
				<view class="item-footer" v-if="item.check_result==='需整改'&&!item.report_status">
					<view class="cu-bar bg-white">
						<view class="action">
							<!-- <button class="cu-btn bg-green shadow-blur round margin-right-xs">搜索</button> -->
							<button class="cu-btn bg-blue shadow-blur " @click.stop="toDetail(item)">整改确认</button>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="content-empty" v-else>
			<text class="cuIcon-bad"></text>
			<text>暂无数据</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadStatus: 'more', // more noMore loading
				list: [],
				TabCur: 0,
				tabs: ['待整改', '已整改'],
				page: {
					pageNo: 1,
					rownumber: 5,
					total: 0
				}
			}
		},
		methods: {
			tabSelect(e) {
				this.TabCur = e
				this.page.pageNo = 1
				this.selectList()
			},
			toAdd() {
				uni.navigateTo({
					url: '/pages/public/formPage/formPage?serviceName=srvdaq_street_check_record_add&type=add'
				})
			},
			toDetail(e) {
				if (e.record_no) {
					uni.navigateTo({
						url: '/pages/specific/listDetail/listDetail?record_no=' + e.record_no
					})
				}
			},
			async getImage(e) {
				if (e) {
					let imagesUrl = [];
					let images = await this.getFilePath(e)
					if (Array.isArray(images)) {
						for (let i = 0; i < images.length; i++) {
							const obj = {
								originUrl: `${this.$api.getFilePath}${images[i].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`,
								smallUrl: `${this.$api.getFilePath}${images[i].fileurl}&thumbnailType=fwsu_100&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
							}
							imagesUrl.push(obj);
						}
					}
					return imagesUrl
				}
			},
			async selectList(refresh = false) {
				if (refresh) {
					this.page.pageNo = 1
				}
				let req = {
					"serviceName": "srvdaq_street_check_record_select",
					"colNames": ["*"],
					"condition": [],
					"page": {
						"pageNo": this.page.pageNo,
						"rownumber": this.page.rownumber
					},
				}
				if (this.TabCur === 0) {
					req.condition.push({
						colName: 'report_status',
						ruleType: 'isnull',
						value: ""
					})
					req.condition.push({
						colName: 'check_result',
						ruleType: 'eq',
						value: "需整改"
					})
					// req.condition.push({
					// 	colName: 'report_status',
					// 	ruleType: 'isnull',
					// 	value: ""
					// })
				} else if (this.TabCur === 1) {
					req.condition.push({
						colName: 'report_status',
						ruleType: 'eq',
						value: "已整改"
					})
				}
				let url = this.getServiceUrl('daq', 'srvdaq_street_check_record_select', 'select');
				this.loadStatus = 'loading'
				let res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
					// 
					let page = res.data.page
					for (let item of res.data.data) {
						if (item.file_no) {
							item.imageList = await this.getImage(item.file_no)
						}
					}
					if (page.pageNo === 1) {
						this.list = res.data.data
					} else {
						this.list = [...this.list, ...res.data.data]
					}
					if (page.total <= page.rownumber * page.pageNo) {
						this.loadStatus = 'noMore'
					} else {
						this.page.pageNo++
						this.loadStatus = 'more'
					}
				}
			},
		},
		onReachBottom() {
			// 触底上滑加载
			if (this.loadStatus === 'more') {
				this.selectList()
			}
		},
		onLoad() {
			uni.startPullDownRefresh()
		},
		onPullDownRefresh() {
			// 下拉刷新
			this.selectList(true).then(_ => {
				setTimeout(() => {
					uni.stopPullDownRefresh()
				}, 500)
			})
		}
	}
</script>

<style scoped lang="scss">
	.list-wrap {
		min-height: 100vh;

		// min-height: calc(100vh - var(--window-top) - var(--window-bottom));
		.cu-bar {
			justify-content: flex-end;

			.add-btn {
				font-size: 20px;
			}
		}
	}

	.list {
		padding: 10rpx;
		min-height: calc(100vh - var(--window-top) - var(--window-bottom));

		.list-item {
			padding: 20rpx;
			margin-bottom: 10px;
			background-color: #fff;
			border-radius: 10rpx;

			.item-top {
				padding: 20rpx 0;
				display: flex;
				justify-content: space-between;
				border-bottom: 1px solid #F1F1F1;

				.item-title {
					display: flex;
					align-items: center;
					justify-content: center;
				}

			}


			.item-content {
				margin-top: 10rpx;

				.result-remark {
					display: flex;
					margin-bottom: 10rpx;
					padding: 10rpx 0;

					.title {
						width: 150rpx;
					}

					.result-content {
						width: calc(100% - 150rpx);
						padding: 0 10rpx;
						border-radius: 5rpx;
						min-height: 50px;
						// border: 1px solid #dcdfe6;
					}

					.text-area {
						border-radius: 10rpx;
						background-color: #f1f1f1;
					}

					.result-image {
						display: flex;

						.image {
							height: 120rpx;
							max-width: 33%;
						}
					}
				}
			}

			.item-footer {
				border-top: 1px solid #f1f1f1;
			}
		}

	}

	.content-empty {
		height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		color: #777;

		.cuIcon-bad {
			font-size: 40px;
		}
	}
</style>
