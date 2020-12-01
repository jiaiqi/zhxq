<template>
	<view class="face_wrap">
		<view class="face_top">
			<scroll-view scroll-x class="bg-white nav cu-bar">
			  <view class="flex text-center ">
			    <view
			      class="cu-item flex-sub"
			      :class="index == TabCur ? 'current-tab cur' : ''"
			      v-for="(item, index) in tabList"
			      :key="index"
			      @tap="tabSelect($event, item, index)"
			      :data-id="index"
			    >
			      {{ item.label }}
			      <text class="current-tab" style="margin-left: 10upx; padding:0 10upx;border-radius: 10upx;">{{ item.total }}</text>
			    </view>
			  </view>
			</scroll-view>
		</view>
		<view class="face_cen">
			<robby-image-upload
			v-if="isShow"
			  :value="imagesUrl"
			  :enable-del="true"
			  :enable-add="true"
			  :server-url="upLoadUrl"
			  @delete="deleteImage"
			  @add="getImageInfo"
			  :form-data="formData"
			  :header="reqHeader"
			  :showUploadProgress="true"
			  :server-url-delete-image="deleteFileUrl"
			  :limit="2"
			></robby-image-upload>
		</view>
		<view class="face_bot">
			<uni-button class="cu-btn bg-blue margin-tb-sm lg face_bot_btn">上传图片</uni-button>
		</view>
	</view>
</template>

<script>
	import robbyImageUpload from '@/components/robby-image-upload/robby-image-upload.vue';
	export default {
		name:'faceReg',
		components:{
			robbyImageUpload
		},
		data(){
			return {
				tabList:[{
					label: '上传图片',
				}],
				isShow:false,
				index: -1,
				TabCur: 0,
				reqHeader:null,
				deleteFileUrl: this.$api.deleteFile,
				imagesUrl: [],
				upLoadUrl: this.$api.upload,
				formData: {
				  serviceName: 'srv_bxfile_service',
				  interfaceName: 'add',
				  app_no: 'zhxq',
				  table_name: '',
				  columns: 'zp'
				},
			}
		},
		methods:{
			tabSelect(e, item, index) {
			  console.log(e);
			  this.TabCur = e.currentTarget.dataset.id;
			  this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
			  // this.getListData([], item.proc_data_type, index).then(callBackData => {
			  //   if (callBackData.page.rownumber * callBackData.page.pageNo >= callBackData.page.total) {
			  //     // finish(boolean:是否显示finishText,默认显示)
			  //     ;
			  //     console.log('callBackData', callBackData);
			  //     this.$refs.pullScroll.finish();
			  //   } else {
			  //     this.$refs.pullScroll.success();
			  //   }
			  // });
			},
			deleteImage(e) {
			  console.log(e);
			},
			async getImageInfo(e) {
			  let res = JSON.parse(e.allImages[0]);
			  let fileDatas = await this.getFilePath(res.file_no);
			  this.formData.file_no = res.file_no
			  this.imagesUrl.push(this.$api.getFilePath + fileDatas[0].fileurl)
			  
			  console.log("res----------",res)
			},
		},
		onLoad() {
			this.isShow = true
			this.reqHeader = {
			  bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
			};
		},
		mounted() {
			console.log('mountedmounted',this.imagesUrl)
			this.imagesUrl = []
		},
		beforeDestroy() {
			this.imagesUrl = []
		},
		onShow() {
			this.imagesUrl = []
		}
	}
</script>

<style lang="scss" scoped>
	.face_bot{
		display: flex;
		justify-content: center;
		align-items: center;
		.face_bot_btn{
			width: 90%;		
		}
	}
	
</style>
