<template>
	<view class="bx-form-item">
		<view class="cu-form-group itemwrap" v-if="fieldData.display" :class="{ 'form-detail': pageFormType === 'detail' }">
			<view class="title" :class="!valid.valid ? 'valid_error' : ''">
				<text class="text-red text-shadow" v-show="fieldData.isRequire">*</text>
				{{ fieldData.label }}:
				<text v-show="!valid.valid">({{ valid.msg }})</text>
				<text @click="getPostion(fieldData)" class="address-pos" v-if="fieldData.column === 'address'">
					<text class="lg text-blue cuIcon-location"></text>
					<text>获取位置</text>
					<!-- 获取位置{{addressName}} -->
				</text>
			</view>
			<!-- 图片描述 -->
			<block class="img-explain" v-if="fieldData.option_img_explain">
				<view class="option_img_explain" @click="showOption_img = !showOption_img">
					<!-- 					<u-icon name="play-right-fill" color="#666" size="28" v-if="!showOption_img"></u-icon>
					<u-icon name="arrow-down-fill" color="#666" size="28" v-if="showOption_img"></u-icon> -->
					<text class="margin-left-xs">图片描述</text>
				</view>
				<image width="100%" height="300rpx" :src="getOptionImgExplain(fieldData.option_img_explain)" v-if="showOption_img"></image>
			</block>
			<view v-if="pageFormType === 'detail'" class="detail-text">
				<text class=" text-xl" v-if="pageFormType === 'detail' && fieldData.type !== 'images' && fieldData.type !== 'snote' && fieldData.type !== 'Note'">
					{{ dictShowValue ? dictShowValue : treeSelectorShowValue ? treeSelectorShowValue : fieldData.value }}
				</text>
				<view class="" v-html="fieldData.value" v-if="pageFormType === 'detail' && (fieldData.type === 'snote' || fieldData.type === 'Note')"></view>
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
					alo_radio: fieldData.type === 'radio' || fieldData.type === 'radioFk' || fieldData.type === 'checkboxFk' || fieldData.type === 'checkbox' || fieldData.type === 'images',
					valid_error: !valid.valid
				}"
				v-if="pageFormType === 'form' || pageFormType === 'add' || pageFormType === 'update'"
			>
				<!-- <u-radio-group v-model="fieldData.value" @change="radioChange" v-if="fieldData.type === 'radio'" :class="!valid.valid ? 'valid_error' : ''">
					<u-radio color="#0bc99d" :disabled="fieldData.disabled ? fieldData.disabled : false" v-for="(itema, index) in fieldData.options" :name="itema" v-model="fieldData.value">
						{{ itema }}
					</u-radio>
				</u-radio-group> -->

				<radio-group @change="radioChange" v-if="fieldData.type === 'radio'" :class="!valid.valid ? 'valid_error' : ''">
					<radio
						color="#0bc99d"
						:key="index"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						v-for="(itema, index) in fieldData.options"
						class="radio"
						:checked="itema === fieldData.value"
						:value="itema"
						style="transform: scale(0.7);"
					>
						<span style="flex: 1;padding-left: 10rpx;transform: scale(1.2)">{{ itema }}</span>
					</radio>
				</radio-group>
				<!-- <u-radio-group v-model="fieldData.value" @change="radioChange" v-if="fieldData.type === 'radioFk'" :class="!valid.valid ? 'valid_error' : ''">
					<u-radio
						class="radio"
						color="#2979ff"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						v-for="(itema, index) in fieldData.options"
						:name="itema.value"
						v-model="fieldData.value"
					>
						{{ itema.label ? itema.label : itema.value }}
						<u-image width="100%" height="300rpx" v-if="itema.option_img_explain" :src="getOptionImgExplain(itema.option_img_explain)" mode="aspectFit"></u-image>
					</u-radio>
				</u-radio-group> -->
				<bx-radio-group v-model="fieldData.value" v-else-if="fieldData.type === 'radioFk'" :class="!valid.valid ? 'valid_error' : ''">
					<bx-radio
						class="radio"
						color="#2979ff"
						v-for="item in fieldData.options"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						:key="item.id"
						:name="item.value"
						:serial-char="item.serialChar"
					>
						{{ item.label }}
					</bx-radio>
				</bx-radio-group>
				<!-- 			<radio-group @change="radioChange" v-else-if="fieldData.type === 'radioFk'" :class="!valid.valid ? 'valid_error' : ''">
					<radio
						color="#2979ff"
						class="blue radio"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						:checked="!!fieldData.value && itema.value === fieldData.value"
						:value="itema.value"
						v-for="(itema, index) in fieldData.options"
						:class="{ 'has-img': itema.option_img_explain }"
						:key="index"
						style="transform: scale(0.7);"
					>
						<view class="radio-content ">
							<span style="flex: 1;padding-left: 10rpx;transform: scale(1.2);margin-left: 5px;">{{ itema.label }}</span>
							<image width="100%" height="300rpx" v-if="itema.option_img_explain" :src="getOptionImgExplain(itema.option_img_explain)" mode="aspectFit"></image>
						</view>
					</radio>
				</radio-group> -->
				<checkbox-group name="checkbox-group" class="checkbox-group" v-else-if="fieldData.type === 'checkbox'" :class="!valid.valid ? 'valid_error' : ''">
					<label v-for="(item, index) in fieldData.options" :key="index" class="checkbox" @click="radioChange(item)">
						<checkbox color="#2979ff" :value="item" :disabled="fieldData.disabled ? fieldData.disabled : false" :checked="fieldData.value.indexOf(item) !== -1" />
						<text style="flex: 1;" class="text">{{ item }}</text>
					</label>
				</checkbox-group>
				<checkbox-group name="checkbox-group" class="checkbox-group" v-else-if="fieldData.type === 'checkboxFk'" :class="!valid.valid ? 'valid_error' : ''">
					<label v-for="(item, index) in fieldData.options" :key="index" class="checkbox" @click="radioChange(item, index)">
						<checkbox
							color="#2979ff"
							class="blue"
							:disabled="fieldData.disabled ? fieldData.disabled : false"
							:class="isChecked(item.value) ? 'checked' : ''"
							:checked="isChecked(item.value) ? true : false"
							:value="item.value"
						></checkbox>
						<text style="flex: 1;" class="text">{{ item.label }}</text>
					</label>
					<!-- 			<u-checkbox @change="radioChange(item, index)" v-model="item.checked" v-for="(item, index) in fieldData.options" :key="index" :name="item.value">
						{{ item.value }}
					</u-checkbox> -->
				</checkbox-group>
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
					<!-- 	<attachment
						mode="create"
						:canUploadFile="true"
						:uploadFileUrl="uploadFileUrl"
						:heaer="header"
						@add="getFileInfo"
						:srvInfo="formData"
						:showProcess="true"
						:attachmentList.sync="attachmentList"
					></attachment> -->
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
					:placeholder="'输入' + placeholderValue"
				></textarea>
				<input
					@click="showRichText = true"
					type="text"
					v-if="(fieldData.type === 'snote' || fieldData.type === 'Note') && !fieldData.disabled"
					:placeholder="'点击编辑' + placeholderValue"
					:value="html2text(fieldData.value)"
					:class="!valid.valid ? 'valid_error' : ''"
					name="input"
					:disabled="true"
				/>
				<picker class="pickers" @change="PickerChange($event, fieldData)" :value="index" :range="picker" v-if="fieldData.type === 'poupchange'">
					<!-- <view class="picker">{{ index > -1 ? picker[index] : '请选择' }}</view> -->
					<input type="text" :placeholder="'点击编辑' + placeholderValue" :value="picker[index]" :class="!valid.valid ? 'valid_error' : ''" name="input" :disabled="true" />
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
					v-else-if="fieldData.type === 'date' || fieldData.type === 'dateTime' || fieldData.type === 'time' || fieldData.type === 'Time' || fieldData.type === 'Date'"
				>
					<input
						@blur="onInputBlur"
						@input="onInputChange"
						v-model="fieldData.value"
						disabled
						class="date-input"
						@click.stop="fieldData.disabled ? false : toggleTab(fieldData.type)"
						:placeholder="'请选择' + placeholderValue"
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
					<w-picker mode="time" :current="true" :second="false" @confirm="onConfirm" ref="Time" step="1"></w-picker>
				</view>
				<!-- fieldData.type === 'list' 选项列表 -->
				<view v-else-if="fieldData.type === 'list'">
					<view class="cu-list menu card-menu ">
						<view class="cu-item" v-for="(item, index) in optionsDatasRun" :key="index">
							<view class="content solid">
								<text class="cuIcon-tagfill text-blue  margin-right-xs" :class="{ 'text-green': '' }">{{ index + 1 }}</text>
								<input
									class="input-sm"
									type="text"
									disabled
									:placeholder="'点击右侧按钮编辑'"
									v-model="item['model'][fieldData.optionsConfig['key_col']['value']]"
									@input="changeVal(item, optionsDatas[index], index)"
								/>
							</view>
							<view class="buttons">
								<!-- 			<view
									v-if="item.type !== 'draft' && optionsDatasRun[index]['valueChanged']"
									class="cu-btn  bg-green light"
									style="height:2.4em;min-height: 1.6em;line-height: 1.6em;"
									@click="addListOptions(index, 'update')"
								>
									修改
								</view> -->
								<view
									v-if="item.type !== 'draft' && item['model']['option_value']"
									class="cu-btn  bg-blue light"
									style="height:2.4em;min-height: 1.6em;line-height: 1.6em;"
									@click="addListOptions(index, 'update')"
								>
									编辑
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
					:placeholder="'输入' + placeholderValue"
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
					:placeholder="'输入' + placeholderValue"
					@input="onInputChange"
					:disabled="fieldData.disabled ? fieldData.disabled : false"
					:max="fieldData.item_type_attr && fieldData.item_type_attr.max ? fieldData.item_type_attr.max : 999"
					:min="fieldData.item_type_attr && fieldData.item_type_attr.min ? fieldData.item_type_attr.min : 0"
					v-model="fieldData.value"
					:class="!valid.valid ? 'valid_error' : ''"
					name="input"
					v-else-if="fieldData.type === 'digit' || fieldData.type === 'Float'"
				/>
				<view v-else-if="fieldData.type === 'treeSelector'" class="input-view">
					<input
						:placeholder="fieldData.placeholder ? fieldData.placeholder : '点击选择' + placeholderValue"
						:value="treeSelectorShowValue ? treeSelectorShowValue : fieldData.value"
						disabled
						:class="!valid.valid ? 'valid_error' : ''"
						name="input"
						class="input"
						@click="openTreeSelector"
					/>
					<slot></slot>
				</view>
				<view v-else-if="fieldData.type === 'cascader'" @click="openCascader">
					<input :placeholder="'点击选择' + placeholderValue" v-model="fieldData.value" disabled :class="!valid.valid ? 'valid_error' : ''" name="input" />
				</view>
				<view v-else-if="fieldData.type === 'Set'" @click="openSetBox">
					<input :placeholder="'点击选择' + placeholderValue" v-model="fieldData.value" disabled :class="!valid.valid ? 'valid_error' : ''" name="input" />
				</view>
				<view class="item-group flex align-center" style="" v-else-if="fieldData.type === 'input'">
					<input
						@blur="onInputBlur"
						:maxlength="fieldData.item_type_attr && fieldData.item_type_attr.max_len ? fieldData.item_type_attr.max_len : 100"
						:disabled="fieldData.disabled ? fieldData.disabled : false"
						:placeholder="'输入' + placeholderValue"
						v-model="fieldData.value"
						@input="onInputChange"
						:class="!valid.valid ? 'valid_error' : ''"
						name="input"
						type="text"
					/>
				</view>
				<!-- 字段按钮组 -->
				<block v-if="fieldData.buttons && fieldData.buttons.length > 0">
					<view class="grid text-center col-4" style="min-width: 25%;">
						<view
							class="padding-sm "
							:class="btn.color ? 'line-' + btn.color : 'line-blue'"
							@click.stop="onButtons(fieldData, btn)"
							:key="index"
							v-for="(btn, index) in fieldData.buttons"
						>
							<text :class="btn.icon"></text>
							{{ btn.name }}
						</view>
					</view>
				</block>
			</view>
		</view>
		<view class="cu-modal bottom-modal" :class="{ show: showSetBox }">
			<view class="cu-dialog">
				<view class="set-box" v-if="isArray(checkboxList)">
					<bx-checkbox-group checkboxMode="button" v-model="checkedValue">
						<bx-checkbox v-model="item.checked" v-for="(item, index) in checkboxList" :key="item.label" :name="item.value">{{ item.label }}</bx-checkbox>
					</bx-checkbox-group>
					<view class="button-box">
						<button class="cu-btn button" @tap="cancelSaveSetValue">取消</button>
						<button class="cu-btn button" @click="saveSetValue">确定</button>
					</view>
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
		<view class="cu-modal bottom-modal" :class="{ show: showTreeSelector }">
			<view class="cu-dialog">
				<view class="tree-selector">
					<view class="cu-bar search bg-white">
						<view class="search-form round">
							<text class="cuIcon-search"></text>
							<input @input="getTreeSelectorDataWithKey" v-model="treeSearchVal" :adjust-position="false" type="text" confirm-type="search" />
						</view>
					</view>

					<!-- 	<u-search
						:show-action="false"
						action-text="搜索"
						:animation="true"
						:shape="'square'"
						v-model="treeSearchVal"
						@change="getTreeSelectorDataWithKey"
						style="margin: 20rpx;"
					></u-search> -->
					<bxTreeSelector
						:srvInfo="isArray(fieldData.option_list_v2) ? null : fieldData.option_list_v2"
						:treeData="treeSelectorData"
						:childNodeCol="'_childNode'"
						:disColName="fieldData && fieldData.option_list_v2 && fieldData.option_list_v2['key_disp_col'] ? fieldData.option_list_v2['key_disp_col'] : ''"
						:nodeKey="fieldData.option_list_v2 && fieldData.option_list_v2['refed_col'] ? fieldData.option_list_v2['refed_col'] : 'no'"
						@clickParentNode="onTreeGridChange"
						@clickLastNode="onMenu"
					></bxTreeSelector>
					<!-- <u-loadmore @loadmore="loadMoreTreeData" :status="treeDataStatus" :load-text="loadText" /> -->
					<view class="dialog-button"><view class="cu-btn bg-blue shadow" @tap="showTreeSelector = false">取消</view></view>
				</view>
			</view>
		</view>
		<view class="cu-modal bottom-modal" :class="{ show: showRichText }">
			<view class="cu-dialog rich-text">
				<textarea
					class="text-area"
					:maxlength="fieldData.item_type_attr && fieldData.item_type_attr.max_len ? fieldData.item_type_attr.max_len : 100"
					@blur="onInputBlur"
					auto-height
					v-model="fieldData.value"
					@input="onInputChange"
					:disabled="fieldData.disabled ? fieldData.disabled : false"
					:class="!valid.valid ? 'valid_error' : ''"
					:placeholder="'输入' + placeholderValue"
				/>
				<!-- <bx-editor :field="fieldData" ref="bxEditor" @fieldData-value-changed="editorValueChange"></bx-editor> -->
				<view class="dialog-button">
					<view
						class="cu-btn bg-blue shadow"
						@tap="
							showRichText = false;
							getValid();
						"
					>
						确定
					</view>
				</view>
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
import bxTreeSelector from '@/components/tree-selector/tree-selector.vue';
import bxRadio from '@/components/bx-radio/bx-radio.vue';
import bxRadioGroup from '@/components/bx-radio-group/bx-radio-group.vue';
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
		bxRadio,
		bxRadioGroup
		// attachment
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
			showOption_img: false, // 是否显示图片描述
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
			treeDataStatus: 'loadmore',
			loadText: {
				loadmore: '点击加载更多',
				loading: '努力加载中',
				nomore: '数据已经全部加载完成'
			},
			treeSearchVal: '',
			showTreeSelector: false,
			showRichText: false,
			attachmentList: [],
			uploadFileUrl: this.$api.upload,
			header: '',
			index: -1,
			picker: ['网络状况较差，请稍后进行选择'],
			modelData: '',
			oriPicker: [],
			addressName: '',
			treeSelectorShowValue: '', //属性选择器input框中显示的值
			treePageInfo: {
				total: 0,
				rownumber: 20,
				pageNo: 1
			},
			checkedValue: [],
			checkboxList: [],
			showSetBox: false
		};
	},
	updated() {},
	computed: {
		placeholderValue: function() {
			let item = this.deepClone(this.fieldData);
			// item.label.slice(0, 2) == (index + 1).toString()
			let label = '';
			if (item.label && item.itemIndex && item.label.slice(0, 1) == item.itemIndex.toString()) {
				label = item.label.slice(1);
			} else if (item.label && item.itemIndex && item.label.slice(0, 2) == item.itemIndex.toString()) {
				label = item.label.slice(2);
			} else if (item.label) {
				label = item.label;
			}
			if (label.indexOf('.') !== -1 && label.indexOf('.') < 2) {
				label = label.replace('.', '');
			}
			return label;
		},
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
	mounted() {
		let self = this;
		if (this.fieldData.type === 'poupchange') {
			this.getpoupInfo(this.fieldData.option_list_v2);
		}

		if (this.field.condition && Array.isArray(this.field.condition)) {
			// this.field.condition.forEach()
		}
		if (this.fieldData.type === 'treeSelector') {
			this.getTreeSelectorData().then(_ => {
				let fieldData = this.fieldData;
				if (fieldData.type === 'treeSelector') {
					if (fieldData.colData && fieldData.value) {
						this.treeSelectorShowValue = `${fieldData.colData[fieldData.option_list_v2.refed_col]}/${fieldData.colData[fieldData.option_list_v2.key_disp_col]}`;
					} else if (!fieldData.colData || !fieldData.value) {
						this.treeSelectorShowValue = fieldData.value;
					}
					this.$emit('on-value-change', this.fieldData);
				}
			});
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
			this.formData = {
				serviceName: 'srv_bxfile_service',
				interfaceName: 'add',
				app_no: '',
				table_name: '',
				columns: ''
			};
			this.formData['app_no'] = this.fieldData.srvInfo.appNo;
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
		} else if (Array.isArray(this.fieldData.options) && this.fieldData.options.length > 0) {
			this.fieldData.options = this.fieldData.options.map(item => {
				if (this.fieldData.type === 'checkboxFk') {
					if (Array.isArray(this.fieldData.value) && this.fieldData.value.includes(item.value)) {
						item.checked === true;
					} else {
						item.checked === false;
					}
				}
				return item;
			});
		}
		this.getDefVal();
	},
	methods: {
		/*获取位置信息**/
		getPostion(e) {
			this.$emit('seatPostion', e);
		},
		getOptionImgExplain(e) {
			if (e) {
				return this.$api.downloadFile + e + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket');
			}
		},
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
				self.$emit('show-option-list', {
					data: self.optionsDatasRun[index],
					config: self.fieldData.optionsConfig
				});
				return;
				this.onRequest('add', sers, req, app).then(res => {
					if (res.data.state === 'SUCCESS') {
						self.optionsDatasRun[index]['type'] = 'update';
						self.optionsDatasRun[index]['model'] = res.data.response[0].response.effect_data[0];
						if (!self.optionsDatas[index]) {
							self.optionsDatas.push(self.deepClone(self.optionsDatasRun[index]));
						}
						console.log('选项添加成功', res.data.response[0].response);
					}
				});
			} else if (type === 'update') {
				// 编辑选项
				self.$emit('show-option-list', {
					data: self.optionsDatasRun[index],
					config: self.fieldData.optionsConfig
				});
				return;
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
		cancelSaveSetValue() {
			this.checkboxList = this.checkboxList.map(item => {
				if (this.fieldData.value && this.fieldData.value.indexOf(item.value) !== -1) {
					item.checked = true;
				} else {
					item.checked = false;
				}
				return item;
			});
			this.checkedValue = this.deepClone(this.checkboxList)
				.filter(item => item.checked)
				.map(item => item.value);
			this.showSetBox = false;
		},
		saveSetValue() {
			setTimeout(() => {
				let values = this.deepClone(this.checkboxList)
					.filter(item => item.checked)
					.map(item => item.value);
				this.checkedValue = values;
				let str = '';
				if (Array.isArray(values) && values.length > 0) {
					str = values.toString();
				}
				if (str !== this.fieldData.value) {
					this.fieldData.value = str;
				}
				this.onInputBlur();
				this.$emit('on-value-change', this.fieldData);
				this.getValid();
				this.showSetBox = false;
			}, 60);
		},
		deleteImage(e) {
			console.log(e);
			this.fieldData.value = '';
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
				// 选项列表
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
				// if ((this.fieldData.value === null || this.fieldData.value === undefined) && this.fieldData.col_type === 'Enum' && this.fieldData.defaultValue) {
				// 	this.fieldData.value = this.fieldData.defaultValue;
				// }
				Object.keys(this.fieldsModel).forEach(key => {
					if (this.fieldData.column === key && !this.fieldData.value && this.fieldsModel[key]) {
						this.fieldData.value = this.fieldsModel[key];
					}
				});
			}
		},
		radioChange(e, index) {
			if (this.fieldData.disabled) {
				return;
			}
			if (this.fieldData.type === 'radioFk') {
				this.fieldData.value = e.target.value;
				// this.fieldData.defaultValue = e.target.value;
				this.$emit('on-value-change', this.fieldData);
			} else {
				if (this.fieldData.type === 'checkboxFk') {
					let arr = this.fieldData.value;
					if (Array.isArray(arr) && arr.indexOf(e.value) === -1) {
						arr.push(e.value);
					} else if (Array.isArray(arr)) {
						arr.splice(arr.indexOf(e.value), 1);
					} else {
						arr = [e.value];
					}
					this.fieldData.value = arr;
				} else if (this.fieldData.type === 'checkbox') {
					if (Array.isArray(this.fieldData.value)) {
						let arr = this.deepClone(this.fieldData.value);
						if (Array.isArray(arr) && arr.indexOf(e) === -1) {
							arr.push(e);
						} else if (Array.isArray(arr)) {
							arr.splice(arr.indexOf(e), 1);
						} else {
							arr = [e];
						}
						this.fieldData.value = arr;
					}
				}
				this.onInputBlur();
				this.$emit('on-value-change', this.fieldData);
				this.getValid();
			}
		},
		onInputChange(e) {
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
			}
			this.getValid();
		},
		onInputBlur() {
			this.$emit('on-value-blur', this.fieldData);
		},
		getValid: function() {
			console.log('getValid', this.fieldData, this.field);
			if (this.fieldData.isRequire && this.fieldData.value) {
				if (this.fieldData.hasOwnProperty('_validators') && this.fieldData._validators.hasOwnProperty('isType') && typeof this.fieldData._validators.isType === 'function') {
					this.fieldData.valid = this.fieldData._validators.isType(this.fieldData.value);
					this.valid.valid = true;
				} else {
					this.fieldData.valid = { valid: true, msg: '有效' };
					this.valid.valid = true;
				}
				// this.valid.valid = this.fieldData.valid.valid;
			} else if (this.fieldData.isRequire && (this.fieldData.value === '' || this.fieldData.value === null || this.fieldData.value === undefined)) {
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
			// str = str.toLowerCase()
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
			this.$emit('on-value-change', this.fieldData);
		},
		changePopup(e) {
			this.$emit('on-form-item', this.fieldData);
		},
		openCascader() {
			this.defaultLineVal = this.fieldData.value;
			this.$refs.popup.open();
		},
		openSetBox() {
			let self = this;
			if (self.fieldData.type === 'Set') {
				if (Array.isArray(self.fieldData.option_list_v2) && self.fieldData.option_list_v2.length > 0) {
					self.checkboxList = self.fieldData.option_list_v2.map(item => {
						if (item && (!item.hasOwnProperty('checked') || !item.checked)) {
							item.checked = false;
						}
						if (self.fieldData.value && self.fieldData.value.indexOf(item.value) !== -1) {
							item.checked = true;
						}
						return item;
					});
				}
			}
			this.showSetBox = true;
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
			self.getTreeSelectorData().then(_ => {
				if (self.fieldData.disabled !== true) {
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
			this.$emit('on-selector-change', this.fieldData);
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
		getTreeSelectorDataWithKey() {
			if (this.treeSearchVal) {
				let option = this.fieldData.option_list_v2;
				let relation_condition = {
					relation: 'OR',
					data: []
				};
				if (!option.key_disp_col && !option.refed_col) {
					return;
				}
				if (option.key_disp_col) {
					relation_condition.data.push({
						relation: 'AND',
						data: [
							{
								colName: option.key_disp_col,
								value: this.treeSearchVal,
								ruleType: '[like]'
							}
						]
					});
				}
				if (option.refed_col) {
					relation_condition.data.push({
						relation: 'AND',
						data: [
							{
								colName: option.refed_col,
								value: this.treeSearchVal,
								ruleType: '[like]'
							}
						]
					});
				}
				this.getTreeSelectorData(null, null, relation_condition);
			}
		},
		isChecked(e) {
			if (Array.isArray(this.fieldData.value) && this.fieldData.value.includes(e)) {
				return true;
			} else {
				return false;
			}
		},
		loadMoreTreeData() {
			if (this.treePageInfo.total > this.treePageInfo.pageNo * this.treePageInfo.rownumber) {
				this.treeDataStatus = 'loading';
				this.treePageInfo.pageNo++;
				this.getTreeSelectorData();
			} else {
				this.treeDataStatus = 'nomore';
			}
		},
		async getTreeSelectorData(cond, serv, relation_condition) {
			let self = this;
			let req = {
				serviceName: serv ? serv : self.fieldData.option_list_v2 ? self.fieldData.option_list_v2.serviceName : '',
				colNames: ['*'],
				page: { pageNo: this.treePageInfo.pageNo, rownumber: this.treePageInfo.rownumber }
			};
			let appName = '';
			if (self.fieldData.option_list_v2 && self.fieldData.option_list_v2.srv_app) {
				appName = self.fieldData.option_list_v2.srv_app;
			} else {
				appName = uni.getStorageSync('activeApp');
			}
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
					if (item.value_exp) {
						delete item.value_exp;
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
			if (relation_condition && typeof relation_condition === 'object') {
				req.relation_condition = relation_condition;
				delete req.condition;
			}
			let res = await self.onRequest('select', req.serviceName, req, appName);
			if (res.data.state === 'SUCCESS' && res.data.page && res.data.page.total > res.data.page.rownumber * res.data.page.pageNo) {
				this.treeDataStatus = 'loadmore';
			} else {
				this.treeDataStatus = 'nomore';
			}
			if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
				if (res.data.page) {
					this.treePageInfo = res.data.page;
				}
				let hasParentNo = res.data.data.filter(item => item.parent_no).length;
				if (hasParentNo) {
					self.treeSelectorData = self.treeReform(res.data.data, 'parent_no', 'no', self.fieldData.option_list_v2);
					if (res.data.page && res.data.page.pageNo > 1) {
						let data = self.treeReform(res.data.data, 'parent_no', 'no', self.fieldData.option_list_v2);
						self.treeSelectorData = [...self.treeSelectorData, ...data];
					}
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
					if (res.data.page && res.data.page.pageNo > 1) {
						let data = res.data.data;
						self.treeSelectorData = [...self.treeSelectorData, ...data];
					} else {
						self.treeSelectorData = res.data.data;
					}
				}
				self.treeSelectorData.forEach(item => {
					if (self.fieldData.option_list_v2 && item[self.fieldData.option_list_v2.refed_col] === self.fieldData.value) {
						self.fieldData['colData'] = item;
					}
				});
			} else if (req.serviceName === 'srvsys_service_columnex_v2_select' && res.data && res.data.data && Array.isArray(res.data.data.srv_cols)) {
				self.treeSelectorData = res.data.data.srv_cols;
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
.bx-form-item {
	width: 100%;
}
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
.cu-modal {
	z-index: 9999;
}
.checkbox-group {
	display: flex;
	flex-wrap: wrap;
	.checkbox {
		padding: 10rpx 0;
		min-width: 30%;
		padding-right: 50rpx;
		&.wrap-row {
			width: 100%;
		}
		.text {
			margin-left: 20rpx;
		}
	}
}
.form-content {
	width: 100%;
	radio-group {
		width: 100%;
	}
	.radio {
		min-width: calc(33% - 40rpx);
		margin-right: 20rpx;
		max-width: 700rpx;
		&.has-img {
			width: 100%;
			::v-deep .uni-radio-wrapper {
				display: flex;
				width: 100%;
				align-items: flex-start;
			}
			.radio-content {
				flex: 1;
			}
		}
		.radio-content {
		}
		label {
			line-height: 70rpx;
		}
		.radio-content {
			display: flex;
			flex-direction: column;
		}
	}
	& /deep/ .uni-radio-input-checked {
		background-color: red;
	}
}
.input-view {
	display: flex;
	.input {
		flex: 1;
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
.option_img_explain {
	margin: 10rpx 0 5rpx;
	color: #666;
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
	.u-image {
		margin-bottom: 10rpx;
	}
}
.cu-form-group .title {
	display: flex;
	align-items: flex-end;
	width: 100%;
	height: auto;
	margin: 20rpx 0 0upx;
	color: #333;
	line-height: 60rpx;
	&.valid_error {
		color: #ff0000;
	}
}
.address-pos {
	flex: 1;
	text-align: right;
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
.text-area {
	width: calc(100% - 40rpx);
	margin: 0 auto;
	border: 1rpx solid #f1f1f1;
	text-align: left;
	text-indent: 40rpx;
	min-height: 100rpx;
}
.tree-selector,
.rich-text {
	height: auto;
	padding-top: 50rpx;
	background-color: #fff;
	z-index: 199;
	.dialog-button {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx 0;
		margin-top: 50rpx;
	}
}
.set-box {
	padding: 20rpx 0;
}
.button-box {
	padding: 40rpx 20rpx;
	display: flex;
	justify-content: center;
	.button {
		max-width: 40%;
		flex: 1;
		margin-right: 40rpx;
		background-color: #11c5bd;
		color: #fff;
		&:nth-child(2n) {
			margin-right: 0;
		}
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

.uni-popup {
	z-index: 10000;
}
/* #ifdef MP-WEIXIN */
.cu-form-group {
	/deep/ .uni-radio-input-checked::after {
		left: -127rpx;
		z-index: -1 !important;
	}
}
/* #endif */
</style>
