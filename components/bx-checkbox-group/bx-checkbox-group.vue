<template>
	<view class="bx-checkbox-group">
		<view class="onmax-tip" v-show="onMax">
			<text class="cuIcon-info"></text>
			<text class="tip">最多只能勾选{{tipNumber}}项</text>
		</view>
		<slot></slot>
		</view>
</template>

<script>
import Emitter from '@/common/mixins/emitter.js';
/**
 * checkboxGroup 开关选择器父组件Group
 * @description 复选框组件一般用于需要多个选择的场景，该组件功能完整，使用方便
 * @property {String Number} max 最多能选中多少个checkbox（默认999）
 * @property {String Number} size 组件整体的大小，单位rpx（默认40）
 * @property {Boolean} disabled 是否禁用所有checkbox（默认false）
 * @property {String Number} icon-size 图标大小，单位rpx（默认20）
 * @property {Boolean} label-disabled 是否禁止点击文本操作checkbox(默认false)
 * @property {String} width 宽度，需带单位
 * @property {String} shape 外观形状，square方形，circle-圆形(默认shape)
 * @property {Boolean} wrap 是否每个checkbox都换行（默认false）
 * @property {String} active-color 选中时的颜色，应用到所有子Checkbox组件（默认#2979ff）
 * @event {Function} change 任一个checkbox状态发生变化时触发，回调为一个对象
 * @example <bx-checkbox-group></bx-checkbox-group>
 */
export default {
	name: 'bx-checkbox-group',
	mixins: [Emitter],
	props: {
		// 最多能选中多少个checkbox
		max: {
			type: [Number, String],
			default: 999
		},
		// 所有选中项的 name
		value: {
			default: Array,
			default() {
				return []
			}
		},
		// 是否禁用所有复选框
		disabled: {
			type: Boolean,
			default: false
		},
		// 在表单内提交时的标识符
		name: {
			type: [Boolean, String],
			default: ''
		},
		// 是否禁止点击提示语选中复选框
		labelDisabled: {
			type: Boolean,
			default: false
		},
		// 形状，square为方形，circle为原型
		shape: {
			type: String,
			default: 'circle'
		},
		// 选中状态下的颜色
		activeColor: {
			type: String,
			default: '#2979ff'
		},
		// 组件的整体大小
		size: {
			type: [String, Number],
			default: 34
		},
		// 每个checkbox占bx-checkbox-group的宽度
		width: {
			type: String,
			default: 'auto'
		},
		// 是否每个checkbox都换行
		wrap: {
			type: Boolean,
			default: false
		},
		// 样式风格 normal-经典多选框风格，button-按钮风格
		mode: {
			type: String,
			default: 'normal'
		},
		// 同上,后续将删除此属性
		checkboxMode: {
			type: String,
			default: 'normal'
		},
		// 图标的大小，单位rpx
		iconSize: {
			type: [String, Number],
			default: 20
		}
	},
	data() {
		return {
			onMax: false //是否已经达到选项数量限制
		};
	},
	computed:{
		tipNumber(){
			let max = this.max
			let tipNum = null
			if(max){
				switch (max){
					case '1':
					 tipNum = '一';
					break;
					case '5':
					 tipNum = '五';
					break;
				}
			}
			return tipNum
		}
	},
	created() {
		// 如果将children定义在data中，在微信小程序会造成循环引用而报错
		this.children = [];
	},
	methods: {
		emitEvent() {
			let values = [];
			this.children.map((val,index) => {
				if (val.value) values.push(val.name);
			});
			if(values.length>=this.max){
				this.onMax = true
			}else{
				this.onMax = false
			}
			this.$emit('change', values);
			this.$emit('input', values);
		}
	}
};
</script>

<style lang="scss" scoped>
.bx-checkbox-group {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	.onmax-tip{
		width: 100%;
		padding: 20rpx 30rpx;
		color: #ff976a;
		.tip{
			margin-left: 10rpx;
		}
	}
}
</style>
