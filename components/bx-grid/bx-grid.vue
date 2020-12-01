<template>
	<view>
		<view class="bg-white padding">
			<view class="grid col-6 padding-sm">
				<view class="margin-tb-sm text-center" v-for="(item,index) in apps" :key="index" @click="onApp(item,index)">
					<button class="cu-btn round" :class="activeApp[nodeKey] === item[nodeKey] ? 'line-blue text-blue':''">{{item.title}}</button>
				</view>
			</view>
			
			<!-- <bxTreeSelector
			ref="bxTreeSelector" 
			:isMultiple="false" 
			:options="testOptions" 
			:dataLoadType="'nodes'"
			:defaultValue="'bxsys'"
			:nodeDatas="testDatas"
			:treeForeignKey="treeForeignKey"
			@on-tree-change="onTreeSelector" 
			></bxTreeSelector> -->
			<treeGrid 
			:treeData="appMenusData" 
			:childNodeCol="'_childNode'" 
			:disColName="'menu_name'" 
			:nodeKey="'menu_no'"
			@on-tree-grid-change="onTreeGridChange"
			@on-tree-lastcode="onMenu"
			></treeGrid>
		</view>
	</view>
</template>

<script>
	import treeGrid from "@/components/bx-tree-grid/bx-tree-grid.vue"
	import bxTreeSelector from '@/components/bx-tree-selector/bx-tree-selector.vue' 
	export default {
		components:{treeGrid,bxTreeSelector},
		props:{
			gridData:{
				type:Array,
				default() {
					return [];
				}
			},
			disColName:{
				type:String,
				default(){
					return ""
				}
			},
			nodeKey:{
				type:String,
				default(){
					return ""
				}
			},
		},
		data() {
			return {
				apps:this.gridData,
				appMenu:[],
				appMenusData:[],
				activeApp:{},
				testOptions:{
					conditions:[{colName:"menu_no",
					ruleType:"eq",
					value:'goods'}],
					is_tree:true,
					key_disp_col:"menu_name",
					refed_col:"menu_no",
					serviceName:"srvauth_user_app_menu_select",
				},
				treeForeignKey:{
					parentNoColName:"parent_no",
					colKeyName:"menu_no"
				},
				testDatas:[]
			};
		},
		methods:{
			onTreeGridChange(e){
				console.log("onTreeGridChange",e)
			},
			onMenu(e){
				if(this.isInvalid(e.item.service_name)){
					let viewTemp = e.item.app_temp_col_map
					if(this.isInvalid(e.item.app_temp_col_map)){
						
					}
					uni.navigateTo({
						url:"/pages/public/list/list?serviceName=" + e.item.service_name + "&pageType=list" + (this.isInvalid(e.item.app_temp_col_map) ? "&viewTemp=" + viewTemp : "")
					})
				}else{
					uni.showToast({
						title:"无效服务"
					})
				}
				console.log("onMenu",e)
			},
			onApp(item,index){
				uni.showLoading({
					title:"加载中",
					mask:true
				})
				if(item.name === this.activeApp.name){
					this.activeApp = {}
					this.appMenusData = []
					uni.hideLoading()
				}else{
					this.activeApp = item
					this.apps = this.apps.map((item,i)=>{
						if(item.selected){
							item.selected = false
						}
						return item
					})
					uni.setStorageSync("activeApp",this.apps[index][this.nodeKey])
					this.apps[index].selected = true
					this.getAppMenu(this.apps[index][this.nodeKey])
				}
				
				
			},
			getAppMenu:function(e){
				let req = {
					"serviceName":"srvsys_user_menu_select",
					"colNames":["*"],
					"order":[{"colName":"seq","orderType":"asc"}],
				}
				this.onRequest("select","srvsys_user_menu_select",req,e).then((res)=>{
					console.log("appmenu1",res)
					if(res.data.state === 'SUCCESS' && res.data.data.length>0){
						this.appMenu = this.arraySort(res.data.data,"seq")
						this.appMenusData = this.deepClone(this.appMenu)
						this.testDatas = this.deepClone(this.appMenu)
						this.appMenusData = this.treeReform(this.appMenusData,"parent_no","menu_no")
						this.appMenu = this.appMenu.map((item,index)=>{
							let a = {
								title:"",
								name:"",
								icon:"",
								seq:"",
								pages:"",
								link:"",
								type:"button"
							}
							a.title = item.menu_name
							a.name = item.menu_no
							a.icon = item.app_icon
							a.shortcut_flag = item.shortcut_flag
							a.seq = item.seq
							a.service_name = item.service_name
							a.pages = item.menu_name
							// 测试数据
							// a.link = item.class_name
							// a.type = item.class_name
							return a
						})
						uni.hideLoading()
					}
				})
			}
		}
	}
</script>

<style lang="less">

</style>
