<template>
	<view class="bx-tagbox-c">
		<view class="bx-tagbox-c-wrap" :class="{ hideBorder: hideBorder, insert: insert }">
			<view class="bx-item-wrap">
				<view class="bx-item" @click="selectArea(item)" :class="{ 'choose-item': item.no === currentItem.no }" v-for="(item, index) in areaList" :key="index">
					{{ getLabel(item) }}
				</view>
			</view>
		</view>
		<cascaderItem
			:hideBorder="hideBorder"
			:insert="insert"
			:showCol="showCol"
			v-if="currentItem.child && currentItem.child.length > 0"
			@selectAreaItem="selectArea2"
			:areaList="currentItem.child"
		></cascaderItem>
	</view>
</template>

<script>
// #ifdef MP-WEIXIN
import cascaderItem from './cascaderItem.vue';
// #endif
export default {
	name: 'cascaderItem',
	data() {
		return {
			currentItem: '',
			copyCurrentItem: {},
			no: ''
		};
	},
	components: {
		// #ifdef MP-WEIXIN
		cascaderItem
		// #endif
	},
	methods: {
		getLabel(item) {
			return item.name ? item.name : this.showCol ? item[this.showCol] : '';
		},
		selectArea2(e) {
			this.$emit('selectAreaItem', e);
		},
		selectArea(e) {
			if (this.currentNo !== e.no) {
				this.currentItem = e;
			}
			this.$emit('selectAreaItem', e);
		},
		recursionArealist(oldAreaList) {
			let self = this;
			if (!Array.isArray(self.copyCurrentItem.child)) {
				self.copyCurrentItem.child = [];
			}
			oldAreaList.forEach(item => {
				if (Array.isArray(item.child)) {
					if (item.no === self.currentItem.no) {
						self.currentItem = self.deepClone(item);
					} else {
						self.recursionArealist(item.child);
					}
				}
			});
		},
		valuationChild(oldAreaList, data) {
			let self = this;
			console.log('---', oldAreaList);
			if (Array.isArray(data.child) && data.child.length > 0) {
				data.child.forEach(item => {
					if (item.no === self.copyCurrentItem.no) {
						this.currentItem = oldAreaList;
					}
				});
				console.log('data----', data);
			}
		}
	},
	watch: {
		areaList: {
			handler(newval, oldval) {
				// this.valuationChild(newval);
				if (newval.length > 0) {
					let rest = false;
					newval.forEach(item => {
						if (Array.isArray(item.child)) {
							rest = true;
						}
					});
					if (rest) {
						this.recursionArealist(newval);
					} else {
						this.currentItem = '';
					}
				}
			},
			deep: true
		}
	},
	props: {
		areaList: {
			type: Array,
			default: () => {
				return [];
			}
		},
		showCol: {
			type: String
		},
		currentNo: {
			type: String
		},
		hideBorder: {
			type: Boolean,
			default: false
		},
		insert: {
			type: Boolean,
			default: false
		}
	}
};
</script>

<style lang="scss" scoped>
.bx-tagbox-c-wrap {
	margin: 10rpx 20rpx;
	padding: 20rpx;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
	border-radius: 30rpx;
	&.insert {
		margin: 10rpx 2px;
	}
	&.hideBorder {
		box-shadow: none;
		margin: 0;
	}
}
.bx-tagbox-c {
	text-align: left;
	flex: 1;
	overflow: scroll;
	.bx-item {
		min-width: 100upx;
		display: inline-block;
		margin-right: 20upx;
		margin-bottom: 10upx;
		border: 1rpx solid #f1f1f1;
		border-radius: 50rpx;
		padding: 10rpx 25rpx;
		text-align: center;
		transition: transform 0.5s ease-out;
		&:active {
			transform: scale(1.1);
		}
		&.more {
			border: none;
			color: #f0ad4e;
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
	.choose-item {
		background-color: #007aff;
		color: white;
	}
}
.bx-item-wrap {
	// box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
</style>
