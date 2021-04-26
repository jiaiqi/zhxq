<template>
	<view class="cascader-content" :class="{'insert':insert}">
		<view class="tag-line">
			<view class="bx-tagline" :class="{hideBorder:hideBorder}">
				<view
					@click="lineClick(item, index)"
					class="bx-item bx-text-blue"
					v-for="(item, index) in lineDataDefault"
					:key="index"
					:class="{
						'line-end': lineDataDefault.length - 1 === index && !showSelect
					}"
				>
					<view class="content tag-item">{{ item.name ? item.name : showCol ? item[showCol] : '' }}</view>
				</view>
				<view class="bx-item bx-text-yellow line-end" v-if="isShowSelect">请选择</view>
			</view>
			<view class="bx-tagbox">
				<view v-if="showSelect"><cascaderItem :hideBorder="hideBorder" :insert="insert" :currentNo="currentNo" :showCol="showCol" @selectAreaItem="selectArea" :areaList="areaList"></cascaderItem></view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * @description 树状数据展示/选择组件
 * @property  {Boolean}  insert = [true,false]  是否为页面内嵌组件，否则为弹出组件
 */
import cascaderItem from './cascaderItem.vue';
export default {
	name: 'cascader', //层叠选择器内层，ui渲染
	data() {
		return {
			lineData: [],
			area: {}
		};
	},
	computed: {
		isShowSelect() {
			let result = false;
			if (this.showSelect && this.lineDataDefault.length > 0 && this.lineDataDefault[this.lineDataDefault.length - 1].is_leaf !== '是') {
				result = true;
			} else if (this.lineDataDefault.length === 0 && this.areaList.length > 0) {
				result = true;
			}
			return result;
		}
	},
	components: { cascaderItem },
	methods: {
		showMore() {
			this.$emit('show-more');
		},
		selectArea(item) {
			if (!this.lineData.find(a => a[this.column] === item[this.column])) {
				// this.lineData.push(item);
				this.$emit('tag-click', item);
			} else {
				return;
			}
		},
		lineClick(item, index) {
			this.$emit('line-click', item, index);
		}
	},
	watch: {
		lineDataDefault: {
			deep: true,
			handler: function(newV, oldV) {
				console.log('lineDataDefaultwatch中：', newV);
				this.lineData = newV;
			}
		},
		areaList: {
			deep: true,
			handler: function(newV, oldV) {
				console.log('watch--cas', newV);
				if (newV.child) {
					console.log('watch--cas', newV);
				}
				this.areaList = newV;
				this.lineData = this.lineDataDefault;
			}
		}
	},
	mounted() {
		this.lineData = this.lineDataDefault;
	},
	props: {
		currentNo: {
			type: String
		},
		// 是否显示‘请选择’提示
		showSelect: {
			type: Boolean,
			default: true
		},
		column: {
			//要提交的字段
			type: String,
			default: ''
		},
		showCol: {
			//要显示的字段
			type: String,
			default: ''
		},
		areaList: {
			//区域数据
			type: Array,
			default: () => {
				[];
			}
		},
		// line数据的默认值
		lineDataDefault: {
			type: Array,
			default: () => {
				[];
			}
		},
		isShowMore: {
			type: Boolean,
			default: false
		},
		lineColor: {
			type: String,
			default: 'yellow'
		},
		tagColor: {
			type: String,
			default: 'yellow'
		},
		tagBackground: {
			type: String,
			default: 'yellow'
		},
		insert:{
			// 内嵌组件
			type: Boolean,
			default: false
		},
		hideBorder:{
			type: Boolean,
			default: false
		}
	}
};
</script>

<style lang="scss">
.cascader-content {
	overflow: scroll;
	flex: 1;
	display: flex;
	height: calc(90vh - 200rpx);
	&.insert{
		height: auto;
		.bx-tagline{
			margin: 20rpx 2px;
		}
	}
}
.tag-line {
	display: flex;
	flex-direction: column;
	width: 100%;
	.bx-tagline {
		display: flex;
		flex-wrap: wrap;
		margin: 20rpx 20rpx;
		padding: 10rpx 40rpx;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
		&.hideBorder{
			box-shadow: none;
			margin: 0;
		}
		.bx-item {
			height: 80upx;
			line-height: 80rpx;
			position: relative;
			display: flex;
			& + .bx-item {
				&::before {
					content: '';
					display: inline-block;
					width: 10rpx;
					height: 10rpx;
					border-top: 2px solid #656565;
					border-right: 2px solid #656565;
					transform: rotate(45deg);
					border-color: #007aff;
					margin: 32rpx 20rpx;
				}
			}
			.tag-item {
				text-align: left;
				font-size: 32rpx;
			}
			.content {
				min-width: 30%;
				top: 36rpx;
				border-radius: 20rpx;
				overflow: hidden;
			}
			.delete-button {
				font-size: 40upx;
			}
		}
		.placeholder {
			width: 100%;
		}
		.line-end {
			&::after {
				content: '';
				display: block;
				position: absolute;
				width: 0.5px;
				background-color: #ddd;
				left: 30px;
				height: 0upx;
				top: 0;
				z-index: 8;
				border: none;
			}
			.tag-item {
				// width:0;
				// height:0;
				// display:block;
				// position:absolute;
				// left:0;
				// top:0;
				// border-top:10px transparent dashed;
				// border-right:10px transparent dashed;
				// border-bottom:10px transparent dashed;
				// border-left:10px white solid;
				// overflow:hidden;
			}
		}
	}
	.bx-tagbox {
		// margin: 20rpx;
		// padding: 20rpx;
		// height: 700rpx;
		text-align: left;
		flex: 1;
		overflow: scroll;
		// box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
		.bx-item {
			min-width: 100upx;
			// height: 40upx;
			display: inline-block;
			margin-right: 20upx;
			margin-bottom: 10upx;
			// background-color: #f1f1f1;
			border: 1rpx solid #f1f1f1;
			border-radius: 50rpx;
			padding: 6rpx 25rpx;
			text-align: center;
			&:active {
				transition: all 0.5s ease-in-out;
				transform: scale(1.1);
			}
			&.more {
				// background-color: #f0ad4e;
				// border-color:#f0ad4e ;
				border: none;
				color: #f0ad4e;
				// text-decoration: underline;
				position: relative;
				&::after {
					content: '';
					width: 60rpx;
					height: 4rpx;
					position: absolute;
					left: calc(50% - 30rpx);
					bottom: 0;
					background-color: #f0ad4e;
				}
			}
		}
	}

	/**文字颜色*/
	.bx-text-white {
		color: #fff; //明黄
	}
	.bx-text-yellow {
		color: #fbbd08; //明黄
	}
	.bx-text-red {
		color: #e54d42; //嫣红
	}
	.bx-text-orange {
		color: #f37b1d; //桔橙
	}
	.bx-text-green {
		color: #39b54a; //森绿
	}
	.bx-text-cyan {
		color: #1cbbb4; //天青
	}
	.bx-text-blue {
		color: #0081ff; //海蓝
	}
	.bx-text-black {
		color: #333333; //墨黑
	}
	/**背景色*/
	.bx-bg-yellow {
		background-color: #fbbd08; //明黄
	}
	.bx-bg-red {
		background-color: #e54d42; //嫣红
	}
	.bx-bg-orange {
		background-color: #f37b1d; //桔橙
	}
	.bx-bg-green {
		background-color: #39b54a; //森绿
	}
	.bx-bg-cyan {
		background-color: #1cbbb4; //天青
	}
	.bx-bg-blue {
		background-color: #0081ff; //海蓝
	}
	.bx-bg-black {
		background-color: #333333; //墨黑
	}
	/**边框色*/
	.bx-border-yellow {
		border: 1px solid #fbbd08; //明黄
	}
	.bx-border-red {
		border: 1px solid #e54d42; //嫣红
	}
	.bx-border-orange {
		border: 1px solid #f37b1d; //桔橙
	}
	.bx-border-green {
		border: 1px solid #39b54a; //森绿
	}
	.bx-border-cyan {
		border: 1px solid #1cbbb4; //天青
	}
	.bx-border-blue {
		border: 1px solid #0081ff; //海蓝
	}
	.bx-border-black {
		border: 1px solid #333333; //墨黑
	}
}
</style>
