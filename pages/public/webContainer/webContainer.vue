<template>
	<view v-if="src" class="wrap"><web-view :webview-styles="webviewStyles" :src="src"></web-view></view>
</template>

<script>
export default {
	data() {
		return {
			webviewStyles: {
				progress: {
					color: '#eee'
				}
			},
			src: ''
		};
	},
	props: {},
	onLoad(option) {
		if (option.webSrc) {
			this.src = this.$api.frontEndAddress + option.webSrc;
		} else {
			uni.showModal({
				title: '提示',
				content: '未找到相关页面,点击确定返回上级页面',
				showCancel: false,
				success(res) {
					if (res.confirm) {
						uni.navigateBack({
							animationType: 'fade-out',
							animationDuration: 1000
						});
					}
				}
			});
		}
	}
};
</script>

<style scoped>
.wrap {
	width: 100%;
	height: 100%;
}
</style>
