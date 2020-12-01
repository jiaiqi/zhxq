<template>
	<view>
		<view class="cu-form-group itemwrap" v-if="fieldData.display" :class="{ 'form-detail': pageFormType === 'detail' }">
			<view class="title" :class="!valid.valid ? 'valid_error' : ''">
				<text class="text-red text-shadow" v-show="fieldData.isRequire">*</text>
				{{ fieldData.label }}:
				<text v-show="!valid.valid">({{ valid.msg }})</text>
			</view>
			<view v-if="pageFormType === 'detail'" class="detail-text">
				<text class=" text-xl" v-if="pageFormType === 'detail' && fieldData.type !== 'images' && fieldData.type !== 'snote' && fieldData.type !== 'Note'">
					{{ dictShowValue ? dictShowValue : treeSelectorShowValue ? treeSelectorShowValue : fieldData.value }}
				</text>
				<view class="" v-html="fieldData.value" v-if="pageFormType === 'detail' && (fieldData.type === 'snote' || fieldData.type === 'Note')"></view>
				<!-- <view
          v-html="JSON.parse(JSON.stringify(fieldData.value).replace(/\<img/gi, '<img width=100% height=auto '))"
          v-if="pageFormType === 'detail' && (fieldData.type === 'snote' || fieldData.type === 'Note')"
        ></view> -->
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

			<view
				class="form-content"
				:class="{
					alo_radio: fieldData.type === 'radio' || fieldData.type === 'radioFk' || fieldData.type === 'checkbox' || fieldData.type === 'checkbox' || fieldData.type === 'images',
					valid_error: !valid.valid
				}"
				v-if="pageFormType === 'form' || pageFormType === 'add' || pageFormType === 'update'"
			>
				<radio-group @change="radioChange" v-if="fieldData.type === 'radio'" :class="!valid.valid ? 'valid_error' : ''">
					<radio
						color="#0bc99d"
						:key="index"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						v-for="(itema, index) in fieldData.options"
						class="radio"
						:checked="itema === fieldData.value"
						:value="itema"
					>
						<span style="flex: 1;padding-left: 2rpx;">{{ itema }}</span>
					</radio>
				</radio-group>
				<radio-group @change="radioChange" v-else-if="fieldData.type === 'radioFk'" :class="!valid.valid ? 'valid_error' : ''">
					<radio
						color="#0bc99d"
						:key="index"
						v-for="(itema, index) in fieldData.options"
						class="blue radio"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						:checked="!!fieldData.value && itema.value === fieldData.value"
						:value="itema.value"
					>
						<!-- <view class="title">{{itema.label}}</view> -->
						<span style="flex: 1;padding-left: 2rpx;">{{ itema.label }}</span>
					</radio>
				</radio-group>
				<checkbox-group name="checkbox-group" class="checkbox-group" @change="radioChange" v-else-if="fieldData.type === 'checkbox'" :class="!valid.valid ? 'valid_error' : ''">
					<label v-for="(item, index) in fieldData.options" :key="index" class="checkbox">
						<checkbox
							color="#0bc99d"
							:value="item"
							:disabled="fieldData.disabled ? fieldData.disabled : false"
							:checked="fieldData && fieldData.value && isArray(fieldData.value) ? fieldData.value.indexOf(item) !== -1 : false"
						/>
						<text style="flex: 1;">{{ item }}</text>
					</label>
				</checkbox-group>
				<checkbox-group name="checkbox-group" class="checkbox-group" @change="radioChange" v-else-if="fieldData.type === 'checkboxFk'" :class="!valid.valid ? 'valid_error' : ''">
					<label v-for="(item, index) in fieldData.options" :key="index" class="checkbox">
						<checkbox
							color="#0bc99d"
							:value="item.key"
							:disabled="fieldData.disabled ? fieldData.disabled : false"
							:checked="fieldData && fieldData.value && isArray(fieldData.value) ? fieldData.value.indexOf(item.key) !== -1 : false"
						/>
						<text style="flex: 1;">{{ item.label }}</text>
					</label>
				</checkbox-group>
				<!-- <view v-else-if="fieldData.type === 'images'" style="width: 100%;">
					<image style="width: 100%;" v-for="(item,index) in imagesUrl" :key="index" :src="item" mode="aspectFit"></image>
				</view> -->
				<view v-else-if="fieldData.type === 'images'">
					<robby-image-upload
						:value="imagesUrl"
						:enable-del="fieldData.disabled ? !fieldData.disabled : true"
						:enable-add="fieldData.disabled ? !fieldData.disabled : true"
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
				<view class="" v-else-if="fieldData.type === 'file'">
					<attachment
						mode="create"
						:canUploadFile="true"
						:uploadFileUrl="uploadFileUrl"
						:heaer="header"
						@add="getFileInfo"
						:srvInfo="formData"
						:showProcess="true"
						:attachmentList.sync="attachmentList"
					></attachment>
				</view>
				<textarea
					style="min-height: 60px;width: 100%;"
					:maxlength="fieldData.item_type_attr && fieldData.item_type_attr.max_len ? fieldData.item_type_attr.max_len : 100"
					@blur="onInputBlur"
					auto-height
					v-model="fieldData.value"
					@input="onInputChange"
					:disabled="fieldData.disabled ? fieldData.disabled : false"
					:class="!valid.valid ? 'valid_error' : ''"
					v-else-if="fieldData.type === 'textarea' && showTextarea"
					:placeholder="'输入' + fieldData.label"
				></textarea>
				<input
					@click="showRichText = true"
					type="text"
					v-if="(fieldData.type === 'snote' || fieldData.type === 'Note') && !fieldData.disabled"
					:placeholder="'点击编辑' + fieldData.label"
					:value="html2text(fieldData.value)"
					:class="!valid.valid ? 'valid_error' : ''"
					name="input"
					:disabled="true"
				/>
				<picker class="pickers" @change="PickerChange($event, fieldData)" :value="index" :range="picker" v-if="fieldData.type === 'poupchange'">
					<!-- <view class="picker">{{ index > -1 ? picker[index] : '请选择' }}</view> -->
					<input type="text" :placeholder="'点击编辑' + fieldData.label" :value="picker[index]" :class="!valid.valid ? 'valid_error' : ''" name="input" :disabled="true" />
				</picker>
				<!--  <bx-editor
          :field="fieldData"
          v-if="(fieldData.type === 'snote' || fieldData.type === 'Note') && !fieldData.disabled"
          ref="bxEditor"
          @fieldData-value-changed="editorValueChange"
        ></bx-editor> -->
				<view
					class="content padding-0"
					style="padding:0;width: 100%!important;flex-direction: column;position: relative;"
					v-else-if="fieldData.type === 'date' || fieldData.type === 'dateTime' || fieldData.type === 'time' || fieldData.type === 'Date'"
				>
					<input
						@blur="onInputBlur"
						@input="onInputChange"
						v-model="fieldData.value"
						disabled
						class="date-input"
						@click.stop="fieldData.disabled ? false : toggleTab(fieldData.type)"
						:placeholder="'请选择' + fieldData.label"
						:class="!valid.valid ? 'valid_error' : ''"
						style="width: 100%;"
						name="input"
					/>
					<text
						class="input-icon cuIcon-calendar"
						style="position: absolute;top:10upx;right: 20upx;color: #0bc99d;"
						@click.stop="fieldData.disabled ? false : toggleTab(fieldData.type)"
					></text>

					<w-picker mode="date" startYear="1900" endYear="2030" :current="false" @confirm="onConfirm" :disabledAfter="false" ref="date" themeColor="#f00"></w-picker>
					<w-picker mode="date" startYear="1900" endYear="2030" :current="false" @confirm="onConfirm" :disabledAfter="false" ref="Date" themeColor="#f00"></w-picker>
					<w-picker mode="yearMonth" startYear="1900" endYear="2030" :current="false" @confirm="onConfirm" :disabledAfter="false" ref="yearMonth" themeColor="#f00"></w-picker>
					<w-picker mode="dateTime" startYear="1900" endYear="2030" step="1" :current="false" @confirm="onConfirm" ref="dateTime" themeColor="#f00"></w-picker>
					<w-picker mode="time" :current="false" @confirm="onConfirm" ref="time" step="1"></w-picker>
				</view>
				<!-- fieldData.type === 'list' -->
				<view v-else-if="fieldData.type === 'list'">
					<view class="cu-list menu card-menu ">
						<view class="cu-item" v-for="(item, index) in optionsDatasRun" :key="index">
							<view class="content solid">
								<text class="cuIcon-tagfill text-blue  margin-right-xs" :class="{ 'text-green': '' }">{{ index + 1 }}</text>
								<input
									class="input-sm"
									type="text"
									placeholder="请输入"
									v-model="item['model'][fieldData.optionsConfig['key_col']['value']]"
									@input="changeVal(item, optionsDatas[index], index)"
								/>
							</view>
							<view class="buttons">
								<view
									v-if="item.type !== 'draft' && optionsDatasRun[index]['valueChanged']"
									class="cu-btn  bg-green light"
									style="height:2.4em;min-height: 1.6em;line-height: 1.6em;"
									@click="addListOptions(index, 'update')"
								>
									修改
								</view>
								<view v-if="item.type === 'draft'" class="cu-btn  bg-blue light" style="height:2.4em;min-height: 1.6em;line-height: 1.6em;" @click="addListOptions(index, 'add')">
									添加
								</view>
								<view v-if="item.type !== 'draft'" class="cu-btn  bg-orange light" style="height:2.4em;min-height: 1.6em;line-height: 1.6em;" @click="deleteListOptions(index)">
									删除
								</view>
							</view>
						</view>
					</view>
				</view>
				<input
					@blur="onInputBlur"
					type="number"
					:placeholder="'输入' + fieldData.label"
					@input="onInputChange"
					:max="fieldData.item_type_attr && fieldData.item_type_attr.max ? fieldData.item_type_attr.max : 999"
					:min="fieldData.item_type_attr && fieldData.item_type_attr.min ? fieldData.item_type_attr.min : 0"
					v-model="fieldData.value"
					:class="!valid.valid ? 'valid_error' : ''"
					name="input"
					:disabled="fieldData.disabled ? fieldData.disabled : false"
					v-else-if="fieldData.type === 'number'"
				/>
				<input
					@blur="onInputBlur"
					type="digit"
					:placeholder="'输入' + fieldData.label"
					@input="onInputChange"
					:disabled="fieldData.disabled ? fieldData.disabled : false"
					:max="fieldData.item_type_attr && fieldData.item_type_attr.max ? fieldData.item_type_attr.max : 999"
					:min="fieldData.item_type_attr && fieldData.item_type_attr.min ? fieldData.item_type_attr.min : 0"
					v-model="fieldData.value"
					:class="!valid.valid ? 'valid_error' : ''"
					name="input"
					v-else-if="fieldData.type === 'digit' || fieldData.type === 'Float'"
				/>
				<!-- <view v-else-if="fieldData.type === 'treeSelector'"> -->
				<!-- <bxTreeSelector
            ref="bxTreeSelector"
            :isMultiple="false"
            :defaultValue="fieldData.value"
            :options="fieldData.option_list_v2"
            :fieldsModel="fieldsModel"
            @on-tree-change="onTreeSelector"
          ></bxTreeSelector> -->
				<!-- <bxTreeSelector
            :srvInfo="fieldData.option_list_v2"
            :treeData="treeSelectorData"
            :childNodeCol="'_childNode'"
            :disColName="fieldData.option_list_v2['key_disp_col']"
            :nodeKey="'no'"
            @clickParentNode="onTreeGridChange"
            @clickLastNode="onMenu"
          ></bxTreeSelector> -->
				<!-- </view> -->
				<view v-else-if="fieldData.type === 'treeSelector'" @click="openTreeSelector">
					<!-- <input :placeholder="'点击选择' + fieldData.label" v-model="fieldData.value" disabled :class="!valid.valid ? 'valid_error' : ''" name="input"  /> -->
					<!--      <input
            :placeholder="'点击选择' + fieldData.label"
            :value="fieldData.colData[fieldData.option_list_v2.key_disp_col]"
            disabled
            :class="!valid.valid ? 'valid_error' : ''"
            v-if="fieldData.colData && fieldData.value"
            name="input"
          /> -->
					<!--    <input
            :placeholder="'点击选择' + fieldData.label"
            v-if="!fieldData.colData && fieldData.value"
            :value="fieldData.value"
            disabled
            :class="!valid.valid ? 'valid_error' : ''"
            name="input"
          /> -->
					<input :placeholder="'点击选择' + fieldData.label" :value="treeSelectorShowValue" disabled :class="!valid.valid ? 'valid_error' : ''" name="input" />
				</view>
				<view v-else-if="fieldData.type === 'cascader'" @click="openCascader">
					<input :placeholder="'点击选择' + fieldData.label" v-model="fieldData.value" disabled :class="!valid.valid ? 'valid_error' : ''" name="input" />
				</view>
				<view class="item-group flex align-center" style="" v-else-if="fieldData.type === 'input'">
					<input
						@blur="onInputBlur"
						:maxlength="fieldData.item_type_attr && fieldData.item_type_attr.max_len ? fieldData.item_type_attr.max_len : 100"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						:placeholder="'输入' + fieldData.label"
						v-model="fieldData.value"
						@input="onInputChange"
						:class="!valid.valid ? 'valid_error' : ''"
						name="input"
						type="text"
					/>
					<!-- <button
            class="cu-btn bg-green shadow input-button"
            v-if="fieldData.buttons && fieldData.buttons.length > 0"
            :key="index"
            v-for="(btn, index) in fieldData.buttons"
            @click.stop="onButtons(fieldData, btn)"
          >
            {{ btn.name }}
          </button> -->
				</view>

				<!-- 字段按钮组 -->
				<block v-if="fieldData.buttons && fieldData.buttons.length > 0">
					<view class="grid text-center col-4">
						<view class="padding-sm line-blue" @click.stop="onButtons(fieldData, btn)" :key="index" v-for="(btn, index) in fieldData.buttons">
							<text :class="btn.icon"></text>
							{{ btn.name }}
						</view>
					</view>
				</block>
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
		<!--    <uni-popup ref="treePopup" type="bottom" @change="changePopup">
      <bxTreeSelector
        :srvInfo="fieldData.option_list_v2"
        :treeData="treeSelectorData"
        :childNodeCol="'_childNode'"
        :disColName="fieldData.option_list_v2 ? fieldData.option_list_v2['key_disp_col'] : {}"
        :nodeKey="fieldData.option_list_v2 && fieldData.option_list_v2['refed_col'] ? fieldData.option_list_v2['refed_col'] : 'no'"
        @clickParentNode="onTreeGridChange"
        @clickLastNode="onMenu"
      ></bxTreeSelector>
    </uni-popup> -->
		<view class="cu-modal bottom-modal" :class="{ show: showTreeSelector }">
			<view class="cu-dialog tree-selector">
				<bxTreeSelector
					:srvInfo="isArray(fieldData.option_list_v2) ? null : fieldData.option_list_v2"
					:treeData="treeSelectorData"
					:childNodeCol="'_childNode'"
					:disColName="fieldData && fieldData.option_list_v2 && fieldData.option_list_v2['key_disp_col'] ? fieldData.option_list_v2['key_disp_col'] : ''"
					:nodeKey="fieldData.option_list_v2 && fieldData.option_list_v2['refed_col'] ? fieldData.option_list_v2['refed_col'] : 'no'"
					@clickParentNode="onTreeGridChange"
					@clickLastNode="onMenu"
				></bxTreeSelector>
				<view class="dialog-button"><view class="cu-btn bg-blue shadow" @tap="showTreeSelector = false">取消</view></view>
			</view>
		</view>
		<!-- <view class="cu-modal bottom-modal" :class="{ show: showRichText }">
      <view class="cu-dialog  rich-text">
        <bx-editor :field="fieldData" ref="bxEditor" @fieldData-value-changed="editorValueChange"></bx-editor>
        <view class="dialog-button"><view class="cu-btn bg-blue shadow" @tap="showRichText = false">确定</view></view>
      </view>
    </view> -->
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
// import bxTreeSelector from '@/components/bx-tree-selector/bx-tree-selector.vue';
import bxTreeSelector from '@/components/tree-selector/tree-selector.vue';
// import bxEditor from '@/components/ueditor/ueditor.vue';
import attachment from '@/components/file-upload/file-upload.vue';
let _this = null;
export default {
	name: 'bxFormItem',
	components: {
		wPicker,
		robbyImageUpload,
		cascaderSelector,
		uniPopup,
		// bxEditor,
		bxTreeSelector,
		attachment
	},
	props: {
		field: {
			type: Object,
			default() {
				return {};
			}
		},
		procData: {
			type: Object,
			default() {
				return {};
			}
		},
		detailFiledData: {
			type: Object,
			default() {
				return {};
			}
		},
		pageFormType: {
			type: String,
			default: 'form'
		},
		showTextarea: {
			type: Boolean,
			default: true
		},
		fieldsModel: {
			type: Object,
			default() {
				return {};
			}
		},
		service: {
			type: String,
			default() {
				return '';
			}
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
			fieldModelsData: this.fieldsModel,
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
			optionsDatas: [],
			listModel: {},
			listRedundance: [],
			showOptionsList: false,
			treeSelectorData: [],
			showTreeSelector: false,
			showRichText: false,
			attachmentList: [],
			uploadFileUrl: this.$api.upload,
			header: '',
			index: -1,
			picker: ['网络状况较差，请稍后进行选择'],
			modelData: '',
			oriPicker: [],
			treeSelectorShowValue: '' //属性选择器input框中显示的值
		};
	},
	updated() {},
	computed: {
		dictShowValue() {
			let option_list_v2 = this.fieldData.option_list_v2;
			if (option_list_v2 && Array.isArray(option_list_v2) && option_list_v2.length > 0 && this.fieldData.col_type === 'Dict') {
				let val;
				option_list_v2.forEach(item => {
					if (item.value === this.fieldData.value) {
						val = item.label;
					}
				});
				return val;
			}
		},
		showOptionsListRun: function() {
			return this.showOptionsList;
		},
		redundance: function() {
			if (this.fieldData.type === 'list') {
				let colKey = this.fieldData.optionsConfig.conditions;
				let colKeys = colKey.map((item, index) => {
					return item.value;
				});
				return colKeys;
			}
		},
		listChildModel: {
			get: function() {
				let self = this;
				if (self.fieldData.type === 'list') {
					let listItemModel = self.deepClone(self.fieldData.optionsConfig.model);
					let colKey = self.fieldData.optionsConfig.conditions;
					for (let i = 0; i < colKey.length; i++) {
						listItemModel[colKey[i].colName] = self.fieldModelsData[colKey[i].value];
					}
					let req = {
						type: 'draft',
						model: listItemModel
					};
					self.listModel = self.deepClone(req);
					return self.listModel;
				}
			},
			set: function(v) {
				this.listModel = v;
			}
		},
		fieldModelsDataRun() {
			return this.fieldModelsData;
		},
		optionsDatasRun: function() {
			let datas = [];
			if (this.optionsDatas && this.listChildModel) {
				datas = this.deepClone(this.optionsDatas);
				datas.push(this.deepClone(this.listChildModel));
			}

			return datas;
		}
	},
	updated() {},
	mounted() {
		console.log('procDataprocDataprocData', this.procData);
		if (this.fieldData.type === 'poupchange') {
			this.getpoupInfo(this.fieldData.option_list_v2);
		}
		if (this.field.condition && Array.isArray(this.field.condition)) {
			// this.field.condition.forEach()
		}
		if (
			this.service &&
			(this.service == 'srvzhxq_guest_mgmt_yezhu_add' ||
				this.service == 'srvzhxq_guest_mgmt_yezhu_update' ||
				this.service == 'srvzhxq_repairs_add' ||
				this.service == 'srvzhxq_clgl_add' ||
				(this.service === 'srvzhxq_syrk_add' &&
					this.field.condition &&
					Array.isArray(this.field.condition) &&
					this.field.condition.length > 0 &&
					this.field.condition[0].colName === this.field.condition[0].value))
		) {
			this.getShareRoomNum().then(s => {
				let fieldData = this.fieldData;
				if (fieldData.type === 'treeSelector') {
					if (fieldData.colData && fieldData.value) {
						this.treeSelectorShowValue = fieldData.colData[fieldData.option_list_v2.key_disp_col];
					} else if (!fieldData.colData || !fieldData.value) {
						this.treeSelectorShowValue = fieldData.value;
					}
				}
			});
		} else {
			if (this.fieldData.type === 'treeSelector') {
				this.getTreeSelectorData().then(_ => {
					let fieldData = this.fieldData;
					if (fieldData.type === 'treeSelector') {
						if (fieldData.colData && fieldData.value) {
							this.treeSelectorShowValue = fieldData.colData[fieldData.option_list_v2.key_disp_col];
						} else if (!fieldData.colData || !fieldData.value) {
							this.treeSelectorShowValue = fieldData.value;
						}
					}
				});
			}
		}

		console.log('this.fieldData', this.fieldData);
	},
	created() {
		if (this.field.value === null) {
			this.field.value = '';
		}
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
			// this.formData['table_name'] = this.fieldData.srvInfo.tableName;
			this.formData['columns'] = this.fieldData.column;
			if (this.fieldData.value !== '' && this.fieldData.value !== null && this.fieldData.value !== undefined) {
				this.formData['file_no'] = this.fieldData.value;
			}
		}
		if (this.fieldData.type === 'cascader') {
			this.formData['serviceName'] = this.fieldData.srvInfo.serviceName;
			this.formData['app_no'] = this.fieldData.srvInfo.appNo;
		}
		if (this.fieldData.type === 'treeSelector') {
			// this.getTreeSelectorData();
		}
		if (this.fieldData.type === 'list') {
			if (this.fieldData.options && this.fieldData.options.length > 0) {
				this.optionsDatas = this.fieldData.options.map((item, index) => {
					let obj = {
						model: item,
						type: 'update'
					};
					return obj;
				});
			}
		}
		this.getDefVal();
		// console.log(this.fieldData.label + this.pageFormType + this.fieldData.value);
	},

	// onShow() {
	// 	this.fieldData = this.field;
	// 	this.getDefVal()
	// },
	methods: {
		async getpoupInfo(info) {
			let serviceName = info.serviceName;
			let req = { serviceName: serviceName, colNames: ['*'], condition: [] };
			let res = await this.onRequest('select', serviceName, req, info.srv_app);
			if (res.data.state === 'SUCCESS') {
				this.oriPicker = res.data.data;
				let resData = [];
				res.data.data.forEach(item => {
					resData.push(item.name);
				});
				this.picker = resData;
				// this.procBasicConfig = res.data;
				console.log('--------------', res.data.data);
			}
			console.log('获取选择楼房');
		},
		async getChangePoupInfo(info) {
			//
			let serviceName = info.option_list_v2.serviceName;
			let value = '';
			let condition = [];
			let isOk = false;
			if (info.column === 'dybm') {
				// value = info.poupValue
				condition = [
					{
						colName: info.option_list_v2.conditions[0].colName,
						ruleType: 'eq',
						value: info.poupValue
					}
				];
				isOk = true;
			} else if (info.column === 'fwbm' && info.louValue && info.dyValue) {
				condition = [
					{
						colName: 'lybm',
						ruleType: 'eq',
						value: info.louValue
					},
					{
						colName: 'dybm',
						ruleType: 'eq',
						value: info.dyValue
					}
				];
				isOk = true;
			}
			let req = { serviceName: serviceName, colNames: ['*'], condition: condition };
			if (isOk) {
				let res = await this.onRequest('select', serviceName, req, info.srv_app);
				if (res.data.state === 'SUCCESS') {
					this.oriPicker = res.data.data;
					let resData = [];
					res.data.data.forEach(item => {
						resData.push(item.name);
					});
					this.picker = resData;
					this.procBasicConfig = res.data;
					console.log('--------------', res.data.data);
				}
				console.log('获取选择楼房');
			}
		},
		editorValueChange(name, e) {
			this.fieldData.value = e.value;
			e.column = e.info.name;
			console.log(e);
			this.$emit('on-value-change', e);
		},
		PickerChange(e, itemFile) {
			let self = this;
			console.log('change----', e.detail.value);
			this.index = e.detail.value;
			let oriItem = null;
			this.oriPicker.forEach((ori, index) => {
				if (ori.name == this.picker[e.detail.value]) {
					oriItem = ori;
					if (itemFile.column == 'lybm') {
						self.fieldData.value = ori.lybm;
					}
					if (itemFile.column == 'dybm') {
						self.fieldData.value = ori.dybm;
					}
					if (itemFile.column == 'fwbm') {
						self.fieldData.value = ori.fwbm;
					}
					// this.fieldData.value = this.picker[this.index]
				}
			});
			this.$emit('picker-change', oriItem);
		},
		changeVal(newval, oldval, index) {
			// list中input绑定的值改变时触发
			setTimeout(() => {
				if (this.optionsDatasRun[index] && this.optionsDatas[index]) {
					let newValue = this.optionsDatasRun[index]['model'][this.fieldData.optionsConfig['key_col']['value']];
					let oldValue = this.optionsDatas[index]['model'][this.fieldData.optionsConfig['key_col']['value']];
					if (newValue !== oldValue) {
						this.$set(this.optionsDatas[index], 'valueChanged', true);
					} else {
						this.$set(this.optionsDatas[index], 'valueChanged', false);
					}
				}
			}, 0);
		},
		addListOptions(index, type) {
			let self = this;
			let sers = this.fieldData.optionsConfig.addServiceName;
			let app = this.fieldData.optionsConfig.appNo;
			let datas = this.optionsDatasRun[index]['model'];
			// this.optionsDatasRun[index]

			for (let key in this.redundance) {
				datas[this.redundance[key]] = this.fieldModelsDataRun[this.redundance[key]];
			}
			if (this.fieldData.optionsConfig['key_col'].hasOwnProperty('no')) {
				datas[this.fieldData.optionsConfig['key_col'].no] = index + 1;
			}
			let req = [
				{
					serviceName: sers,
					data: [datas]
				}
			];
			if (self.optionsDatasRun[index]['type'] === 'draft' && type === 'add') {
				this.onRequest('add', sers, req, app).then(res => {
					if (res.data.state === 'SUCCESS') {
						self.optionsDatasRun[index]['type'] = 'update';
						self.optionsDatasRun[index]['model'] = res.data.response[0].response.effect_data[0];
						if (!self.optionsDatas[index]) {
							self.optionsDatas.push(self.deepClone(self.optionsDatasRun[index]));
						}
						// self.optionsDatas.push(res.data.data[0])
						console.log('选项添加成功', res.data.response[0].response);
					}
				});
			} else if (type === 'update') {
				// let url = this.getServiceUrl(uni.getStorageSync("activeApp"), srv, optionType)
				// this.$http.post()
				sers = this.fieldData.optionsConfig.updateServiceName;
				console.log('datas', datas);
				let reqData = {
					option_value: datas.option_value
				};
				req = [
					{
						serviceName: sers,
						condition: [{ colName: 'id', ruleType: 'eq', value: datas.id }],
						data: [reqData]
					}
				];
				let url = this.getServiceUrl(app, sers, 'operate');
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						self.optionsDatasRun[index]['type'] = 'update';
						self.optionsDatasRun[index]['model'] = res.data.response[0].response.effect_data[0];
						// if (!self.optionsDatas[index]) {
						//   self.optionsDatas.push(self.deepClone(self.optionsDatasRun[index]));
						// }
						this.$set(this.optionsDatas[index], 'valueChanged', false);
						uni.showToast({
							title: res.data.resultMessage
						});
						// self.optionsDatas.push(res.data.data[0])
						console.log('选项修改成功', res.data.response[0].response);
					}
				});
			}
			console.log('保存', index, self.optionsDatasRun[index]);
		},
		deleteListOptions(index) {
			let self = this;
			let sers = self.fieldData.optionsConfig.deleteServiceName;
			let app = self.fieldData.optionsConfig.appNo;
			let key = self.optionsDatas[index]['model'].id;
			let req = [
				{
					serviceName: sers,
					condition: [
						{
							colName: 'id',
							ruleType: 'eq',
							value: key
						}
					]
				}
			];
			if (self.optionsDatas[index]['type'] !== 'draft') {
				self.onRequest('delete', sers, req, app).then(res => {
					if (res.data.state === 'SUCCESS') {
						self.optionsDatas.splice(index, 1);
						console.log('删除成功', res.data);
					}
				});
			}
		},
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
		onTreeSelector(e) {
			this.fieldData.value = e;
			this.onInputChange();
			console.log('点击了onTreeSelector', this.fieldData, e);
		},
		getFileInfo(e) {
			console.log('文件上传成功', e);
			if (e.response.file_no) {
				this.fieldData.value = e.response.file_no;
			}
		},
		getImageInfo(e) {
			let res = JSON.parse(e.allImages[0]);
			this.fieldData.value = res.file_no;
			console.log('图片返回：', e, e.allImages[0], res, this.fieldData.value);
			if (this.fieldData.value !== '' && this.fieldData.value !== null && this.fieldData.value !== undefined) {
				this.formData['file_no'] = this.fieldData.value;
			}
			this.onInputChange();
			this.getDefVal();
		},
		onButtons(e, b) {
			let item = e;
			let button = b;
			this.$emit('on-form-item', { button, item });
		},
		async getDefVal() {
			let self = this;
			// console.log('file:',this.fieldData,this.field)
			if (this.fieldData.type === 'images' && this.fieldData.value !== '') {
				console.log('file:1', this.fieldData, this.field);
				let fileDatas = await self.getFilePath(this.fieldData.value);
				console.log(fileDatas);
				self.imagesUrl = [];
				if (fileDatas) {
					for (let i = 0; i < fileDatas.length; i++) {
						console.log('file:2', self.$api.getFilePath + fileDatas[i].fileurl);
						self.imagesUrl.push(self.$api.getFilePath + fileDatas[i].fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket'));
					}
				}
				console.log('imagesUrl:===>', this.imagesUrl, fileDatas);
			} else if (this.fieldData.type === 'list' && this.fieldData.value !== '') {
				let listItemModel = this.fieldData.optionsConfig.model;
				let colKey = this.fieldData.optionsConfig.conditions;
				for (let i = 0; i < colKey.length; i++) {
					this.$set(this.listModel, colKey[i].colName, this.fieldModelsData[colKey[i].value]);
					this.listModel[colKey[i].colName] = this.fieldModelsData[colKey[i].value];
				}

				console.log('updated', this.fieldModelsData);
				// this.listModel = listItemModel
				// return this.listModel
			} else {
				Object.keys(this.fieldsModel).forEach(key => {
					if (this.fieldData.column === key && !this.fieldData.value && this.fieldsModel[key]) {
						this.fieldData.value = this.fieldsModel[key];
					}
				});
			}
		},
		radioChange(e) {
			if (this.fieldData.type === 'radioFk' || this.fieldData.type === 'checkboxFk') {
				this.fieldData.value = e.target.value;
				// this.fieldData.defaultValue = e.target.value;
				this.$emit('on-value-change', this.fieldData);
			} else {
				this.fieldData.value = e.target.value;
				this.onInputBlur();
				this.$emit('on-value-change', this.fieldData);
				console.log(e.target.value);
				this.getValid();
			}
			console.log('点击选项', this.fieldData.value, e);
		},
		onInputChange() {
			if (this.fieldData.type === 'number' || this.fieldData.type === 'digit') {
				setTimeout(() => {
					if (this.fieldData.item_type_attr && this.fieldData.item_type_attr.max) {
						console.log(this.fieldData.item_type_attr.max, this.fieldData.value);
						if (Number(this.fieldData.value) > Number(this.fieldData.item_type_attr.max)) {
							this.fieldData.value = Number(this.fieldData.item_type_attr.max);
						}
						if (Number(this.fieldData.value) < Number(this.fieldData.item_type_attr.min)) {
							this.fieldData.value = Number(this.fieldData.item_type_attr.min);
						}
					}
				}, 0);
				// this.fieldData.value = Number(this.fieldData.value);
			}
			console.log('111111111', this.fieldData);
			// this.$emit('on-value-change', this.fieldData);
			this.getValid();
		},
		onInputBlur() {
			this.$emit('on-value-blur', this.fieldData);
		},
		getValid: function() {
			console.log('getValid', this.fieldData, this.field);
			if (this.fieldData.isRequire && this.fieldData.value !== '') {
				if (this.fieldData.hasOwnProperty('_validators') && this.fieldData._validators.hasOwnProperty('isType') && typeof this.fieldData._validators.isType === 'function') {
					this.fieldData.valid = this.fieldData._validators.isType(this.fieldData.value);
					this.valid.valid = true;
				} else {
					this.fieldData.valid = { valid: true, msg: '有效' };
					this.valid.valid = true;
				}
				// this.valid.valid = this.fieldData.valid.valid;
			} else if (this.fieldData.isRequire && this.fieldData.value === '') {
				this.fieldData.valid = { valid: false, msg: this.fieldData.label + '不能为空' };
				this.valid.valid = false;
			} else {
				this.fieldData.valid = { valid: true, msg: '有效' };
				this.valid.valid = true;
			}
			console.log('getValid', this.fieldData);
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
			this.onInputBlur();
			this.$emit('on-form-item', this.fieldData);
		},
		changePopup(e) {
			this.$emit('on-form-item', this.fieldData);
		},
		openCascader() {
			this.defaultLineVal = this.fieldData.value;
			this.$refs.popup.open();
		},
		async getUserRoomPerson(no) {
			const url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
			let req = {
				serviceName: 'srvzhxq_syrk_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'fwbm',
						ruleType: 'eq',
						value: no
					},
					{
						colName: 'status',
						ruleType: 'eq',
						value: '有效'
					}
				]
			};
			const res = await this.$http.post(url, req);
			return res.data.data;
			// console.log("-------------房屋---------",res)
		},
		openTreeSelector() {
			let self = this;
			if (this.field.disabled === true) {
				return;
			}

			if (
				this.service &&
				(this.service == 'srvzhxq_guest_mgmt_yezhu_add' ||
					this.service == 'srvzhxq_guest_mgmt_yezhu_update' ||
					this.service == 'srvzhxq_repairs_add' ||
					this.service == 'srvzhxq_clgl_add' ||
					((this.service === 'srvzhxq_syrk_add' || this.service === 'srvzhxq_syrk_wuye_add') &&
						this.field.condition &&
						Array.isArray(this.field.condition) &&
						this.field.condition.length > 0 &&
						this.field.condition[0].colName === this.field.condition[0].value))
			) {
				if ((this.service === 'srvzhxq_repairs_add' || this.service === 'srvzhxq_clgl_add') && (this.field.column === 'xm' || this.field.column === 'glry')) {
					// let userData = uni.getStorageSync('infoObjArr')
					this.showTreeSelector = true;
					self.getUserRoomPerson(self.fieldsModel.fwbm).then(per => {
						console.log('this.procData.fwbm', per);
						self.treeSelectorData = per;
					});
				} else {
					this.getShareRoomNum(this.service).then(a => {
						this.showTreeSelector = true;
					});
				}
			}
			// else if (this.fieldData.col_type == 'bxzhxq_syrk') {
			//
			// 	this.getUserRoomPerson(this.fieldData.option_list_v2).then(person => {
			// 		this.showTreeSelector = true;
			// 		this.treeSelectorData = [];
			// 		person.forEach(per => {
			// 			this.treeSelectorData.push(per);
			// 		});
			// 	});
			// }
			else {
				self.getTreeSelectorData().then(_ => {
					if (self.fieldData.disabled === false) {
						if (self.treeSelectorData.length > 0) {
							self.showTreeSelector = true;
						} else {
							uni.showToast({
								title: '暂无数据',
								icon: 'none'
							});
						}
					}
				});
			}
		},
		getCascaderValue(val, btnType) {
			console.log(val);
			if (btnType === 'sure') {
				this.$refs.popup.close();
				if (val) {
					val['column'] = this.fieldData.column;
					this.$emit('get-cascader-val', val);
					if (this.fieldData.srvInfo.column) {
						this.fieldData.value = val[this.fieldData.srvInfo.column];
					} else {
						this.fieldData.value = val.path_name;
					}
				} else {
					this.$emit('get-cascader-val');
				}
			}
		},
		onMenu(e) {
			const data = e.item ? e.item : {};
			this.fieldData.value = this.fieldData.option_list_v2 && this.fieldData.option_list_v2['refed_col'] ? data[this.fieldData.option_list_v2['refed_col']] : data.no;
			this.fieldData['colData'] = data;
			// this.$refs.treePopup.close();
			this.showTreeSelector = false;
			this.onInputBlur();
			this.$emit('on-value-change', this.fieldData);
			this.getValid();
			let fieldData = this.fieldData;
			if (fieldData.type === 'treeSelector') {
				if (fieldData.colData && fieldData.value) {
					this.treeSelectorShowValue = fieldData.colData[fieldData.option_list_v2.key_disp_col];
				} else if (!fieldData.colData || !fieldData.value) {
					this.treeSelectorShowValue = fieldData.value;
				}
			}
		},
		onTreeGridChange(e) {
			console.log('onTreeGridChange', e);
		},
		async getShareRoomNum(serv) {
			let user = uni.getStorageSync('basics_info').picp;
			const url = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
			let serviceName = 'srvzhxq_syrk_select';
			if (serv && serv === 'srvzhxq_syrk_wuye_add') {
				let condition = [];
				let url = this.getServiceUrl(uni.getStorageSync('activeApp'), 'srvzhxq_syrk_select', 'select');
				let req = {
					serviceName: 'srvzhxq_syrk_select',
					colNames: ['*'],
					condition: [{ colName: 'is_fuzeren', ruleType: 'in', value: '是' }, { colName: 'openid', ruleType: 'eq', value: uni.getStorageSync('login_user_info').user_no },{colName:'status',ruleType:"eq",value:"有效"}]
				};
				let houseList = await this.$http.post(url, req);
				if (houseList.data.state === 'SUCCESS') {
					houseList = houseList.data.data.map(item => {
						return item.fwbm;
					});
					if (Array.isArray(houseList) && houseList.length > 0) {
						condition = [{ colName: 'fwbm', ruleType: 'in', value: houseList.toString() }];
						serviceName = 'srvzhxq_buiding_house_select';
						let jig = await this.getTreeSelectorData(condition, serviceName);
					} else {
						uni.showToast({
							title: '暂无数据',
							icon: 'none'
						});
					}
				}
			} else {
				let req = {
					serviceName: 'srvzhxq_syrk_select',
					colNames: ['*'],
					condition: [
						{ colName: 'gmsfhm', ruleType: 'eq', value: user },
						{ colName: 'proc_status', ruleType: 'eq', value: '完成' },
						{ colName: 'status', ruleType: 'eq', value: '有效' }
						// { colName: 'is_fuzeren', ruleType: 'eq', value: '是' }
					]
				};

				const res = await this.$http.post(url, req);
				if (res.data.data.length > 0) {
					let arr = [];
					res.data.data.forEach(item => {
						arr.push(item.fwbm);
					});
					let syr = arr.toString();
					let cond = [
						{
							colName: 'fwbm',
							ruleType: 'in',
							value: syr
						}
					];
					if (serv != 'srvzhxq_clgl_add' || serv != 'srvzhxq_repairs_add') {
						serviceName = 'srvzhxq_buiding_house_select';
					} else {
						serviceName = this.fieldData.option_list_v2.serviceName;
						if (this.fieldData.column == 'glry') {
							cond = [
								{
									colName: 'fwbm',
									ruleType: 'eq',
									value: this.fieldsModel.fwbm
								}
							];
						}

						console.log('--============-------', this.fieldsModel);
					}
					let jig = await this.getTreeSelectorData(cond, serviceName);
					console.log('jig=====>>>', jig);
					return jig;
				}
			}
		},

		async getTreeSelectorData(cond, serv) {
			console.log('detailFiledDatadetailFiledData', this.detailFiledData);
			let self = this;
			let req = {
				serviceName: serv ? serv : self.fieldData.option_list_v2 ? self.fieldData.option_list_v2.serviceName : '',
				colNames: ['*']
			};
			let appName = '';
			if (self.fieldData.option_list_v2 && self.fieldData.option_list_v2.srv_app) {
				appName = self.fieldData.option_list_v2.srv_app;
			} else {
				appName = uni.getStorageSync('activeApp');
			}
			console.log('-===-=-==-=-=-=-=-=', self.modelData, this.procData);
			let fieldModelsData = self.deepClone(self.fieldsModel);
			if (!self.procData.id) {
				fieldModelsData = self.deepClone(self.fieldsModel);
			} else {
				fieldModelsData = self.deepClone(self.procData);
			}

			// #ifdef H5
			top.user = uni.getStorageSync('login_user_info');
			// #endif
			if (cond) {
				req.condition = cond;
			} else if (
				self.fieldData.option_list_v2 &&
				self.fieldData.option_list_v2.conditions &&
				Array.isArray(self.fieldData.option_list_v2.conditions) &&
				self.fieldData.option_list_v2.conditions.length > 0
			) {
				let condition = self.deepClone(self.fieldData.option_list_v2.conditions);
				// if (self.fieldData.condition && Array.isArray(self.fieldData.condition)) {
				// 	;
				// 	// condition = condition.concat(self.fieldData.condition)
				// }

				condition = condition.map(item => {
					if (item.value.indexOf('data.') !== -1) {
						let colName = item.value.slice(item.value.indexOf('data.') + 5);
						if (fieldModelsData[colName]) {
							item.value = fieldModelsData[colName];
						}
					} else if (item.value.indexOf('top.user.user_no') !== -1) {
						item.value = uni.getStorageSync('login_user_info').user_no;
					} else if (item.value.indexOf("'") === 0 && item.value.lastIndexOf("'") === item.value.length - 1) {
						item.value = item.value.replace(/\'/gi, '');
					}
					return item;
				});
				if (condition && condition[0]) {
					req.condition = condition;
				} else {
					return;
				}
			}
			if (req.serviceName === 'srvsso_user_select') {
				req.condition = [{ colName: 'dept_no', ruleType: 'like', value: 'bx100sys' }];
				appName = 'sso';
			}
			let res = await self.onRequest('select', req.serviceName, req, appName);
			console.log('0000000000000000000', res, this.service);
			if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
				if (
					self.service &&
					(self.service == 'srvzhxq_syrk_add' ||
						self.service == 'srvzhxq_guest_mgmt_yezhu_add' ||
						self.service == 'srvzhxq_guest_mgmt_yezhu_update' ||
						self.service == 'srvzhxq_clgl_add' ||
						self.service == 'srvzhxq_repairs_add')
				) {
					self.treeSelectorData = [];
					res.data.data.forEach(item => {
						self.treeSelectorData.push(item);
					});
					console.log('self.fieldData', self.fieldData);
					self.treeSelectorData.forEach(item => {
						if (self.fieldData.option_list_v2 && item[self.fieldData.option_list_v2.refed_col] === self.fieldData.value) {
							self.fieldData['colData'] = item;
						} else if (self.fieldData.option_list_v2 && item[self.fieldData.option_list_v2.refed_col] && !self.fieldData.value) {
							let colData = self.deepClone(item);
							let refed_col = self.fieldData.option_list_v2.refed_col;
							if (
								colData[refed_col] &&
								colData['_' + refed_col + '_disp'] &&
								self.fieldData.condition &&
								Array.isArray(self.fieldData.condition) &&
								self.fieldData.condition.length > 0
							) {
								self.fieldData.option_list_v2['key_disp_col'] = '_' + refed_col + '_disp';
								self.fieldData['colData'] = item;
							}
						}
					});
					console.log('self.treeSelectorData', self.treeSelectorData);
				} else {
					let hasParentNo = res.data.data.filter(item => item.parent_no).length;
					if (hasParentNo) {
						self.treeSelectorData = self.treeReform(res.data.data, 'parent_no', 'no', self.fieldData.option_list_v2);
						self.treeSelectorData = self.treeSelectorData.map((item, index) => {
							let a = {
								title: '',
								name: '',
								icon: '',
								seq: '',
								link: '',
								type: 'button',
								_childNode: []
							};
							a = Object.assign(a, item);
							a.title = item.pr_name;
							a.name = item.pr_name;
							a._childNode = item._childNode;
							a.no = item.no;
							a.parent_no = item.parent_no;
							return a;
						});
					} else {
						self.treeSelectorData = res.data.data;
					}
					self.treeSelectorData.forEach(item => {
						if (self.fieldData.option_list_v2 && item[self.fieldData.option_list_v2.refed_col] === self.fieldData.value) {
							self.fieldData['colData'] = item;
						}
					});
				}
			}
		}
	},
	watch: {
		field: {
			handler: function(newValue, oldValue) {
				if (newValue.value === null) {
					newValue.value = '';
				}
				this.fieldData = newValue;
				if (newValue.column == 'fwbm' || newValue.column == 'dybm') {
					// this.getChangePoupInfo(this.fieldData);
				}
			},
			immediate: true,
			deep: true
		},
		fieldData: {
			handler: function(newValue, oldValue) {
				if (newValue.type === 'number' && parseInt(newValue.value).toString() !== 'NaN') {
					newValue.value = parseInt(newValue.value);
				}
				// this.getValid();
				this.getDefVal();
			},
			// immediate:true,
			deep: true
		},
		fieldsModel: {
			handler: function(newValue, oldValue) {
				console.log('fieldsModel--------', newValue);
				// this.modelData = JSON.parse(JSON.stringify(newValue))
				// console.log('this.modelData........', this.modelData);
				//    if(self.fieldData.type === "list"){
				//  let listItemModel =  self.fieldData.optionsConfig.model
				//  let colKey = self.fieldData.optionsConfig.conditions
				//  for(let i = 0;i<colKey.length;i++){
				// 	 listItemModel[colKey[i].colName] = newValue[colKey[i].value]
				//  }
				//  self.listChildModel = listItemModel
				// }
			},
			deep: true
		}
	}
};
</script>

<style lang="less" scoped>
.input-sm {
	height: 2.4em;
	line-height: 2.4em;
	min-height: 2.4em;
}
.content {
	text-align: left;
	// height: 400upx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
}
.form-content {
	width: 100%;
	radio-group {
		width: 100%;
	}
	.radio {
		// display: flex;
		// width: 100%;
		// max-width: 298px;
		// padding: 20rpx 0;
		min-width: 22%;
		// margin-bottom: 10rpx;
		margin-right: 20rpx;
		label {
			line-height: 70rpx;
		}
	}
	& /deep/ .uni-radio-input-checked {
		background-color: red;
	}

	.checkbox {
		width: 100%;
	}
}

/* #ifdef MP-WEIXIN */
.form-content {
	flex: 1;
	font-size: 16px;
	color: #555;
	box-sizing: border-box;
	padding: 5px;
	text-indent: 0;
	background: transparent;
	border: 1rpx solid #e6ebe9;
	resize: none;
	border-radius: 2px;
	outline: none;
	line-height: normal;
	padding: 10rpx;
	&.alo_radio {
		border: none;
	}
	&.valid_error {
		border: 1rpx solid #ff0000;
	}
}
/* #endif */

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
.item_type_attr {
	width: 100%;
}
.cu-list.card-menu {
	padding: 0;
	margin: 0;
	.cu-item {
		display: flex;
		padding: 0;
		margin: 0;
		justify-content: space-between;
		.content {
			flex: 1;
			max-width: 60%;
		}
		.buttons {
			// flex: 1;
			display: flex;
			justify-content: space-between;
			.cu-btn {
				&:first-child {
					margin-right: 10upx;
				}
			}
		}
	}
}
.cu-form-group {
	padding: 10rpx 30rpx;
}
.cu-form-group .title {
	display: flex;
	align-items: flex-end;
	height: auto;
	margin: 20rpx 0 0upx;
	color: #333;
	line-height: 60rpx;
}
.cu-form-group.form-detail {
	display: flex;
	flex-direction: row;
	border-bottom: 1px dashed #efefef;
	min-height: 50px;
	.title {
		flex: 1;
		opacity: 0.5;
	}
	.detail-text {
		flex: 2;
		height: auto;
		margin: 10px 0 0px;
		line-height: 60rpx;
		overflow: scroll;
	}
}
.cu-card.article > .cu-item .title {
	line-height: normal;
}
// uni-checkbox /deep/ .uni-checkbox-input {
//   width: 16px !important;
//   height: 16px !important;
// }
// uni-checkbox-group .checkbox {
//   display: flex;
//   align-items: center;
// }
// uni-radio::before,
// uni-checkbox::before {
//   font-family: 'cuIcon';
//   content: '\E645';
//   position: absolute;
//   color: #ffffff !important;
//   top: 50%;
//   margin-top: -8px;
//   right: 2px;
//   font-size: 14px;
//   line-height: 14px;
//   pointer-events: none;
//   -webkit-transform: scale(1, 1);
//   transform: scale(1, 1);
//   -webkit-transition: all 0.3s ease-in-out 0s;
//   transition: all 0.3s ease-in-out 0s;
//   z-index: 9;
// }
// uni-radio /deep/ .uni-radio-input {
//   margin: 0;
//   width: 16px !important;
//   height: 16px !important;
// }
// .radio /deep/ uni-radio-input-checked {
//   width: 16px !important;
//   height: 16px !important;
//   background-color: white !important;
// }
// .alo_radio /deep/ radio.radio[checked]::after,
// radio.radio .uni-radio-input-checked::after {
//   content: '';
//   background-color: transparent;
//   display: block;
//   position: absolute;
//   width: 8px;
//   height: 8px;
//   z-index: 999;
//   top: 0px;
//   // left: -272px !important;
//   right: 0;
//   bottom: 0;
//   margin: auto;
//   border-radius: 100px;
//   border: 4px solid #ffffff !important;
// }
.cu-dialog.tree-selector,
.cu-dialog.rich-text {
	height: auto;
	padding-top: 50rpx;
	max-height: calc(100vh - 150upx);
	background-color: #fff;
	z-index: 199;
	.dialog-button {
		display: flex;
		justify-content: center;
		height: 100upx;
		align-items: center;
		// padding-right: 50upx;
	}
}
.pickers {
	padding-right: 0;
}

.cu-form-group picker::after {
	display: none !important;
}
.cu-form-group uni-picker::after {
	display: none !important;
}
</style>
