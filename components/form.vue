<template>
	<view class="">
		<!-- <scroll-view scroll-x="false" scroll-y="true"> -->
		<view v-for="(item, index) in allField" :key="index">
			<formItem
				:field="item"
				:pageFormType="BxformType"
				:showTextarea="showTextarea"
				ref="fitem"
				@on-form-item="onItemButtons($event)"
				@on-value-change="onValChange($event)"
				@get-cascader-val="getCascaderVal"
			></formItem>
		</view>
		<!-- </scroll-view> -->
	</view>
</template>

<script>
import formItem from './form-item.vue';
export default {
	components: { formItem },
	props: {
		fields: {
			type: Array,
			default() {
				return [];
			}
		},
		BxformType: {
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
	computed: {
		fieldsData: function() {
			return this.fields;
		}
	},
	data() {
		return {
			allField: this.fields,
			fieldModel: {}
		};
	},
	updated() {
		// this.getAllField()
	},
	created() {
		this.getAllField();
	},
	methods: {
		onItemButtons(e) {
			this.$emit('on-form-item', e);
			return e;
		},
		getAllField() {
			console.log('getAllField', this.fields);
			if (this.fields.length > 0) {
				this.allField = this.fields.map((itemData, index) => {
					this.fieldModel[itemData.column] = itemData.value;
					let item = this.fieldModel;
					if (itemData.hasOwnProperty('isShowExp') && item.hasOwnProperty(itemData.column)) {
						itemData['showExp'] = this.evalInTo(itemData, item);
					} else {
						itemData['showExp'] = true;
					}
					itemData.valid = {
						column: itemData.column,
						valid: true,
						msg: '不能为空!'
					};
					return itemData;
				});
			}
		},
		onValChange(e) {
			console.log('e111', e);
			this.fieldModel[e.column] = e.value;
			this.allField = this.allField.map((item, index) => {
				if (item.column === e.column) {
					item.value = e.value;
				}
				return item;
			});
			this.allField = this.allField.map((items, index) => {
				let item = this.fieldModel;
				items.showExp = items.isShowExp !== '' ? this.evalInTo(items, item) : true;

				return items;
			});
		},
		getFieldModel() {
			let valid = 0;
			let showsNum = 0;
			console.log('this.$refs', this.$refs);

			this.allField.map((item, index) => {
				this.$refs.fitem[index].getValid();
				if (item.showExp) {
					showsNum++;
					if (item.isRequire && item.valid.valid && item.value !== '') {
						valid++;
					} else if (!item.isRequire) {
						valid++;
					}
				}
			});
			if (valid === showsNum) {
				console.log('表单校验通过', showsNum, valid, this.fieldModel);
				return this.fieldModel;
			} else {
				console.log('表单校验失败', showsNum, valid, this.fieldModel);
				return false;
			}
		},
		getCascaderVal(val) {
			if (val) {
				this.$emit('get-cascader-val', val);
			} else {
				this.$emit('get-cascader-val');
			}
		}
	},
	watch: {
		fields: {
			hanlder: function(newval, old) {
				console.log('newval', newval, this.allField);
				this.getAllField();
			}
		}
	}
};
</script>

<style lang="less"></style>
