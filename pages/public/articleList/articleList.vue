<template>
	<view class="list-wrap">
		<view class="content news-list">
			<view class="news-item " :class="{
				'none-image':!item.icon_image,
						'layout-right-image':item.icon_image,
						'layout-left-image':item.cover_pic_style==='左侧'&&item.icon_image,
						'layout-center-single-image':item.cover_pic_style==='下一'&&item.icon_image,
						'layout-center-multi-image':item.cover_pic_style==='下三'&&item.icon_image
						}" v-for="(item,noticeIndex) in articleList" :key="noticeIndex" @click="toArticle(item)">
				<image class="image-icon" :src="getImagePath(item.icon_image)" v-if="item.icon_image">
				</image>
				<view class="content-box">
					<text class="title-text">
						<text> {{ item.title }}</text>
						<text class="text-red cuIcon-hotfill"
							v-if="item&&item.other_status&&item.other_status==='热门'">hot</text>
						<text class="line-red" v-if="item&&item.other_status&&item.other_status==='精选'">精选</text>
						<text class="line-red" v-if="item&&item.top_status&&item.top_status==='是'">置顶</text>
					</text>
					<text class="date">{{ formateDate(item.create_time) }}</text>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadStatus"></uni-load-more>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cateNo: '', // 栏目编号
				cate_name: '',
				articleList: [],
				storeNo: '',
				condition: [], // 查询条件
				loadStatus: 'noMore', //more,loading,noMore
				page: {
					total: 0,
					rownumber: 10,
					pageNo: 1
				}
			}
		},
		methods: {
			async getListData(type = 'refresh') {
				if (type === 'refresh') {
					this.page.pageNo = 1
				}
				let req = {
					condition: this.condition,
					order: [{
						colName: "top_status",
						orderType: "desc"
					}, {
						colName: "other_status",
						orderType: "desc"
					}, {
						colName: "create_time",
						orderType: "desc"
					}],
					page: {
						pageNo: this.page.pageNo,
						rownumber: this.page.rownumber
					},
					serviceName: "srvdaq_cms_content_select"
				}
				this.loadStatus = 'loading'
				let res = await this.$fetch('select', 'srvdaq_cms_content_select', req, 'daq')
				if (res.success) {
					if (type === 'refresh') {
						this.articleList = res.data
					} else {
						this.articleList = [...this.articleList, ...res.data]
					}
					if (res.page) {
						if (res.page.total > res.page.rownumber * res.page.pageNo) {
							this.loadStatus = 'more'
							this.page.pageNo++
						} else {
							this.loadStatus = 'noMore'
						}
					}
				}
			},
			toArticle(e) {
				if (e.content_no) {
					uni.navigateTo({
						url: `/pages/specific/article/article?content_no=${ e.content_no }`
					});
				}
			},
		},
		onPullDownRefresh() {
			this.getListData().then(_ => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			if (this.loadStatus !== 'noMore') {
				this.getListData('loadmore')
			}
		},
		onLoad(option) {
			if (option.cate_name) {
				this.cate_name = option.cate_name
				uni.setNavigationBarTitle({
					title: option.cate_name
				})
			}
			if (option.cateNo) {
				this.cateNo = option.cateNo
					this.getListData()
			}
			if (option.condition) {
				this.condition = JSON.parse(option.condition)
			}
			if (Array.isArray(this.condition) && this.cateNo) {
				this.condition.push({
					colName: 'no',
					ruleType: 'eq',
					value: this.cateNo
				})
			}
			if (Array.isArray(this.condition)) {
				this.condition.push({
					colName: 'content_status',
					ruleType: 'eq',
					value: '发布'
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.list-wrap {
		// 简介
		margin-bottom: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		min-height: calc(100vh - var(--window-top) - var(--window-bottom));

		.title {
			font-size: 28rpx;
			font-weight: 700;
			padding: 10rpx 0;
			color: rgb(48, 49, 51);
			display: flex;
			justify-content: space-between;

			.to-more {
				width: 100rpx;
				display: flex;
				justify-content: flex-end;
				align-items: center;
			}

			.cuIcon-right {
				font-weight: 200;
			}
		}

		.news-list {
			.news-item {
				display: flex;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #f1f1f1;
				align-items: center;

				.title-text {
					width: 70%;
					overflow: hidden;
					text-overflow: ellipsis;
					// white-space: nowrap;
					font-size: 32rpx;

					.text-red {
						display: inline-block;
						margin-left: 10rpx;
						font-size: 24rpx;
						position: relative;
						top: -10rpx;
						font-weight: bold;
					}

					.line-red {
						border-radius: 5px;
						margin-left: 10rpx;
						padding: 2px 4px;
						font-size: 12px;
						font-weight: bold;
						border: 1rpx solid #e54d42;
					}
				}

				.content-box {
					flex: 1;
					display: flex;
					flex-direction: column;
				}

				.date {
					color: #ccc;
				}

				&.none-image {
					// 无图
					flex-direction: column;
					align-items: flex-start;

					.content-box {
						height: auto;
						min-height: 50rpx;
					}

					.title-text {
						font-size: 16px;
						width: 100%;
						white-space: normal;
						padding-bottom: 10px;
					}

					.date {
						font-size: 12px;
					}
				}

				&.layout-center-single-image,
				&.layout-center-single-image-top {
					flex-direction: column-reverse;
					border-radius: 10rpx;
					padding: 0;
					border: none;
					overflow: hidden;
					box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
					margin-bottom: 20rpx;

					.image-icon {
						width: 100%;
						height: 200rpx;
					}

					.content-box {
						padding: 10rpx 20rpx;
						width: 100%;
						display: flex;
						flex-direction: row;

						.title-text {
							font-weight: bold;
							margin-left: 0;
							width: calc(100% - 250rpx);
							flex: 1;
						}
					}
				}

				&.layout-center-single-image-top {
					flex-direction: column;
				}

				&.layout-right-image,
				&.layout-left-image {
					// 左图
					flex-direction: row;
					flex-wrap: wrap;

					.content-box {
						min-height: 150rpx;
						width: calc(100% - 250rpx);
					}

					.image-icon {
						width: 200rpx;
						height: 150rpx;
						border-radius: 5px;
					}

					.title-text {
						margin-left: 20rpx;
						flex: 1;
						width: 100%;
					}

					.date {
						margin-left: 20rpx;
					}
				}

				&.layout-right-image {
					// 右图
					flex-direction: row-reverse;

					.title-text {
						margin-left: 0;
					}

					.date {
						margin-left: 0;
					}
				}
			}
		}
	}
</style>
