<template>
	<view class="page-wrap">
		<view v-for="(pageItem, itemIndex) in pageItemList" :key="itemIndex"
			:class="{ 'swiper-view': pageItem.div_type === 'carousel', 'menu-view': pageItem.div_type === 'buttons', 'tab-list-view': pageItem.div_type === 'tablist' }">
			<SwiperCarousel :swiperList="swiperList" v-if="pageItem.div_type === 'carousel'" @clickSwiper="clickSwiper"
				:imgCol="'picUrl'"></SwiperCarousel>
			<SwiperMenu v-if="pageItem.div_type === 'buttons'" :config="pageItem" :menuList="pageItem.data"
				:menuLabel="pageItem.item_label" :gridWidth="pageItem.grid_width" @clickMenu="clickMenu"></SwiperMenu>
			<TabList @clickListItem="clickListItem" @showMore="showMore($event, pageItem)"
				v-if="pageItem.div_type === 'tablist'" :pageItem="pageItem" :srvApp="tabListConfig['srvApp']"
				:contentService="tabListConfig['contentService']" :cateService="tabListConfig['cateService']"
				:contentTemplate="tabListConfig['contentTemplate']"></TabList>
		</view>
		<view class="cu-modal bottom-modal" :class="{show:modalName==='change-password'}" @click="hideModal">
			<view class="cu-dialog" @click.stop="">
				<view class="change-password bg-white padding-bottom">
					<view class="cu-form-group">
						<view class="title">旧密码</view>
						<input placeholder="请输入旧密码" name="input" class="input" v-model="passwordModel.pwd"></input>
					</view>
					<view class="cu-form-group">
						<view class="title">新密码</view>
						<input placeholder="请输入新密码" name="input" class="input" v-model="passwordModel.newpwd"></input>
					</view>
					<view class="cu-form-group">
						<view class="title">确认新密码</view>
						<input placeholder="请再次输入新密码" name="input" class="input"
							v-model="passwordModel.newpwd2"></input>
					</view>
					<button class="cu-btn bg-blue margin-tb" type="primary" @click="changePwd()">立即修改</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import TabList from '@/components/bx-tablist/bx-tablist.vue';
	import SwiperCarousel from '@/components/bx-swiper/bx-swiper.vue';
	import SwiperMenu from '@/components/bx-swiper-menu/bx-swiper-menu.vue';
	import {
		mapGetters
	} from 'vuex'
	export default {
		components: {
			TabList,
			SwiperCarousel,
			SwiperMenu
		},
		data() {
			return {
				passwordModel: {
					pwd: "",
					newpwd2: "",
					newpwd: ""
				},
				TabCur: 0,
				scrollLeft: 0,
				modalName: '',
				tel: null,
				real_name: null,
				pageItemList: [], //页面项列表，控制页面显示内容
				menuList: [], //按钮列表
				newsList: [], //新闻列表
				swiperList: [], //轮播图列表
				categoryList: [], //分类列表
				webNo: 'WS2021041310440001',
				tabListConfig: {
					srvApp: 'daq',
					contentService: 'srvdaq_cms_content_select',
					cateService: 'srvdaq_page_item_tablist_select',
					contentTemplate: {
						imgCol: 'icon_image',
						titleCol: 'title',
						dateCol: 'create_time'
					}
				}
			};
		},
		created() {},
		// onLoad(option) {
		// 	if (option.website_no || option.no) {
		// 		// let query = JSON.parse(decodeURIComponent(option.query))
		// 		this.webNo = option.website_no ? option.website_no : option.no;
		// 		if (option.destApp) {
		// 			uni.setStorageSync('activeApp', option.destApp);
		// 		}
		// 	} else {
		// 		this.webNo = 'WS2021041310440001'
		// 	}
		// 	if (this.webNo) {
		// 		console.log(this.roleInfo)
		// 		this.getStreetManagerInfo().then(_ => {
		// 			this.getPageItemList();
		// 		})
		// 	}
		// },
		onShow() {
			if (this.webNo) {
				console.log(this.roleInfo)
				this.getStreetManagerInfo().then(_ => {
					this.getPageItemList();
				})
			}
		},
		computed: {
			...mapGetters(['wxUserInfo', 'loginUserInfo', 'staffInfo', 'roleInfo']),
			tabNewsList() {
				//根据栏目分类的新闻列表
				let NewsList = [];
				let tabNewsList = [];
				this.categoryList.forEach((cate, index) => {
					tabNewsList[index] = [];
					this.newsList.forEach(listItem => {
						if (cate.no === listItem.cate_no) {
							tabNewsList[index] = tabNewsList[index].concat([listItem]);
							NewsList[index] = {};
							NewsList[index]['data'] = tabNewsList[index];
							NewsList[index]['name'] = listItem.cate_name;
						}
					});
				});
				return NewsList;
			}
		},
		methods: {
			async getVillageInfo(streetInfo = false) {
				// 村信息
				let req = {
					"serviceName": "srvdaq_street_village_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "village_manager",
						"ruleType": "eq",
						"value": this.loginUserInfo.user_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					},
				}
				if (streetInfo) {
					req.condition = [{
						"colName": "street_manager",
						"ruleType": "eq",
						"value": this.loginUserInfo.user_no
					}]
				}
				let url = this.getServiceUrl('daq', 'srvdaq_street_village_select', 'select');
				let res = await this.$http.post(url, req)
				if (res.data.state === "SUCCESS" && Array.isArray(res.data.data) && res.data.data.length > 0) {
					let villageInfo = res.data.data[0]
					this.$store.commit('SET_VILLIAGE_INFO', villageInfo)
					return villageInfo
				} else return null
			},
			async getStreetManagerInfo() {
				// 街道片区
				if (this.loginUserInfo && this.loginUserInfo.user_no) {
					let req = {
						"serviceName": "srvdaq_street_road_select",
						"colNames": ["*"],
						"condition": [{
							"colName": "street_manager",
							"ruleType": "eq",
							"value": this.loginUserInfo.user_no
						}],
						"page": {
							"pageNo": 1,
							"rownumber": 1
						},
					}
					let url = this.getServiceUrl('daq', 'srvdaq_street_road_select', 'select');
					let res = await this.$http.post(url, req)
					let result = {
						streetRoadInfo: {}, //片区
						villageInfo: {}, // 村
						streetInfo: {} // 街道办
					}
					if (res.data.state === "SUCCESS" && Array.isArray(res.data.data) && res.data.data.length > 0) {
						let streetRoadInfo = res.data.data[0]
						result.streetRoadInfo = streetRoadInfo
						this.$store.commit('SET_STAFF_INFO', streetRoadInfo)
					} else {
						result.streetRoadInfo = null
					}
					const villageInfo = await this.getVillageInfo()
					const streetInfo = await this.getVillageInfo(true)
					result.villageInfo = villageInfo; // 村
					result.streetInfo = streetInfo; // 街道办
					this.$store.commit('SET_ROLE_INFO', result)
					return result

				}
			},
			changePwd() {
				let self = this
				let url = self.$api.changePassword;
				if (!this.passwordModel.pwd) {
					uni.showToast({
						title: '请输入旧密码',
						icon: 'none'
					})
					return
				}
				if (!this.passwordModel.newpwd) {
					uni.showToast({
						title: '请输入新密码',
						icon: 'none'
					})
					return
				}
				if (this.passwordModel.newpwd !== this.passwordModel.newpwd2) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					})
					return
				}

				let reqData = [{
					"serviceName": "srvsso_user_pwd_reset",
					"data": [{
						"pwd": this.passwordModel.pwd,
						"newpwd": this.passwordModel.newpwd
					}]
				}]

				uni.showModal({
					title: '修改密码',
					content: `确认将密码修改为[${this.passwordModel.newpwd}]?`,
					success: (res) => {
						if (res.confirm) {
							self.$http.post(url, reqData).then(res => {
								if (res.data.state === 'SUCCESS') {
									uni.setStorageSync('isLogin', false);
									uni.showModal({
										title: '修改成功！',
										content: '请重新登录，即将跳转到登录页面',
										showCancel: false,
										success(r) {
											if (r.confirm) {
												uni.reLaunch({
													url: "/pages/public/accountExec/accountExec?isBind=true"
												})
											}
										}
									})
								}
							})
						}
					}
				})
			},
			unBindWxUser() {
				let self = this
				let url = self.$api.unbindWxUser;
				let reqData = [{
					"serviceName": "srvwx_user_unbind"
				}]
				uni.showModal({
					title: '提示',
					content: '是否继续退出登录？',
					cancelText: "不用了",
					confirmText: "是",
					success: function(res) {
						if (res.confirm) {
							self.$http.post(url, reqData).then(res => {
								uni.setStorageSync('isLogin', false);
								uni.reLaunch({
									url: "/pages/public/accountExec/accountExec?isBind=true"
								})
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			showMore(e, pageitem) {
				console.log('点击了更多按钮', e, pageitem);
				uni.navigateTo({
					url: `/pages/public/articleList/articleList?cateNo=${e.no}&cate_name=${e.tablist_name}`
				});
			},
			tabSelect(e) {
				//点击tab
				this.TabCur = Number(e.currentTarget.dataset.id);
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
			},
			clickSwiper(e) {
				// 点击了轮播图
				console.log('点击了轮播图,', e);
			},
			hideModal() {
				this.modalName = ''
			},
			async clickMenu(e) {
				// 菜单按钮点击事件
				let self = this
				if (this.loginUserInfo && this.loginUserInfo.login_user_type === 'wx_user') {
					uni.showModal({
						title: '提示',
						content: '您还未登录账号,是否进行登录',
						// content: '您还未绑定账号,是否进行绑定',
						success(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '../accountExec/accountExec?isBind=true'
								})
							}
						}
					})
					return
				} else {
					if (e.dest_page === "srvwx_user_unbind") {
						this.unBindWxUser()
						return
					}
					if (e.dest_page === "statement") {
						uni.navigateTo({
							url: '/pages/specific/statement/statement'
						})
						return
					}
					if (e.dest_page === 'srvsso_user_pwd_reset') {
						// 修改密码
						// this.changePwd()
						this.modalName = 'change-password'
						return
					}
				}

				if (!this.loginUserInfo) {
					uni.showModal({
						title: '请登录',
						content: '是否跳转到登录页面',
						confirmText: '去登录',
						success(res) {
							if (res.confirm) {
								uni.redirectTo({
									url: '/pages/public/accountExec/accountExec?isBind=true'
								})
							}
						}
					})
					return
				}
				if (!this.staffInfo || !this.staffInfo.street_manager === this.loginUserInfo.user_no) {
					return
				}
				const resultInfo = await this.getStreetManagerInfo()

				if (e.dest_page.indexOf('website_no') > -1) {
					let startStr = e.dest_page.indexOf('?')
					let endStr = e.dest_page.indexOf('&')
					let stri = e.dest_page.slice(startStr, endStr)
					stri = stri.split("=")
					uni.setStorageSync('website_no', stri[1])
					uni.navigateTo({
						url: this.$api.homePath +
							'?website_no=WS2021041310440001&destApp=daq'
					})
					return
				}
				if (e.type && e.type === 'more') {
					// 点击了更多按钮
					console.log('点击了更多按钮');
					uni.navigateTo({
						url: '/pages/public/home/home',
						fail() {
							uni.switchTab({
								url: '/pages/public/home/home',
							})
						}
					});
				} else if (e.dest_page) {
					if (e.dest_app) {
						let viewTemp = e.app_temp_col_map
						if (e.dest_page && e.dest_page.indexOf('/pages/public/list/list') !== -1 &&
							viewTemp) {
							e.dest_page += `&viewTemp=${viewTemp}`
						}
						uni.setStorageSync('activeApp', e.dest_app);
						uni.navigateTo({
							url: e.dest_page,
							fail(res) {
								if (res.errMsg) {
									// #ifdef H5
									window.location.href = e.dest_page
									// #endif
									// #ifdef MP
									uni.navigateTo({
										url: '/pages/public/webContainer/webContainer?webSrc=' +
											e
											.dest_page
									})
									// #endif
								}
							}
						});
					}
				}
			},
			clickListItem(e) {
				// 列表点击事件
				let query = {
					serviceName: 'srvdaq_cms_content_select',
					content_no: e.content_no,
					destApp: 'daq'
				};
				uni.navigateTo({
					url: `/pages/specific/article/article?content_no=${ e.content_no }`
				});
			},
			async getPageItemList() {
				// 获取页面项列表
				uni.showLoading({
					mask: true
				});
				let url = this.getServiceUrl('daq', 'srvdaq_website_page_item_select',
					'select');
				let req = {
					serviceName: 'srvdaq_website_page_item_select',
					colNames: ['*'],
					order: [{
						colName: 'seq',
						orderType: 'asc'
					}],
					condition: [{
						colName: 'website_no',
						ruleType: 'eq',
						value: this.webNo
					}]
				};
				let res = await this.$http.post(url, req);
				uni.hideLoading();
				if (res.data.state === 'SUCCESS') {
					this.pageItemList = res.data.data;
					res.data.data.map((item, index) => {
						switch (item.div_type) {
							case 'buttons':
								item['componentsType'] = 'SwiperMenu';
								break;
							case 'carousel':
								item['componentsType'] = 'SwiperCarousel';
								break;
							case 'tablist':
								item['componentsType'] = 'TabList';
								break;
								return;
						}
						this.getPageItem(item).then(data => {
							if (item.div_type === 'buttons') {
								data = data.filter(dataItem => {
									let roleInfo = this.roleInfo
									debugger
									if (!this.loginUserInfo) {
										return false
									}
									// if (!roleInfo || (!roleInfo.streetRoadInfo && !roleInfo
									// 		.villageInfo && !roleInfo.streetInfo)) {
									// 	return false
									// }
									// if (Array.isArray(this.loginUserInfo.roles) && this
									// 	.loginUserInfo.roles.length === 0) {
									// 	return
									// }
									if (dataItem.dest_menu_no === "街道办巡查" && !roleInfo
										.streetInfo && !roleInfo.villageInfo) {
											// 村长和街道办能看
										return false
									}
									if (dataItem.dest_menu_no === "街长考核" && !roleInfo
										.villageInfo && !roleInfo.streetRoadInfo) {
											// 街长和村长能看
										return false
									}
									if (dataItem.dest_menu_no === "街道考核" && !roleInfo
										.streetInfo && !roleInfo
										.villageInfo) {
													// 村长和街道办能看
										return false
									}
									return true
								})
							}
							item['data'] = data;
							if (item.div_type === 'buttons') {
								console.log(this.loginUserInfo)
								if (this.loginUserInfo && this.loginUserInfo.login_user_type ===
									'user') {
									item['data'].push({
										display: "显示",
										icon: 'shujuzhongxin.png',
										dest_menu_no: "报表分析",
										dest_app: 'daq',
										dest_page: 'statement',
									})
									// item['data'].push({
									// 	display: "显示",
									// 	icon: 'cpwd',
									// 	dest_menu_no: "修改密码",
									// 	dest_app: 'sso',
									// 	dest_page: 'srvsso_user_pwd_reset',
									// 	id: 183,
									// 	seq: 1
									// })
								}
							}
							this.$set(this.pageItemList, index, item);
						});
						return item;
					});
					return res.data.data;
				}
			},
			async getPageItem(item = {}) {
				// 获取页面项
				uni.showLoading({
					mask: true
				});
				let serviceName = '';
				switch (item.div_type) {
					case 'buttons':
						serviceName = 'srvdaq_page_item_buttons_select';
						break;
					case 'carousel':
						serviceName = 'srvdaq_page_item_carousel_select';
						break;
					case 'tablist':
						serviceName = 'srvdaq_cms_content_select';
						return;
						break;
				}
				if (item.div_type === 'tablist' && serviceName) {
					let urls = this.getServiceUrl('daq', serviceName, 'select');
					let reqs = {
						serviceName: serviceName,
						colNames: ['*'],
						group: [{
							colName: 'no',
							type: 'by'
						}]
					};
					let ress = await this.$http.post(urls, reqs);
					if (ress.data.state === 'SUCCESS') {
						this.categoryList = ress.data.data;
					}
				}
				if (serviceName) {
					let url = this.getServiceUrl('daq', serviceName, 'select');
					let req = {
						serviceName: serviceName,
						colNames: ['*'],
						order: [{
							colName: 'seq',
							orderType: 'asc'
						}],
						condition: [{
							colName: 'item_no',
							ruleType: 'in',
							value: item.item_no
						}]
					};
					if (item.div_type === 'buttons') {
						req.condition.push({
							colName: 'display',
							ruleType: 'ne',
							value: '隐藏'
						})
					}
					let res = await this.$http.post(url, req);
					uni.hideLoading();
					if (res.data.state === 'SUCCESS') {
						// this.itemList = res.data.data;
						let itemList = res.data.data;
						itemList.forEach((pageitem, index) => {
							switch (item.div_type) {
								case 'buttons':
									let itemLists = [];
									if (itemList.length <= 8) {
										itemLists = [itemList];
									} else if (itemList.length > 8 && itemList
										.length <= 16) {
										itemLists = [itemList.slice(0, 8), itemList
											.slice(8)
										];
									} else if (itemList.length > 16) {
										itemLists = [itemList.slice(0, 8), itemList
											.slice(8, 16)
										];
									}
									this.menuList = itemLists;
									break;
								case 'carousel':
									pageitem['picUrl'] = this.$api.serverURL +
										'/file/download?fileNo=' +
										pageitem.carousel_image;
									this.$set(itemList, index, pageitem);
									this.swiperList = itemList;
									break;
								case 'tablist':
									// this.newsList = itemList;
									// this.getPictureUrl(pageitem.icon_image).then(url => {
									//   pageitem['picUrl'] = url;
									//   this.$set(itemList, index, pageitem);
									//   this.newsList = itemList;
									// });
									// this.getCategoryList(pageitem.no).then(data => {
									//   pageitem['cate_name'] = data.cate_name;
									//   pageitem['cate_no'] = data.no;
									//   this.$set(itemList, index, pageitem);
									//   this.newsList = itemList;
									// });
									break;
							}
							itemList = res.data.data;
						});
						return itemList;
					}
				}
			},
			async getCategoryList(no) {
				//根据分类编号查询对应分类
				uni.showLoading({
					mask: true
				});
				const url = this.getServiceUrl('daq', 'srvdaq_cms_category_select',
					'select');
				const req = {
					serviceName: 'srvdaq_cms_category_select',
					queryMethod: 'select',
					colNames: ['*'],
					condition: [{
						colName: 'no',
						value: no,
						ruleType: 'eq'
					}]
				};
				let res = await this.$http.post(url, req);
				uni.hideLoading();
				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
					let data = res.data.data[0];
					return data;
				}
			},
			async getPictureUrl(file_no) {
				const serviceName = 'srvfile_attachment_select';
				const url = this.getServiceUrl('file', serviceName, 'select');
				const req = {
					serviceName: serviceName,
					colNames: ['*'],
					condition: [{
						colName: 'file_no',
						value: file_no,
						ruleType: 'eq'
					}]
				};
				if (file_no !== null && file_no !== '' && file_no !== undefined) {
					let res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS') {
						const data = res.data.data[0];
						if (data) {
							const fileurl = this.$api.srvHost +
								'/file/download?filePath=' + data.fileurl;
							return fileurl;
						}
					}
				}
			}
		},
		watch: {
			pageItemList: {
				deep: true,
				handler(newVal) {
					// console.log(newVal);
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.change-password {
		.cu-form-group {
			display: flex;
			align-items: center;
			flex-direction: row;
			text-align: left;

			.title {
				width: 33%;
			}

			.input {
				text-align: left;
			}
		}
	}

	@media screen and (min-width: 750px) {
		.page-wrap {
			position: relative;
			overflow: hidden;
			display: flex;
			flex-wrap: wrap;
			// max-width: 1366px;
			margin: 0 auto;

			// justify-content: space-around;
			.swiper-view {
				width: 100%;
				min-height: 500px;
				max-width: 1350px;
				max-height: 700px;
				margin: 0 auto;

				.carousel-view {
					width: 100%;
					height: 100%;

					/deep/.screen-swiper {
						height: 100%;
					}
				}
			}

			.menu-view {
				width: 100%;
				// max-width: 375px;
				margin: 0 auto;

				/deep/ .screen-swiper {
					width: 100%;
				}
			}

			.tab-list-view {
				max-width: 450px;
				margin: 10px auto;

				&:nth-child(2) {
					// margin-left: 20px;
				}
			}
		}
	}

	@media screen and (max-width: 750px) {
		.menu-view {
			width: 100%;
			// max-width: 375px;
			margin: 0 auto;

			/deep/ .screen-swiper {
				width: 100%;
			}
		}

		.tab-list-view {
			width: 100%;
			margin: 10px auto;

			&:nth-child(2) {
				// margin-left: 20px;
			}
		}
	}

	.page-wrap {
		position: relative;
		// overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 80rpx;
	}
</style>
