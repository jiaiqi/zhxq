<template>
	<view></view>
</template>

<script>
export default {
	data() {
		return {
			appList: [],
			appName: '',
			menuList: [],
			treeMenuList: []
		};
	},
	methods: {
		getAppList() {
			let url = this.getServiceUrl('auth', 'srvauth_user_app_menu_select', 'select');
			let req = { serviceName: 'srvauth_user_app_menu_select', colNames: ['*'] };
			this.$http.post(url, req).then(res => {
				if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
					this.appList = res.data.data;
					if (!this.appName) {
						if (res.data.data.length > 0) {
							this.appName = res.data.data[0].app_name;
						}
					}
					this.getAppMenu();
				}
			});
		},
		getAppMenu() {
			if (this.appName) {
				let url = this.getServiceUrl(this.appName, 'srvsys_user_menu_select', 'select');
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

<style></style>
