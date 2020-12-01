<template>
	<view class="" style="position: relative;">
		<swiper
			class="swiper"
			:style="{height: swperheight}"
			:indicator-dots="swiperDots"
			:autoplay="autoplay"
			:indicator-color="swiperColor"
			:interval="interval"
			:duration="duration"
			:indicator-active-color="swiperActiveColor"
		>
			<swiper-item style="width: 100%;">
				<view class="swiper-item">
					<view class="swiper-item-view" v-for="(item, index) in swiperList" :key="index" v-if="index < 10" @click="clickItem(item)">
						<view  class="crip" :style="{background:bgcolor[index]}" >{{item.name[0]}}</view>
						<text>{{ item.name }}</text>
					</view>
				</view>
			</swiper-item>
			
			<block v-if="swiperList.length > 10">
				<swiper-item style="width: 100%;">
					<view class="swiper-item">
						<view class="swiper-item-view" v-for="(item, index) in swiperList" :key="index" v-if="index > 9 && index < 20" @click="clickItem(item)">
						<view  class="crip" :style="{background:bgcolor[index]}" >{{item.name[0]}}</view>
							<text>{{ item.name }}</text>
						</view>
					</view>
				</swiper-item>
			</block>
		</swiper>
		<view class="dots" v-if="customize == true && swiperDots == false">
			<block v-for="(item, index) in swiperList" :key="index" v-if="index < 2 && swiperList.length > 10">
				<view
					class="dot"
					:class="[index == swiperCurrent ? 'active' : '']"
					:style="[index == swiperCurrent ? { background: swiperActiveColor } : { background: swiperColor }]"
				></view>
			</block>
		</view>
	</view>
</template>

<script>
export default {
	name: 'cg-swiper',
	props: {
		
		// 指示点颜色
		swiperColor: {
			type: String,
			default: '#999999'
		},
		// 选中指示颜色
		swiperActiveColor: {
			type: String,
			default: '#FFCC00'
		},
		// 是否自动切换
		autoplay: {
			type: Boolean,
			default: false
		},
		// 自动切换时长
		interval: {
			type: Number,
			default: 5000
		},
		// 滑动动画时长
		duration:{
			type: Number,
			default: 500
		},
		// 内容
		swiperList: {
			type: Array,
			default: function() {
				return [];
			}
		},
		// 开启指示点
		customize: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			swiperCurrent: 0,
			bgcolor: [
			  'linear-gradient(0deg,rgba(9,216,162,1),rgba(90,242,217,1))',
			  'linear-gradient(0deg,rgba(251,184,35,1),rgba(255,228,40,1))',
			  'linear-gradient(0deg,rgba(255,126,34,1),rgba(240,184,27,1))',
			  'linear-gradient(0deg,rgba(9,177,252,1),rgba(24,200,255,1))',
			   'linear-gradient(0deg,rgb(237, 160, 239), rgb(183, 76, 160))'
			],
			swperheight:'380upx',
			// 180
			 // Math.floor(Math.random()*(max-min+1))+min;
			 swiperDots:false
		};
	},
	methods: {
		swiperChange(e) {
			this.swiperCurrent = e.detail.current;
		},

		clickItem(item) {
			console.log(item.name)
			// this.$emit('clickItem', item);
		}
	},
	created() {
		if(this.swiperList.length>10){
			this.swiperDots=true
		}else if(this.swiperList.length<=5){
			this.swperheight='180upx'
		}
	}
};
</script>

<style>
.swiper {
	width: 100%;
	padding-top: 20upx;
	overflow: hidden;
}
.swiper-item {
	display: flex;
	flex-wrap: wrap;
}
.swiper-item-view {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 20%;
	height: 170upx;
}
.swiper-img {
	width: 100upx;
	height: 100upx;
}
.crip{
		width: 90upx;
		height: 90upx;
		border-radius: 50%;
		background: #007AFF;
		margin: 0 auto;
		line-height: 90upx;
		text-align: center;
		color: #FFFFFF;
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 5px;
	}
/* 轮播圆点样式修改 */
.dots {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 20upx;
	display: flex;
	justify-content: center;
}
.dots .dot {
	margin: 0 5upx;
	width: 40upx;
	height: 6upx;
	border-radius: 20%;
	transition: all 0.6s;
}
.dots .dot.active {
	width: 40upx;
}
</style>
