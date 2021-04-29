<template>
	<view class="bx-radio" :style="[radioStyle]" :class="[radioButtonClass]">
		<view class="bx-radio-icon"
			:class="{ checked: name === parentData.value, 'has-char': serialChar, 'no-char': !serialChar }"
			@tap="toggle">
			<text v-if="serialChar">{{ serialChar }}</text>
			<text v-if="!serialChar && name === parentData.value" class="bx-radio-checked"></text>
		</view>
		<view class="bx-radio__label" @tap="onClickLabel" :class="{ checked: checked, disabled: disabled }">
			<slot />
		</view>
	</view>
</template>

<script>
	/**
	 * radio 单选框
	 * @description 单选框用于有一个选择，用户只能选择其中一个的场景。搭配bx-radio-group使用
	 * @property {String Number} icon-size 图标大小，单位rpx（默认24）
	 * @property {String Number} label-size label字体大小，单位rpx（默认28）
	 * @property {String Number} name radio组件的标示符
	 * @property {String} shape 形状，见上方说明（默认circle）
	 * @property {Boolean} disabled 是否禁用（默认false）
	 * @property {Boolean} label-disabled 点击文本是否可以操作radio（默认true）
	 * @property {String} active-color 选中时的颜色，如设置parent的active-color将失效
	 * @event {Function} change 某个radio状态发生变化时触发(选中状态)
	 * @example <bx-radio :label-disabled="false"></bx-radio>
	 */
	export default {
		name: 'bx-radio',
		props: {
			// radio的名称
			name: {
				type: [String, Number],
				default: ''
			},
			// 形状，square为方形，circle为原型
			shape: {
				type: String,
				default: ''
			},
			// 是否禁用
			disabled: {
				type: [String, Boolean],
				default: ''
			},
			// 是否禁止点击提示语选中复选框
			labelDisabled: {
				type: [String, Boolean],
				default: ''
			},
			// 选中状态下的颜色，如设置此值，将会覆盖parent的activeColor值
			activeColor: {
				type: String,
				default: ''
			},
			// 图标的大小，单位rpx
			iconSize: {
				type: [String, Number],
				default: ''
			},
			// label的字体大小，rpx单位
			labelSize: {
				type: [String, Number],
				default: ''
			},
			// 序号
			serialChar: {
				type: [String, Number],
				default: ''
			},
			wrap: {
				type: [String, Boolean],
				default: ''
			}
		},
		data() {
			return {
				// 父组件的默认值，因为头条小程序不支持在computed中使用this.parent.shape的形式
				// 故只能使用如此方法
				parentData: {
					iconSize: null,
					labelDisabled: null,
					disabled: null,
					shape: null,
					activeColor: null,
					size: null,
					width: null,
					height: null,
					value: null,
					wrap: null
				}
			};
		},
		computed: {
			checked() {
				// 是否选中
				return this.parent.value === this.name;
			},
			// 是否禁用，如果父组件bx-raios-group禁用的话，将会忽略子组件的配置
			elDisabled() {
				return this.disabled !== '' ? this.disabled : this.parentData.disabled !== null ? this.parentData
					.disabled : false;
			},
			// 是否禁用label点击
			elLabelDisabled() {
				return this.labelDisabled !== '' ? this.labelDisabled : this.parentData.labelDisabled !== null ? this
					.parentData.labelDisabled : false;
			},
			// 组件尺寸，对应size的值，默认值为34rpx
			elSize() {
				return this.size ? this.size : this.parentData.size ? this.parentData.size : 34;
			},
			// 组件的勾选图标的尺寸，默认20
			elIconSize() {
				return this.iconSize ? this.iconSize : this.parentData.iconSize ? this.parentData.iconSize : 20;
			},
			// 组件选中激活时的颜色
			elActiveColor() {
				return this.activeColor ? this.activeColor : this.parentData.activeColor ? this.parentData.activeColor :
					'primary';
			},
			// 组件的形状
			elShape() {
				return this.shape ? this.shape : this.parentData.shape ? this.parentData.shape : 'circle';
			},
			radioStyle() {
				let style = {};
				if (this.parentData.width) {
					style.width = this.parentData.width;
					// #ifdef MP
					// 各家小程序因为它们特殊的编译结构，使用float布局
					style.float = 'left';
					// #endif
					// #ifndef MP
					// H5和APP使用flex布局
					style.flex = `0 0 ${this.parentData.width}`;
					// #endif
				}
				if (this.parentData.wrap) {
					style.width = '100%';
					// #ifndef MP
					// H5和APP使用flex布局，将宽度设置100%，即可自动换行
					style.flex = '0 0 100%';
					// #endif
				}
				return style;
			},
			radioButtonClass() {
				if (this.parent && (this.parent.radioMode || this.parent.mode)) {
					if (this.parent.radioMode === 'button' || this.parent.mode === 'button') {
						return 'button-mode';
					}
				}
			}
		},
		created() {
			this.parent = false;
			// 支付宝小程序不支持provide/inject，所以使用这个方法获取整个父组件，在created定义，避免循环引用
			this.getParentData('bx-radio-group');
			if (this.parent) {
				this.parent.children.push(this);
			}
		},
		methods: {
			updateParentData() {},
			getParentData(parentName = '') {
				// 避免在created中去定义parent变量
				if (!this.parent) this.parent = false;
				// 这里的本质原理是，通过获取父组件实例(也即bx-radio-group的this)
				// 将父组件this中对应的参数，赋值给本组件(bx-radio的this)的parentData对象中对应的属性
				// 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
				this.parent = this.theParent.call(this, parentName);
				if (this.parent) {
					// 历遍parentData中的属性，将parent中的同名属性赋值给parentData
					Object.keys(this.parentData).map(key => {
						this.parentData[key] = this.parent[key];
					});
				}
			},
			theParent(name = undefined) {
				let parent = this.$parent;
				// 通过while历遍，这里主要是为了H5需要多层解析的问题
				while (parent) {
					// 父组件
					if (parent.$options && parent.$options.name !== name) {
						// 如果组件的name不相等，继续上一级寻找
						parent = parent.$parent;
					} else {
						return parent;
					}
				}
				return false;
			},
			onClickLabel() {
				if (!this.elLabelDisabled && !this.elDisabled) {
					this.setRadioCheckedStatus();
				}
			},
			toggle() {
				if (!this.elDisabled) {
					this.setRadioCheckedStatus();
				}
			},
			emitEvent() {
				// bx-radio的name不等于父组件的v-model的值时(意味着未选中)，才发出事件，避免多次点击触发事件
				if (this.parentData.value != this.name) this.$emit('change', this.name);
			},
			// 改变组件选中状态
			// 这里的改变的依据是，更改本组件的parentData.value值为本组件的name值，同时通过父组件遍历所有bx-radio实例
			// 将本组件外的其他bx-radio的parentData.value都设置为空(由computed计算后，都被取消选中状态)，因而只剩下一个为选中状态
			setRadioCheckedStatus() {
				this.emitEvent();
				if (this.parent) {
					this.parent.setValue(this.name);
					this.parentData.value = this.name;
				}
			}
		}
	};
</script>

<style scoped lang="scss">
	.bx-radio {
		display: flex;
		align-items: center;
		padding: 10rpx;

		.bx-radio-icon {
			width: 40rpx;
			height: 40rpx;
			border-radius: 60rpx;
			border: 2rpx solid #888;
			color: #888;
			margin-right: 10rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 24rpx;

			&.checked.has-char {
				border: none;
				background-color: #007aff;
				color: #fff;
			}

			&.checked.no-char {
				border-color: #007aff;
				border-width: 4rpx;

				.bx-radio-checked {
					display: inline-block;
					width: 12rpx;
					height: 12rpx;
					border-radius: 12rpx;
					background-color: #007aff;
				}
			}
		}

		&.button-mode {
			.bx-radio-icon {
				display: none;
			}

			.bx-radio__label {
				color: #323233;
				background-color: #fff;
				border: 1px solid #ebedf0;
				padding: 8rpx 20rpx;
				border-radius: 50rpx;
				letter-spacing: 1px;
				transition: all 0.5s;

				&:active {
					color: #409eff;
					background: #ecf5ff;
					border-color: #b3d8ff;
					transform: scale(1.2);
				}

				&.checked {
					color: #fff;
					border-color: #0081ff;
					background-color: #0081ff;
				}

				&.disabled {
					color: #fff;
					background-color: #a0cfff;
					border-color: #a0cfff;

					&:active {
						pointer-events: none;
						transform: scale(1);
					}
				}
			}
		}
	}
</style>
