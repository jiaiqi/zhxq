<template>
	<view  v-if="listData.length > 0" class="cu-list grid" :class="['col-' + columnNum,gridBorder?'':'no-border']">
		<view class="cu-item" v-for="(item,index) in listData" :key="index" v-if="(index + 1) < (columnNum * rowNum)"  @click="buricon(item)">
			<view class="crip">
				<text class="textIcon" v-if="!isInvalid(item[options.images])">{{ item[options.key_disp_col][0] }}</text>
				<image mode="aspectFill" :onerror="item[options.images]=''" class="item-img shadow shadow-lg" v-if="isInvalid(item[options.images])" :src="options.images !== '' ? item[options.images] : ''" >
					<view class="cu-tag badge" v-if="item.hasOwnProperty('badge') && item.badge!=0">
						<block v-if="item.badge!=1">{{item.badge>99?'99+':item.badge}}</block>
					</view>
				</image>
				<view  v-if="options.images === ''" :class="['cuIcon-' + item.cuIcon,'text-' + item.color]">
					<!-- <view class="cu-tag badge" v-if="item.badge!=0">
						<block v-if="item.badge!=1">{{item.badge>99?'99+':item.badge}}</block>
					</view> -->
				</view>
			</view>
			<text  class="icon-title text-cut">{{item[options.key_disp_col]}}</text> 
		</view>
		<view class="cu-item" v-if="(columnNum * rowNum) < listData.length "   @click="buricon(moreButton)">
			<view class="crip">
				<image mode="aspectFill" class="item-img shadow shadow-lg" :src="moreButton.icon" >
					<!-- <view class="cu-tag badge" v-if="item.badge!=0">
						<block v-if="item.badge!=1">{{item.badge>99?'99+':item.badge}}</block>
					</view> -->
				</image>
			</view>
			<text class="icon-title text-cut">{{moreButton.name}}</text> 
		</view>
	</view>
	
</template>

<script>
	import more from "@/static/tabbar/more.png"
	export default{
		props:{
			options:{
				type: Object,
				default: function() {
					return {
						"key_disp_col":"",
						"no_col":"",
						"parent_no_col":"",
						"is_tree": false,
						"images":""
					};
				}
			},
			isTree:{ //数据是否为树状结构
				type:Boolean,
				default:false , 
			},
			loadType:{// 显示类型  可选gridData/srv
				type:String,
				default:'srv' ,  // srv || gridData
			},
			serviceName:{ //查询信息
				type: String,
				default: ''
			},
			gridData: { // 分类信息
				type: Array,
				default: function() {
					return [];
				}
			},
			condition:{
				type: Array,
				default: function() {
					return [];
				}
			},
			columnNum:{//列数  可选  3/4/5
				type:Number,
				default: 4,  
			},
			rowNum:{//行数  可选 1/2
				type:Number,
				default: 1,  
			},
			errTips:{  //link 错误提示
				type:String,
				default: "无法打开",
			},
			gridBorder:{ ///是否显示线框
				type:Boolean,
				default: false,
			},
			IsMoreButton:{///是否显示更多按钮
				type:Boolean,
				default: true,
			},
			moreLink:{///是否显示更多按钮
				type:String,
				default: "",
			}
		},
		data(){
			return{
				listData:this.gridData,
				moreButton:{
					name:"全部",
					key:"more",
					icon:more,
					link:this.moreLink
				}
			}
		},
		
		methods:{
			buricon(item){
				console.log(item)
				
				if(item.hasOwnProperty("key") && item.key === "more"){
					
					uni.navigateTo({
						url:this.moreButton.link
					})
					
				}else{
					this.$emit("on-grid-item",item)
				}
			},
			imgPath(){
				
			},
			async loadData(){
				// console.log("loadData1",this.listData,this.gridData)
				if(this.condition.length > 0){
					this.listData = this.bxDataFilter(this.gridData,this.condition)
					// console.log("loadData2",this.listData)
				}
				if(this.options.hasOwnProperty("images") && this.isInvalid(this.options.images)){
					for(let i = 0;i,i < this.listData.length;i++){
						if(this.isInvalid(this.listData[i][this.options.images])){
							let url = await this.getFilePath(this.listData[i][this.options.images])
							this.listData[i][this.options.images] =  this.$api.getFilePath + url[0].fileurl + "&thumbnailType=" + this.$api.imgThumbnailType
						}
						
					}
				}
			},
			isInvalid:function(e) {
			  if (e === '' || e === null || e === undefined) {
			    return false
			  } else {
			    return true
			  }
			}
		},
		mounted() {
			
			// console.log(this.serviceName)
			this.loadData()
		}
	}
</script>

<style scoped>
	.cu-item{
		/* position: relative; */
		display: flex;
		justify-content: space-between;
		
	}
	.crip{
		width: 88upx;
		height: 88upx;
		/* background: #4d89ad61; */
		border-radius: 50%;
		margin-left: calc(50% - 44upx);
		text-align: center;
	}
	.textIcon{
		background-color: #007AFF;
		color: #ffffff !important;
		border-radius: 10upx;
		font-weight: 200;
		line-height: 88upx !important;
		margin-top:0 !important ;
		font-size: 40upx !important;
	}
	.item-img{
		border-radius: 10upx;
		overflow: hidden;
		height: 88upx;
		width: 88upx;
		box-shadow: #333333;
	}
	.icon-title{
		
	}
</style>
