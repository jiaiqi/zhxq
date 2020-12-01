<template>
	<view class="permit_wrap">
		<!-- <view class="permit_top">
			<text>通行码</text>
		</view> -->
		<view v-if="rowData" class="permit_top">
			<view class="permit_top_t">
				<text>访客姓名：</text>
				<text>{{ rowData.xm }}</text>
			</view>
			<view class="permit_top_t">
				<text>访问地址：</text>
				<text>{{ rowData._lybm_disp + ' ' + rowData._dybm_disp + ' ' + rowData._fwbm_disp }}</text>
			</view>
			<view class="permit_top_t">
				<text>来访时间：</text>
				<text>{{ rowData.fwrq }}</text>
			</view>
			<view class="permit_top_t">
				<text>离开时间：</text>
				<text>{{ rowData.lkrq }}</text>
			</view>
		</view>
		<view class="permit_cen">
			<!-- <view class="permit_cen_t">
				<image src="../../../static/img/permit.png" mode=""></image>
			</view> -->
			<canvas v-show="isShow" canvas-id="qrcode" style="width: 350px;height: 350px;opacity: 0;" />
			<image v-show="!isShow" style="width: 350px;height: 350px;" :src="url" mode="">{{ failText }}</image>
			<!-- <view class="permit_cen_b">
				<text>进入小区时，请主动出示，配合小区检查人员</text>
			</view> -->
		</view>
		<view v-if="type && type == 'share'" class="bots"><button class="bg-green cu-btn lg" open-type="share">分享</button></view>
		<!-- <view  class="bots">
			<button class="bg-green cu-btn lg" open-type="share">分享</button>
		</view> -->
	</view>
</template>

<script>
import uQRCode from '@/common/uqrcode.js';
export default {
	name: 'permit',
	comments: {},

	data() {
		return {
			type: '',
			code: '',
			url: '',
			isShow: true,
			failText: '',
			rowData: ''
		};
	},
	onLoad(option) {
		console.log('option---------', option);
		if (option && option.type) {
			this.type = option.type;
		}
		let rowData = null;
		if (option.rowData) {
			rowData = JSON.parse(decodeURIComponent(option.rowData));
			this.rowData = rowData;
		}
		console.log('00000000', this.rowData);
		this.$nextTick(() => {
			if (option && option.code) {
				this.code = option.code;
				setTimeout(() => {
					this.make(this.rowData.qr_code ? this.rowData.qr_code : option.code);
				}, 400);
			}
		});
		// this.make('VjAwMSu8cWuljgtCcn/ybfRTRBK8mBwm/ds8QINYB57LJniavQsBZXc2Im0Vd/Ql8R3sXXA=')
		// setTimeout(()=>{
		// this.make("VjAwMSu8cWuljgtCcn/ybfRTRBK8mBwm/ds8QINYB57LJniavQsBZXc2Im0Vd/Ql8R3sXXA=")
		// },2000)
	},
	onShareAppMessage(res) {
		console.log('res=====>>>>>', res);
		return {
			title: '邀请来访',
			path: '/pages/specific/permit/permit?code=' + this.code + '&rowData=' + encodeURIComponent(JSON.stringify(this.rowData)),
			// path: '/pages/specific/permit/permit',
			success: function(res) {
				console.log('成功', res);
			}
		};
	},
	methods: {
		make(code) {
			console.log('code===', code);
			let self = this;
			if (code) {
				uni.showLoading({
					title: '加载中'
				});
				uQRCode.make({
					canvasId: 'qrcode',
					componentInstance: this,
					// text: "VjAwMSu8cWuljgtCcn/ybfRTRBK8mBwm/ds8QINYB57LJniavQsBZXc2Im0Vd/Ql8R3sXXA=",
					text: code,
					size: 350,
					margin: 5,
					backgroundColor: '#ffffff',
					foregroundColor: '#000000',
					fileType: 'png',
					correctLevel: 0,
					success: res => {
						try {
							self.isShow = false;
							self.url = res;
							console.log('self.url', self.url);
							console.log('加载成功', res);
						} catch (e) {
							self.failText = '获取二维码失败，点击重新获取';
							//TODO handle the exception
							console.log('catch--------失败');
						}
						uni.hideLoading();
					},
					fail: res => {
						console.log('失败');
					}
				});
			} else {
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.permit_wrap {
	width: 100%;
	height: 100vh;
	// background:lightgreen;
	padding-top: 20upx;
	.permit_top {
		padding: 50upx 0;
		// width: calc(100% - 80upx);
		font-size: 16px;
		// font-weight: 700;
		color: #fff;
		box-shadow: 3px 3px 4px rgba(26, 26, 26, 0.2);
		margin: 0upx 20upx 20upx 20upx;
		border-radius: 30upx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		// background-color: #25b125;
		// background-color: #0bc99d;
		// background-image: linear-gradient(45deg, #39b54a, #8dc63f);
		background-image: linear-gradient(30deg, #56ab2f, #a8e063);
	background-color: #43BFB4;
	background-image: linear-gradient(317deg,#43BFB4 27%,#3DC3A2 100%);
	background-image: -webkit-linear-gradient(317deg,#43BFB4 27%,#3DC3A2 100%);
	background-image: -moz-linear-gradient(317deg,#43BFB4 27%,#3DC3A2 100%);
	background-image: -o-linear-gradient(317deg,#43BFB4 27%,#3DC3A2 100%);
		
		.permit_top_t {
			margin-bottom: 10upx;
			min-width: 480rpx;
			// padding: 0 10px;
			
			text {
				// width: 300upx;
				// display: inline-block;
				&:first-child {
					// width: 260rpx;
					display: inline-block;
					text-align: right;
					margin-right: 20upx;
				}
			}
		}
	}
	.permit_cen {
		// width: 680upx;
		// height: 680upx;
		margin: 0 10upx;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 10upx;
		border-radius: 20upx;
		background-color: white;
		box-shadow: 3px 3px 4px rgba(26, 26, 26, 0.2);

		.permit_cen_t {
			width: 500upx;
			height: 500upx;
		}
	}
}
.bots {
	width: 100%;
	margin-top: 25upx;
	display: flex;
	justify-content: center;
	button {
		width: 95%;
		background-color: #43BFB4;
	}
}
</style>
