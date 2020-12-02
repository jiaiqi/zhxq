<template>
	<view class="page-wrap">
		<view class="app-list">
			<view class="app-item" v-for="item in appList" :key="item.app_no" @click="switchApp(item)">{{ item.app_name }}</view>
		</view>
		<view class="menu-list" style="padding-left: 0;">
			<view class="menu-item" v-for="(item, index) in treeMenuList" :key="item.id" @click="clickMenu(item, idx)">
				<view class="menu-name">{{ item.menu_name }}</view>
				<view class="menu-list" v-if="item.child && item.showChild">
					<view class="menu-item" v-for="child in item.child" :key="child.id">
						<view class="menu-name">{{ child.menu_name }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			appList: [],
			appNo: '',
			menuList: [],
			treeMenuList: []
		};
	},
	watch: {
		treeMenuList: {
			deep: true,
			handler(newValue, oldValue) {}
		}
	},
	methods: {
		clickMenu(e, idx) {
			if (Array.isArray(e.child)) {
				e.showChild = !e.showChild;
				debugger
				this.$set(this.treeMenuList, idx, e);
			}
		},
		switchApp(e) {
			this.appNo = e.app_no;
			this.getAppMenu();
		},
		getAppList() {
			let url = this.getServiceUrl('auth', 'srvauth_user_app_menu_select', 'select');
			let req = { serviceName: 'srvauth_user_app_menu_select', colNames: ['*'] };
			this.$http.post(url, req).then(res => {
				if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
					this.appList = res.data.data;
					if (!this.appNo) {
						if (res.data.data.length > 0) {
							this.appNo = res.data.data[0].app_name;
						}
					}
					this.getAppMenu();
				}
			});
		},
		getAppMenu() {
			if (this.appNo) {
				let url = this.getServiceUrl(this.appNo, 'srvsys_user_menu_select', 'select');
				let req = {
					serviceName: 'srvsys_user_menu_select',
					colNames: ['*'],
					condition: [{ colName: 'client_type', ruleType: 'like', value: 'APP' }],
					order: [{ colName: 'seq', orderType: 'asc' }]
				};
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
						this.menuList = res.data.data;
						let arr = [];
						res.data.data.forEach(item => {
							item.showChild = false;
							if (!item.parent_no) {
								arr.push(item);
							}
						});
						arr.forEach(parent => {
							res.data.data.forEach(item => {
								if (item.parent_no === parent.menu_no) {
									Array.isArray(parent.child) ? parent.child.push(item) : (parent.child = [item]);
								}
							});
						});
						this.treeMenuList = arr;
					}
				});
			}
		}
	},
	created() {
		this.getAppList();
	}
};
</script>

<style lang="scss">
.page-wrap {
	width: 100%;
	padding: 20rpx;
}
.app-list {
	display: grid;
	grid-template-columns: repeat(4, calc(25% - 15rpx));
	grid-column-gap: 20rpx;
	grid-row-gap: 20rpx;
	margin-bottom: 20rpx;
	.app-item {
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #fff;
	}
}
.menu-list {
	display: flex;
	flex-direction: column;
	padding-left: 50rpx;
	.menu-item {
		width: 100%;
		margin-top: 10rpx;
		.menu-name {
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
			padding: 20rpx;
			background-color: #fff;
		}
	}
}
</style>
