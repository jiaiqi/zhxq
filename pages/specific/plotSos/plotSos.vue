<template>
	<view class="instancy">
		<view class="instancy_top">
			<view class="instancy_top_t">
				遇到紧急情况时,请拨打以下电话
			</view>
			<view class="instancy_top_b">
				<image src="../../../static/sos.png" mode=""></image>
			</view>
		</view>
		<view class="instancy_bot">
			<view class="instancy_bot_t">
				紧急电话
			</view>
			<view v-if="listData.length>0" class="cu-list menu">
				<view v-for="(item,index) in listData" :key="index" class="cu-item">
					<view @tap="callUp(item)" class="content content_tt">
						<text class="text-grey content_t">{{item.name}}：</text>
						<text class="text-grey">{{item.value}}</text>
						<!-- <text class="text-grey">图标 + 标题</text> -->
					</view>
				</view>
				<!-- <view class="cu-item">
					<view class="content content_tt">
						<text class="text-grey content_t">物业：</text>
						<text class="text-grey">17532140514</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content content_tt">
						<text class="text-grey content_t">报警电话：</text>
						<text class="text-grey">110</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content content_tt">
						<text class="text-grey content_t">火警：</text>
						<text class="text-grey">119</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content content_tt">
						<text class="text-grey content_t">急救中心：</text>
						<text class="text-grey">120</text>
					</view>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:'plotSos',
		data(){
			return {
				listData:[
				]
			}
		},
		methods:{
			callUp(item){
				uni.makePhoneCall({
				    phoneNumber: item.value //仅为示例
				});
			},
			getSoSnum(){
				let urls = this.getServiceUrl('zhxq', 'srvzhxq_sos_select', 'select');
				let req = {
					serviceName:"srvzhxq_sos_select",
					colNames:['*']
				}
				this.$http.post(urls,req).then(res=>{
					this.listData = res.data.data
				})
			}
		},
		onLoad() {
			this.getSoSnum()
		}
	}
</script>

<style lang="scss" scoped>
	.instancy{
		.instancy_top{
			background-color: #ff5257;
			.instancy_top_t{
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 34upx;
				padding: 40upx 0;
				color: white;
			}
			.instancy_top_b{
				display: flex;
				justify-content: center;
				align-items: center;
				padding-bottom: 50upx;
				image{
					width: 300upx;
					height: 300upx;
				}
			}
		}
		.instancy_bot{
			.instancy_bot_t{
				display: flex;
				padding: 20upx;
				background: #fafafa;
				color: #8799a3;
				font-size: 34upx;
			}
		}
	}
	.content_tt{
		display: flex;
		// min-width: 180upx;
		justify-content: space-between;
	}
</style>
