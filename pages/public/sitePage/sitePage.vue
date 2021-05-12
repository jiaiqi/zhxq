<template>
	<view>
		<SitePage v-if="index == 0" :website_no="website_no" :is_owner="isOwner" :page_no="currentPage.page_no"
			@clickButton="clickButton" ref="sitePage"
			:style="{ 'padding-bottom': websiteList.length > 1 ? '100upx' : 0 }"></SitePage>
		<!-- <proFile ref="profile" v-if="index == 1"></proFile> -->
		<view class="cu-bar tabbar bg-white shadow foot" v-if="websiteList.length > 1">
			<view class="action" v-for="(item, siteIndex) in websiteList" :key="siteIndex" @click="changePage(item)">
				<view class="cuIcon-cu-image" v-if="item.page_name == '首页' && item.page_no !== currentPage.page_no">
					<image src="/static/img/home.png"></image>
				</view>
				<view class="cuIcon-cu-image" v-if="item.page_name == '首页' && item.page_no === currentPage.page_no">
					<image style="width: 25px;height: 25px;margin-bottom: 2px;" src="/static/img/check_home.png">
					</image>
				</view>
				<view class="cuIcon-cu-image" v-if="item.page_name == '我的' && item.page_no !== currentPage.page_no">
					<image src="/static/img/my.png"></image>
				</view>
				<view class="cuIcon-cu-image" v-if="item.page_name == '我的' && item.page_no === currentPage.page_no">
					<image src="/static/img/check_my.png"></image>
				</view>
				<view
					:class="{ 'text-green': item.page_no === currentPage.page_no, 'text-gray': item.page_no !== currentPage.page_no }">
					{{ item.page_name }}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import SitePage from '../homePage/homePage';
	// import proFile from '../profile/profile';
	export default {
		name: 'home-page',
		components: {
			SitePage,
			// proFile
		},
		data() {
			return {
				website_no: '',
				currentPage: '',
				websiteList: [],
				index: 0,
				isOwner: false
			};
		},
		methods: {
			clickButton(e) {
				if (uni.getStorageSync('activeApp') == 'zhxq') {
					this.selectInfoFromMember().then(result => {
						if (!result) {
							return
						}
						let isOwner = uni.getStorageSync('is_owner');
						if (
							(e.dest_menu_no === '访客登记' ||
								e.dest_menu_no === '物业录入' ||
								e.dest_menu_no === '物业报修' ||
								e.dest_menu_no === '成员登记' ||
								e.dest_menu_no === '住户登记' ||
								e.dest_menu_no === '车辆登记' ||
								e.dest_menu_no === '工作人员登记' ||
								e.dest_menu_no === '服务人员登记') &&
							e.dest_app === 'zhxq'
						) {
							if (uni.getStorageSync('isLogin')) {
								this.getUserInfoLimits().then(result1 => {
									console.log('clickButton-查找基本信息:', result);
									if (!!result) {
										if (!isOwner && (e.dest_menu_no === '物业报修' || e.dest_menu_no ===
												'车辆登记')) {
											uni.showToast({
												title: '暂未入住小区,请进行信息登记',
												duration: 1000,
												icon: 'none'
											});
											return;
										}
										uni.navigateTo({
											url: e.dest_page
										});
									}
								});
							}
						} else if (e.dest_menu_no == '紧急求助') {
							uni.navigateTo({
								url: e.dest_page
							});
						}
					});
				} else {}
			},
			changePage(item) {
				let websiteList = this.websiteList;
				websiteList.forEach(wb => {
					wb.checked = false;
				});
				item.checked = !item.checked;
				if (item && item.page_no !== this.currentPage.page_no && item.page_no != 'BX202006171012480019') {
					this.index = 0;
					this.currentPage = item;
					this.$nextTick(() => {
						this.$refs.sitePage.getPageInfo(item.website_no, item.page_no);
					});
				} else if (item && item.page_no !== this.currentPage.page_no && item.page_no == 'BX202006171012480019') {
					console.log('点击我的');
					this.selectInfoFromMember().then(result1 => {
						this.getUserInfoLimits().then(result => {
							if (!!result1) {
								this.currentPage = item;
								this.index = 1;
								this.$nextTick(() => {
									this.$refs.profile.getUserInfo();
								});
							}
						});
					});
				}
			},
			async getbasicsInfo() {
				let user_no = uni.getStorageSync('login_user_info').user_no;
				let urls = this.getServiceUrl('zhxq', 'srvzhxq_member_select', 'select');
				let reqs = {
					serviceName: 'srvzhxq_member_select',
					colNames: ['*'],
					condition: [{
							colName: 'openid',
							ruleType: 'eq',
							value: user_no
						}
						// {
						//  colName:"is_fuzeren",
						//  ruleType:"eq",
						//  value:"是"
						// }
					],
					order: [{
						colName: 'create_time',
						orderType: 'asc'
					}]
				};
				let ress = await this.$http.post(urls, reqs);
				if (ress.data.state === 'SUCCESS') {
					if (ress.data.data.length > 0) {
						uni.setStorageSync('basics_info', ress.data.data[0]);
					}
				}
			},
			async getWebsiteList() {
				const url = this.getServiceUrl('daq', 'srvdaq_website_page_select', 'select');
				let website_no = '';
				// #ifdef H5
				website_no = this.$route.query.website_no;
				// #endif
				// #ifdef MP-WEIXIN
				website_no = this.website_no;
				// #endif
				if (website_no) {
					const req = {
						serviceName: 'srvdaq_website_page_select',
						colNames: ['*'],
						condition: [{
							colName: 'website_no',
							ruleType: 'like',
							value: website_no
						}],
						page: {
							pageNo: 1,
							rownumber: 10
						},
						order: [{
							colName: 'sorts',
							orderType: 'asc'
						}]
					};
					const res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS') {
						if (res.data.data.length > 0) {
							res.data.data.length > 5 ? (res.data.data.length = 5) : '';
							res.data.data.forEach((it, i) => {
								it['checked'] = false;
								if (i == 0) {
									it['checked'] = true;
								}
							});
							this.websiteList = res.data.data;
							this.currentPage = res.data.data[0];
							this.$refs.sitePage.getPageInfo(res.data.data[0].website_no, res.data.data[0].page_no);
						}
					}
				}
			}
		},
		created() {
			// #ifdef H5
			if (this.$route.query.website_no) {
				this.website_no = this.$route.query.website_no;
				this.getWebsiteList();
			}
			// #endif

			// #ifdef MP-WEIXIN
			this.website_no = 'WS2021040620510017';
			this.getWebsiteList();
			// #endif
		},
		onShareTimeline(res) {
			console.log('onShareTimeline', res);
		},
		onLoad(option) {
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
			this.website_no = option.website_no;
		},
		onShareAppMessage(res) {
			return {
				title: '海纳智慧小区',
				imageUrl: '../../../static/mpcode.jpg'
			};
		}
	};
</script>

<style lang="scss">
	.text-green {
		color: #0bc99d;
	}
</style>
