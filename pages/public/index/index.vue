<template>
	<view class="page-wrap">
		<view
			v-for="(pageItem, itemIndex) in pageItemList"
			:key="itemIndex"
			:class="{ 'swiper-view': pageItem.div_type === 'carousel', 'menu-view': pageItem.div_type === 'buttons', 'tab-list-view': pageItem.div_type === 'tablist' }"
		>
			<SwiperCarousel :swiperList="swiperList" v-if="pageItem.div_type === 'carousel'" @clickSwiper="clickSwiper" :imgCol="'picUrl'"></SwiperCarousel>
			<!-- <SwiperMenu  v-if="pageItem.div_type === 'buttons'" :menuList="menuList" @clickMenu="clickMenu"></SwiperMenu> -->
			<SwiperMenu v-if="pageItem.div_type === 'buttons'" :menuList="pageItem.data" :menuLabel="pageItem.item_label" @clickMenu="clickMenu"></SwiperMenu>
			<TabList
				@clickListItem="clickListItem"
				@showMore="showMore($event, pageItem)"
				v-if="pageItem.div_type === 'tablist'"
				:pageItem="pageItem"
				:srvApp="tabListConfig['srvApp']"
				:contentService="tabListConfig['contentService']"
				:cateService="tabListConfig['cateService']"
				:contentTemplate="tabListConfig['contentTemplate']"
			></TabList>
		</view>
	</view>
</template>

<script>
import TabList from '@/components/bx-tablist/bx-tablist.vue';
import SwiperCarousel from '@/components/bx-swiper/bx-swiper.vue';
import SwiperMenu from '@/components/bx-swiper-menu/bx-swiper-menu.vue';
export default {
	components: { TabList, SwiperCarousel, SwiperMenu },
	data() {
		return {
			scrollTop: 0,
			TabCur: 0,
			scrollLeft: 0,
			dotStyle: true,
			pageItemList: [], //页面项列表，控制页面显示内容
			menuList: [], //按钮列表
			newsList: [], //新闻列表
			swiperList: [], //轮播图列表
			categoryList: [], //分类列表
			webNo: 'WS2020061018580009',
			webNo2: '',
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
			// tabsList:{}
			// tabNewsList: [] //根据栏目分类的新闻列表
		};
	},
	created() {
		wx.showShareMenu({
			withShareTicket: true
		});
		this.getPageItemList();
	},
	mounted() {
		 	wx.showShareMenu({
		  withShareTicket: true
		})
		// wx.showShareMenu({
		// 	withShareTicket: true,
		// 	menus: ['shareAppMessage', 'shareTimeline']
		// });
	},
	computed: {
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
		showMore(e, pageitem) {
			console.log('点击了更多按钮', e, pageitem);
			uni.navigateTo({
				url: '/pages/specific/newsList/newsList?cate_no=' + e.no
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
		clickMenu(e) {
			// 菜单按钮点击事件
			console.log('点击了按钮：', e);
			if (e.dest_page.indexOf('website_no') > -1) {
				let startUrl = e.dest_page.slice('?');
				let startStr = e.dest_page.indexOf('?');
				let endStr = e.dest_page.indexOf('&');
				let stri = '';
				if (endStr < 0) {
					stri = e.dest_page.slice(startStr);
				} else {
					stri = e.dest_page.slice(startStr, endStr);
				}
				stri = stri.split('=');
				// this.webNo2 = stri[1]
				// uni.setStorageSync('website_no',stri[])
				let query = {
					website_no: stri[1]
				};
				if (endStr > 0) {
					let endApp = e.dest_page.split('&');
					let endApps = endApp[1].split('=');
					query[endApps[0]] = endApps[1];
				}
				let startAppUrl = e.dest_page.split('?');
				// console.log("query---",query)
				// console.log("----------",startAppUrl[0] + '?/query=')
				// urlAllArgument[0] + '?website_no=' + queryObj.website_no + '&destApp=' + queryObj.destApp
				uni.navigateTo({
					url: startAppUrl[0] + '?website_no=' + query.website_no + '&destApp=' + query.destApp
				});
			}
			if (e.type && e.type === 'more') {
				// 点击了更多按钮
				console.log('点击了更多按钮');
				// uni.navigateTo({
				// url: '/pages/public/home/home'
				// });
			} else if (e.type && e.type === 'health') {
				uni.navigateTo({
					url: '/pages/specific/symptom/symptom'
				});
			} else if (e.dest_page.indexOf('website_no') > -1) {
				uni.navigateTo({
					url: e.dest_page
				});
			} else if (e.dest_page) {
				if (e.dest_app) {
					uni.setStorageSync('activeApp', e.dest_app);
				}
				console.log(e.dest_page);
				let urlArgumentIndex = e.dest_page.indexOf('?');

				let urlAllArgument = e.dest_page.split('?');
				let queryObj = {};
				if (urlArgumentIndex >= 0) {
					if (urlAllArgument[1].indexOf('&') < 0) {
						for (let i = 1; i < urlAllArgument.length; i++) {
							let urlAloneArgument = urlAllArgument[i].split('=');
							queryObj[urlAloneArgument[0]] = urlAloneArgument[1];
						}
					} else {
						let urlArg = urlAllArgument[1].split('&');
						for (let j = 0; j < urlArg.length; j++) {
							let urlAlo = urlArg[j].split('=');
							queryObj[urlAlo[0]] = decodeURIComponent(urlAlo[1]);
						}
					}
					console.log('queryObj=======', queryObj);
					uni.navigateTo({
						url: urlAllArgument[0] + '?query=' + encodeURIComponent(JSON.stringify(queryObj))
					});
				} else if (e.dest_menu_no == '紧急求助' || e.dest_menu_no === '出入登记') {
					uni.navigateTo({
						url: e.dest_page
					});
				}
			}
		},
		clickListItem(e) {
			// 列表点击事件
			console.log('点击了列表项：', e);
			let query = {
				serviceName: 'srvdaq_cms_content_select',
				content_no: e.content_no,
				destApp: 'daq'
			};

			uni.navigateTo({
				// url: `/pages/specific/article/article?serviceName=srvdaq_cms_content_select&content_no=${e.content_no}&cate_name=${e.cate_name}`
				url: '/pages/specific/article/article?query=' + encodeURIComponent(JSON.stringify(query))
			});
		},
		async getPageItemList() {
			//获取页面项列表
			uni.showLoading({
				mask: true
			});
			let url = this.getServiceUrl('daq', 'srvdaq_website_page_item_select', 'select');
			let req = {
				serviceName: 'srvdaq_website_page_item_select',
				colNames: ['*'],
				order: [{ colName: 'seq', orderType: 'asc' }],
				condition: [{ colName: 'website_no', ruleType: 'eq', value: this.webNo }]
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
						item['data'] = data;
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
					group: [
						{
							colName: 'no',
							type: 'by'
						}
					]
					// order: [{ colName: 'seq', orderType: 'asc' }] ,
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
					order: [{ colName: 'seq', orderType: 'asc' }],
					condition: [{ colName: 'item_no', ruleType: 'in', value: item.item_no }]
				};
				let res = await this.$http.post(url, req);
				uni.hideLoading();
				if (res.data.state === 'SUCCESS') {
					// this.itemList = res.data.data;
					let itemList = res.data.data;
					itemList.forEach((pageitem, index) => {
						switch (item.div_type) {
							case 'buttons':
								let itemLists = [];
								// {type:'health',dest_app: '更多'},{ type: 'more', dest_app: '更多' }
								// itemList = itemList.concat([{ type: 'health', dest_menu_no: '症状自检' }, { type: 'more', dest_menu_no: '更多' }]);
								if (itemList.length <= 8) {
									// itemLists = [[...itemList]];
									itemLists = [itemList];
								} else if (itemList.length > 8 && itemList.length <= 16) {
									itemLists = [itemList.slice(0, 8), itemList.slice(8)];
								} else if (itemList.length > 16) {
									itemLists = [itemList.slice(0, 8), itemList.slice(8, 16)];
								}
								this.menuList = itemLists;
								break;
							case 'carousel':
								pageitem['picUrl'] = this.$api.serverURL + '/file/download?fileNo=' + pageitem.carousel_image;
								this.$set(itemList, index, pageitem);
								this.swiperList = itemList;
								// this.getPictureUrl(pageitem.carousel_image).then(url => {
								//   pageitem['picUrl'] = url;
								//   this.$set(itemList, index, pageitem);
								//   this.swiperList = itemList;
								// });
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
			const url = this.getServiceUrl('daq', 'srvdaq_cms_category_select', 'select');
			const req = { serviceName: 'srvdaq_cms_category_select', queryMethod: 'select', colNames: ['*'], condition: [{ colName: 'no', value: no, ruleType: 'eq' }] };
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
				condition: [{ colName: 'file_no', value: file_no, ruleType: 'eq' }]
			};
			if (file_no !== null && file_no !== '' && file_no !== undefined) {
				let res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					const data = res.data.data[0];
					if (data) {
						const fileurl = this.$api.srvHost + '/file/download?filePath=' + data.fileurl+'&bx_auth_ticket='+uni.getStorageSync('bx_auth_ticket');
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
			max-width: 375px;
			margin: 0 auto;
			overflow: hidden;
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
		max-width: 375px;
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
	min-height: 100vh;
	background-color: #fff;
}
</style>
