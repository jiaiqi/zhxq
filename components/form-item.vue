<template>
	<view>
		<view class="cu-form-group " v-show="fieldData.showExp">
			<view class="title" :class="!valid.valid ? 'valid_error' : ''">
				<text class="text-red text-shadow" v-show="fieldData.isRequire">*</text>
				{{ fieldData.label }}:
				<text v-show="!valid.valid">({{ valid.msg }})</text>
			</view>
			<view v-if="pageFormType === 'detail'">
				<text class="text-bold text-xl" v-if="pageFormType === 'detail' && fieldData.type !== 'images'">{{ fieldData.value }}</text>
				<view class="" v-else-if="pageFormType === 'detail' && fieldData.type === 'images'">
					<image
						v-if="fieldData.type === 'images'"
						v-for="(item, index) in imagesUrl"
						:key="index"
						style="padding: 5upx;"
						class="cu-avatar radius lg"
						@tap="showModal(index, 'Image')"
						data-target="Image"
						:src="item"
					></image>
				</view>
			</view>

			<view v-if="pageFormType === 'form'">
				<radio-group @change="radioChange" v-if="fieldData.type === 'rideo'" :class="!valid.valid ? 'valid_error' : ''">
					<radio
						:key="index"
						v-for="(itema, index) in fieldData.options"
						class="radio"
						:checked="itema.key ? itema.key === fieldData.value : itema === fieldData.value"
						v-model="itema.key || itema"
					>
						<span>{{ itema.label ? itema.label : itema }}</span>
					</radio>
				</radio-group>
				<!-- <view v-else-if="fieldData.type === 'images'" style="width: 100%;">
					<image style="width: 100%;" v-for="(item,index) in imagesUrl" :key="index" :src="item" mode="aspectFit"></image>
				</view> -->
				<view v-else-if="fieldData.type === 'images'">
					<robby-image-upload
						:value="imagesUrl"
						:server-url="upLoadUrl"
						@delete="deleteImage"
						@add="getImageInfo"
						:form-data="formData"
						:header="reqHeader"
						:showUploadProgress="true"
						:server-url-delete-image="deleteFileUrl"
						:limit="fieldData.fileNum"
					></robby-image-upload>
				</view>
				<textarea
					maxlength="100"
					@blur="onInputChange"
					v-model="fieldData.value"
					@input="onInputChange"
					:class="!valid.valid ? 'valid_error' : ''"
					v-else-if="fieldData.type === 'textarea' && showTextarea"
					:placeholder="'输入' + fieldData.label"
				></textarea>
				<view class="content" v-else-if="fieldData.type === 'date' || fieldData.type === 'dateTime' || fieldData.type === 'time'">
					<input
						@input="onInputChange"
						v-model="fieldData.value"
						disabled
						class="date-input"
						@click.stop="toggleTab(fieldData.type)"
						:placeholder="'请选择' + fieldData.label"
						:class="!valid.valid ? 'valid_error' : ''"
						name="input"
					/>
					<text class="input-icon cuIcon-calendar text-gray" @click="toggleTab(fieldData.type)"></text>

					<w-picker mode="date" startYear="2017" endYear="2030" :current="false" @confirm="onConfirm" :disabledAfter="false" ref="date" themeColor="#f00"></w-picker>
					<w-picker
						mode="yearMonth"
						startYear="2016"
						endYear="2030"
						:current="false"
						@confirm="onConfirm"
						:disabledAfter="false"
						ref="yearMonth"
						themeColor="#f00"
					></w-picker>
					<w-picker mode="dateTime" startYear="2017" endYear="2030" step="1" :current="false" @confirm="onConfirm" ref="dateTime" themeColor="#f00"></w-picker>
					<w-picker mode="time" :current="false" @confirm="onConfirm" ref="time" step="1"></w-picker>
				</view>
				<view v-else-if="fieldData.type === 'list'">
					<view v-for="(item, index) in fieldData.options" :key="index"><input type="text" value="" /></view>
				</view>
				<input
					@blur="onInputChange"
					type="number"
					:placeholder="'输入' + fieldData.label"
					@input="onInputChange"
					max="100"
					v-model="fieldData.value"
					:class="!valid.valid ? 'valid_error' : ''"
					name="input"
					v-else-if="fieldData.type === 'number'"
				/>
				<input
					@blur="onInputChange"
					type="digit"
					:placeholder="'输入' + fieldData.label"
					@input="onInputChange"
					max="100"
					v-model="fieldData.value"
					:class="!valid.valid ? 'valid_error' : ''"
					name="input"
					v-else-if="fieldData.type === 'digit'"
				/>
				<view v-else-if="fieldData.type === 'cascader'" @click="openCascader">
					<input :placeholder="'点击选择' + fieldData.label" v-model="fieldData.value" disabled :class="!valid.valid ? 'valid_error' : ''" name="input" />
				</view>
				<view class="item-group flex align-center" v-else>
					<input
						@blur="onInputChange"
						:placeholder="'输入' + fieldData.label"
						v-model="fieldData.value"
						@input="onInputChange"
						:class="!valid.valid ? 'valid_error' : ''"
						name="input"
					/>
					<button
						class="cu-btn bg-green shadow input-button"
						v-if="fieldData.buttons && fieldData.buttons.length > 0"
						:key="index"
						v-for="(btn, index) in fieldData.buttons"
						@click.stop="onButtons(fieldData, btn)"
					>
						{{ btn.name }}
					</button>
				</view>
			</view>
		</view>
		<view class="cu-modal" :class="modalName == 'Image' ? 'show' : ''" @tap="hideModal">
			<view class="cu-dialog" style="height: 100vh;width:100vw;z-index: 999999;">
				<view class="bg-img" :style="'background-image: url(' + imagesUrl[imageIndex] + ');height:100%;background-size:100%;'">
					<view class="cu-bar justify-end text-blue">
						<view class="action" @tap="hideModal"><text class="cuIcon-close text-blue"></text></view>
					</view>
				</view>
				<!-- <view class="cu-bar bg-white">
					<view class="action margin-0 flex-sub  solid-left" @tap="hideModal">关闭</view>
				</view> -->
			</view>
		</view>

		<uni-popup ref="popup" type="bottom" @change="changePopup">
			<cascader-selector @getCascaderValue="getCascaderValue" :srvInfo="fieldData.srvInfo" :defaultLineVal="defaultLineVal"></cascader-selector>
		</uni-popup>
	</view>
</template>

<script>
import wPicker from '@/components/w-picker/w-picker.vue';
import robbyImageUpload from '@/components/robby-image-upload/robby-image-upload.vue';
import cascaderSelector from '@/components/cascader/cascaderSelector.vue';
import uniPopup from '@/components/uni-popup/uni-popup.vue';
let _this = null;
export default {
	components: {
		wPicker,
		robbyImageUpload,
		cascaderSelector,
		uniPopup
	},
	props: {
		field: {
			type: Object,
			default() {
				return {};
			}
		},
		pageFormType: {
			type: String,
			default() {
				return 'form';
			}
		},
		showTextarea: {
			type: Boolean,
			default: true
		}
	},
	name: 'formItem',
	data() {
		return {
			defaultLineVal: '',
			imageIndex: null,
			modalName: null,
			formData: {
				serviceName: 'srv_bxfile_service',
				interfaceName: 'add',
				app_no: '',
				table_name: '',
				columns: ''
			},
			reqHeader: null,
			fieldData: this.field,
			valid: {
				column: this.field.column,
				valid: true,
				msg: '不能为空!'
			},
			deleteFileUrl: this.$api.deleteFile,
			upLoadUrl: this.$api.upload,
			imagesUrl: [],
			title: 'Hello',
			startYear: new Date().getFullYear(),
			linkageVal: ['10', '1012', '10122'],
			linkageDval: ['浙江省', '宁波市', '海曙区'],
			rangeDval: ['2018-10-30', '2020-12-31'],
			regionDval: ['浙江省', '杭州市', '滨江区'],
			selectList: [
				{
					label: '男',
					value: 1
				},
				{
					label: '女',
					value: 2
				},
				{
					label: '中性',
					value: 3
				}
			],
			resultInfo: {
				result: '2019-12-20 10:00:00'
			},
			linkList: [
				{
					label: '浙江省',
					value: '10',
					children: [
						{
							label: '杭州市',
							value: '1010',
							children: [
								{
									label: '滨江区',
									value: '10101'
								},
								{
									label: '萧山区',
									value: '10102'
								}
							]
						},
						{
							label: '宁波市',
							value: '1012',
							children: [
								{
									label: '海曙区',
									value: '10121'
								},
								{
									label: '鄞州区',
									value: '10122'
								}
							]
						}
					]
				},
				{
					label: '广东省',
					value: '20',
					children: [
						{
							label: '广州市',
							value: '2010',
							children: [
								{
									label: '广州1区',
									value: '20101'
								},
								{
									label: '广州2区',
									value: '20102'
								}
							]
						}
					]
				}
			]
		};
	},
	created() {
		this.fieldData = this.field;
		this.reqHeader = {
			bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
		};
		if (this.fieldData.type === 'images') {
			(this.formData = {
				serviceName: 'srv_bxfile_service',
				interfaceName: 'add',
				app_no: '',
				table_name: '',
				columns: ''
			}),
				(this.formData['app_no'] = this.fieldData.srvInfo.appNo);
			this.formData['table_name'] = this.fieldData.srvInfo.tableName;
			this.formData['columns'] = this.fieldData.column;
			if (this.fieldData.value !== '' && this.fieldData.value !== null && this.fieldData.value !== undefined) {
				this.formData['file_no'] = this.fieldData.value;
			}
		}
		if (this.fieldData.type === 'cascader') {
			this.formData['serviceName'] = this.fieldData.srvInfo.serviceName;
			this.formData['app_no'] = this.fieldData.srvInfo.appNo;
		}
		this.getDefVal();
		console.log(this.fieldData.label + this.pageFormType + this.fieldData.value);
	},
	// onShow() {
	// 	this.fieldData = this.field;
	// 	this.getDefVal()
	// },
	methods: {
		showModal(e, i) {
			this.modalName = i;
			this.imageIndex = e;
		},
		hideModal(e) {
			this.modalName = null;
		},
		deleteImage(e) {
			console.log(e);
		},
		getImageInfo(e) {
			let res = JSON.parse(e.allImages[0]);

			this.fieldData.value = res.file_no;
			console.log('图片返回：', e, e.allImages[0], res, this.fieldData.value);
			if (this.fieldData.value !== '' && this.fieldData.value !== null && this.fieldData.value !== undefined) {
				this.formData['file_no'] = this.fieldData.value;
			}
			this.onInputChange();
		},
		onButtons(e, b) {
			b.column = e.column;
			this.$emit('on-form-item', b);
		},
		async getDefVal() {
			let self = this;
			// console.log('file:',this.fieldData,this.field)
			if (this.fieldData.type === 'images' && this.fieldData.value !== '') {
				console.log('file:1', this.fieldData, this.field);
				let fileDatas = await self.getFilePath(this.fieldData.value);
				self.imagesUrl = [];
				for (let i = 0; i < fileDatas.length; i++) {
					console.log('file:2', self.$api.getFilePath + fileDatas[i].fileurl);

					self.imagesUrl.push(self.$api.getFilePath + fileDatas[i].fileurl);
				}
				console.log('imagesUrl:===>', this.imagesUrl, fileDatas);
			}
		},
		radioChange(e) {
			this.fieldData.value = e.target.value;
			this.$emit('on-value-change', this.fieldData);
			console.log(e.target.value);
			this.getValid();
		},
		onInputChange() {
			this.$emit('on-value-change', this.fieldData);
			this.getValid();
		},
		getValid: function() {
			if (this.field.showExp && this.field.isRequire && this.field.value !== '') {
				this.valid.valid = true;
			} else if (!this.field.showExp || !this.field.isRequire) {
				this.valid.valid = true;
			} else {
				this.valid.valid = false;
			}
			this.fieldData.valid = this.valid;
			this.$emit('on-value-change', this.fieldData);
			return this.valid;
		},
		toggleTab(str) {
			console.log('点击', str);
			this.$refs[str].show();
			console.log(this.$refs[str].show());
		},
		onConfirm(val) {
			console.log(val);
			//如果页面需要调用多个mode类型，可以根据mode处理结果渲染到哪里;
			// switch(this.mode){
			// 	case "date":
			// 		break;
			// }
			// this.fieldData.value={...val};
			this.fieldData.value = val.result;
		},
		changePopup(e) {
			this.$emit('on-form-item', this.fieldData);
		},
		openCascader() {
			this.defaultLineVal = this.fieldData.value;
			this.$refs.popup.open();
		},
		getCascaderValue(val, btnType) {
			console.log(val);
			if (btnType === 'sure') {
				this.$refs.popup.close();
				if (val) {
					val['column'] = this.fieldData.column;
					this.$emit('get-cascader-val', val);
					this.fieldData.value = val.path_name;
				} else {
					this.$emit('get-cascader-val');
				}
			}
		}
	},
	watch: {
		field: {
			handler: function(newValue, oldValue) {
				this.fieldData = newValue;
			},
			deep: true
		},
		fieldData: {
			handler: function(newValue, oldValue) {
				this.getValid();
				this.getDefVal();
			},
			deep: true
		}
	}
};
</script>

<style lang="less" scoped>
.content {
	text-align: left;
	// height: 400upx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
}
uni-text.input-icon {
	position: relative;
	font-size: 42upx;
	right: 60upx;
}
.tab {
	padding: 20upx 0;
	font-size: 32upx;
}
.tab.active {
	color: #f00;
}
.result {
	margin-top: 100upx;
	font-size: 32upx;
}
.input-button {
	width: 40%;
	margin-left: 20upx;
	display: inline-block;
	height: 100%;
	padding: 10upx;
	font-size: 32upx;
	line-height: 64upx;
}
</style>
