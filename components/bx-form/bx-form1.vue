<template>
	<view class="bg-white" style="width:100%;" v-if="allField.length > 0">
		<view v-for="(item, index) in allField" :key="index">
			<formItem
				:procData="procData"
				:field="item"
				:pageFormType="BxformType"
				:showTextarea="showTextarea"
				:fieldsModel="fieldModel"
				:service="service"
				:detailFiledData="detailFiledData"
				ref="fitem"
				@on-form-item="onItemButtons($event)"
				@on-value-change="onValChange($event)"
				@on-value-blur="onValBlur($event)"
				@get-cascader-val="getCascaderVal"
				@picker-change="pickerchange"
			></formItem>
		</view>
	</view>
</template>

<script>
import formItem from '@/components/bx-form/bx-form-item.vue';
import evaluatorTo from '@/common/evaluator.js';
export default {
	name: 'bx-form',
	components: { formItem },
	props: {
		fields: {
			type: Array,
			default() {
				return [];
			}
		},
		procData: {
			type: Object,
			default() {
				return {};
			}
		},
		defaultCondition: {
			type: Array,
			default() {
				return [];
			}
		},
		pageType: {
			type: String,
			default() {
				return '';
			}
		},
		BxformType: {
			type: String,
			default() {
				return 'form';
			}
		},
		service: {
			type: String,
			default() {
				return '';
			}
		},
		showTextarea: {
			type: Boolean,
			default: true
		},
		moreConfig: {
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
			fieldModel: {},
			fieldData: {},
			oldField: [],
			oldFieldModel: {},
			specialCol: [],
			more_config: {
				col_relation: [
					{
						watch_col: ['page_end', 'page_start'], //相关字段
						dest_col: 'page', //页数
						value: {
							type: 'calc', //col  || calc 计算或者某字段对应值
							value: {
								type: 'sub', //减
								value: [
									{
										type: 'col',
										val: 'page_end'
									},
									{
										type: 'col',
										val: 'page_start'
									},
									{
										type: 'value',
										val: '-1'
									}
								]
							}
						}
					}
				],
				service_call_cfg: [
					{
						app: 'salesroom',
						service: 'srvsalesroom_print_price_calc_select',
						watch_col: ['page', 'paper_type', 'duplex_print', 'color'],
						req: {
							condition: [
								{
									colName: 'page_num',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'page'
									}
								},
								{
									colName: 'paper_type',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'paper_type'
									}
								},
								{
									colName: 'duplex_print',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'duplex_print'
									}
								},
								{
									colName: 'color',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'color'
									}
								}
							]
						}
					}
				]
			}
		};
	},
	created() {
		if (this.fields.length > 0) {
			this.oldField = this.deepClone(this.fields);
			this.oldField.forEach((item, index) => {
				this.oldFieldModel[item.column] = item.value;
			});
		}
		this.getAllField();
	},
	mounted() {
		if (this.fields.length > 0) {
			this.oldField = this.deepClone(this.fields);
			this.oldField.forEach((item, index) => {
				this.oldFieldModel[item.column] = item.value;
			});
		}
	},
	methods: {
		pickerchange(oriData) {
			console.log('oriData------', oriData, this.allField);
			let filed = this.allField;
			filed.forEach(item => {
				if (item.column === 'dybm') {
					// item.poupValue = oriData.lybm
					this.$set(item, 'poupValue', oriData.lybm);
				} else if (item.column === 'fwbm') {
					this.$set(item, 'louValue', oriData.lybm);
					this.$set(item, 'dyValue', oriData.dybm);
				}
			});
			console.log(this.allField);
		},
		setRelationColumnValue(allField, colArr, col_relation) {
			const self = this;
			let more_config = self.more_config;
			let returnValue = null;
			switch (col_relation.value.type) {
				case 'calc': //计算
					(() => {
						let valueArr = col_relation.value.value.value.map(relationitem => {
							if (relationitem.type === 'col') {
								const finalArr = colArr.filter(col => col.column === relationitem.val);
								if (finalArr.length > 0) {
									return finalArr[0].value;
								}
							} else if (relationitem.type === 'value') {
								return Number(relationitem.val);
							}
						});
						switch (col_relation.value.value.type) {
							case 'add': //加
								valueArr.forEach(item => {
									returnValue += Number(item);
								});
								break;
							case 'sub': //减
								(() => {
									let result = 0;
									if (Array.isArray(valueArr) && valueArr.length > 0) {
										valueArr.forEach((item, index) => {
											if (index !== 0) {
												result += item;
											}
										});
										returnValue = valueArr[0] - result;
									}
								})();
								// returnValue = valueArr[0] - valueArr[1];
								break;
							case 'multi': //乘
								returnValue = 1;
								valueArr.forEach(item => {
									returnValue *= Number(item);
								});
								break;
							case 'divide': //除
								returnValue = valueArr[0] / valueArr[1];
								break;
						}
					})();
					break;
				case 'col': //字段对应值
					(() => {
						this.allField.forEach(col => {
							if (col.column === col_relation.value.value) {
								returnValue = col.value;
							}
						});
					})();
					break;
			}
			this.allField.forEach((field, index) => {
				if (col_relation.dest_col === field.column) {
					field.value = returnValue;
					this.$set(this.allField, index, field);
				}
			});
		},
		setShowExp() {},
		async setCallbackColumnValue(serviceCall, condition) {
			let url = this.getServiceUrl(serviceCall.app, serviceCall.service, 'select');
			let req = {
				serviceName: serviceCall.service,
				colNames: ['*'],
				condition: condition
			};
			const res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				console.log('setCallbackColumnValue,', res.data.data);
				if (res.data.data.length > 0) {
					const resData = res.data.data[0];
					const colArr = Object.keys(resData);
					this.allField.forEach((field, index) => {
						colArr.forEach(item => {
							if (item === field.column) {
								field.value = resData[item];
								this.$set(this.allField, index, field);
							}
						});
					});
				}
			}
			return;
			let returnValue = '';
			switch (serviceCall.value.type) {
				case 'value':
					returnValue = serviceCall.value.value;
					break;
				case 'calc':
					(() => {
						let valueArr = serviceCall.value.value.value.map(serviceCallitem => {
							if (serviceCallitem.type === 'col') {
								const finalArr = this.allField.filter(col => col.column === serviceCallitem.val);
								if (finalArr.length > 0) {
									return finalArr[0].value;
								}
							} else if (serviceCallitem.type === 'value') {
								return serviceCallitem.val;
							}
						});
						switch (serviceCall.value.value.type) {
							case 'add': //加
								valueArr.forEach(item => {
									returnValue += Number(item);
								});
								break;
							case 'sub': //减
								returnValue = valueArr[0] - valueArr[1];
								break;
							case 'multi': //乘
								returnValue = 1;
								valueArr.forEach(item => {
									returnValue *= Number(item);
								});
								break;
							case 'divide': //除
								returnValue = valueArr[0] / valueArr[1];
								break;
						}
					})();
					break;
				case 'col':
					(() => {
						this.allField.forEach(col => {
							if (col.column === serviceCall.value.value) {
								returnValue = col.value;
							}
						});
					})();
					break;
			}
			this.allField.forEach((item, index) => {
				if (item.column === serviceCall.dest_col) {
					item.value = returnValue;
					this.$set(this.allField, index, item);
				}
			});
		},
		onItemButtons(e) {
			this.$emit('on-form-item', e);
			return e;
		},
		getAllField() {
			let self = this;
			console.log('getAllField', this.fields);
			console.log('111111111111111111111111', this.allField);
			if (this.fields.length > 0) {
				let fields = this.deepClone(this.fields);
				this.oldField = this.deepClone(this.fields);
				this.oldField.forEach((item, index) => {
					this.oldFieldModel[item.column] = item.value;
				});
				this.allField = fields.map((itemData, index) => {
					this.fieldModel[itemData.column] = itemData.value;
					let item = this.fieldModel;
					if (itemData.hasOwnProperty('isShowExp') && item.hasOwnProperty(itemData.column)) {
						itemData['showExp'] = this.evalInTo(itemData, item);
						// itemData['showExp'] = this.colItemShowExps(itemData, item) ;
						itemData['display'] = itemData.isShowExp && itemData.isShowExp.length > 0 ? this.colItemShowExps(itemData, item) : itemData.display === false ? false : true;
					} else {
						itemData['showExp'] = itemData['showExp'] || true;
					}
					if (itemData.formulaShow) {
						itemData['showExp'] = evaluatorTo(item, itemData.formulaShow);
						itemData['display'] = itemData['showExp']
					}
					itemData.valid = {
						column: itemData.column,
						valid: true,
						msg: '不能为空!'
					};
					this.specialCol.forEach(special => {
						if (special.column === itemData.column) {
							special.value ? (this.fieldModel[itemData.column] = special.value) : '';
							special.value ? (itemData['value'] = special.value) : '';
							special.disabled ? (itemData['disabled'] = special.disabled) : '';
							special.display ? (itemData['display'] = special.display) : '';
						}
					});

					if (self.service && (self.service == 'srvzhxq_clgl_add' || self.service == 'srvzhxq_repairs_add') && (itemData.column == 'lybm' || itemData.column == 'dybm')) {
						itemData.display = false;
					}
					if (self.service && self.service == 'srvzhxq_repairs_add' && itemData.column == 'lxdh') {
						itemData.display = false;
					}
					if (self.service && (self.service == 'srvzhxq_guest_mgmt_yezhu_add' || self.service == 'srvzhxq_guest_mgmt_fangke_update') && itemData.column == 'confirm_user') {
						itemData.display = false;
					}
					return itemData;
				});
				this.allField.forEach(fileIf => {});
				console.log('0000000000000000', this.allField);
			}
		},
		onValChange(e) {
			const self = this;
			if (e.type === 'number') {
				this.fieldModel[e.column] = Number(e.value);
			} else {
				this.fieldModel[e.column] = e.value;
			}
			if (e.column === 'fwbm') {
				if (e.condition && Array.isArray(e.condition) && e.condition.length > 0 && e.condition[0].colName === e.condition[0].value) {
					e.condition.forEach(col => {
						this.fieldModel[col.value] = e.colData[col.value];
						self.allField.forEach((field,index)=>{
							if(field.column===col.value){
								field.value = e.colData[col.value]
								// self.$set(self.allField,index,field)
							}
						})
					});
				}
			}
			if (e.column === 'fwbm' && (this.service == 'srvzhxq_guest_mgmt_yezhu_add' || this.service == 'srvzhxq_clgl_add' || this.service == 'srvzhxq_repairs_add')) {
				this.allField.forEach(fileIf => {
					if (fileIf.column === 'bfr' || fileIf.column === 'bfrbm' || fileIf.column === 'dybm' || fileIf.column === 'lybm') {
						let infoArr = uni.getStorageSync('infoObjArr');
						infoArr.forEach(infos => {
							if (e.value == infos.fwbm) {
								if (fileIf.column === 'bfr') {
									fileIf.value = infos.xm;
								} else if (fileIf.column === 'dybm') {
									fileIf.value = infos.dybm;
								} else if (fileIf.column === 'lybm') {
									fileIf.value = infos.lybm;
								} else if (fileIf.column === 'bfrbm') {
									fileIf.value = infos.syrkbm;
								}
								this.fieldModel[fileIf.column] = fileIf.value;
							}
						});
					}
				});
			}
			if (e.column == 'bfrbm') {
				this.fieldModel['person_no'] = e.colData.person_no;
			}
			e.value = this.fieldModel[e.column];
			const fieldModel = JSON.parse(JSON.stringify(this.fieldModel));
			this.allField = this.allField.map((item, index) => {
				item.display = item.isShowExp && item.isShowExp.length > 0 ? this.colItemShowExps(item, this.fieldModel) : item.display === false ? false : true;
				if (item.column === e.column) {
					item.value = e.value;
				}
				return item;
			});
			this.allField.forEach(fileIf => {
				if (fileIf.formulaShow) {
					let isIfShow = evaluatorTo(fieldModel, fileIf.formulaShow);
					fileIf.display = isIfShow;
					if (fileIf.display && (e.column == 'is_huzhu' || e.column == 'fwyt') && fileIf.column === 'yfzgx') {
						fileIf.value = '';
						this.fieldModel[fileIf.column] = '';
					} else if (!fileIf.display && (e.column == 'is_huzhu' || e.column == 'fwyt') && fileIf.column === 'yfzgx') {
						fileIf.value = fileIf.defaultValue;
						this.fieldModel[fileIf.column] = fileIf.defaultValue;
					}
				}
			});
			this.more_config.col_relation.forEach(col_relation => {
				// if (col_relation.watch_col.includes(e.column)) {
				//当前字段是监控字段
				if (col_relation.watch_col.some(item => e.column === item)) {
					//当前改变值的字段存在于watch_col中
					let colArr = this.allField.filter(field => col_relation.watch_col.includes(field.column));
					if (colArr.every(item => item.value)) {
						self.setRelationColumnValue(self.allField, colArr, col_relation);
					}
				}
			});
			// return
			this.more_config.service_call_cfg.forEach(serviceCallCfg => {
				if (serviceCallCfg.watch_col.some(item => e.column === item)) {
					//当前字段是监控字段
					//拿到所有监控字段的数据
					let colArr = this.allField.filter(field => serviceCallCfg.watch_col.includes(field.column));
					//所有监控字段都有值
					if (colArr.every(item => item.value)) {
						if (serviceCallCfg.req.condition) {
							let condition = [];
							serviceCallCfg.req.condition.forEach(cond => {
								if (cond.value.valueType && cond.value.valueType === 'rowData' && cond.value.valueKey) {
									// cond.value = fieldModel[cond.value.valueKey];
									// this.$set(cond,'value', fieldModel[cond.value.valueKey])
									condition.push({ colName: cond.colName, ruleType: 'eq', value: fieldModel[cond.value.valueKey] });
								}
							});
							self.setCallbackColumnValue(serviceCallCfg, condition);
						}
					}
				}
			});
			if (e.column == 'is_benren') {
				let fields = this.allField;
				if (e.value === '他人信息') {
					fields.forEach(item => {
						if (item.column == 'xm' || item.column == 'lxfs' || item.column == 'gmsfhm') {
							if (this.service === 'srvzhxq_syrk_wuye_add') {
								return;
							}
							item.value = '';
						}
					});
				} else if (e.value === '本人信息' && this.defaultCondition.length > 0) {
					this.defaultCondition.forEach(def => {
						fields.forEach(fd => {
							if (def.colName === fd.column) {
								fd.value = def.value;
							}
						});
					});
				}
				this.allField = fields.map((itemData, index) => {
					this.fieldModel[itemData.column] = itemData.value;
					return itemData;
				});
				console.log('本人信息----------', this.fieldModel, this.allField);
				this.$emit('radio-benren-change', e);
			}
			if (e.bx_col_type === 'fk' && e.colData && typeof e.colData === 'object' && Array.isArray(e.colData) !== true && Object.keys(e.colData).length > 0) {
				//冗余
				this.allField.forEach(item => {
					if (item.redundant && typeof item.redundant === 'object' && item.redundant.dependField === e.column) {
						if (item.redundant.trigger === 'always') {
							item.value = e.colData[item.redundant.refedCol];
						} else if (item.redundant.trigger === 'isnull') {
							if (!item.value) {
								item.value = e.colData[item.redundant.refedCol];
							}
						}
						this.fieldModel[item.column] = item.value;
					}
				});
			}
			
			console.log('valueChange', e, this.fieldModel[e.column], this.fieldModel);
		},
		onValBlur(e) {
			console.log('e', e, this.fieldModel, this.fieldModel[e.column]);
			this.fieldModel[e.column] = e.value;
			const self = this;
			this.$emit('value-blur', e);
		},
		getDetailfieldModel() {
			return this.fieldModel;
		},
		getFieldModel() {
			console.log(this.fieldModel,'getFieldModel');
			let valid = 0;
			let showsNum = 0;
			this.allField.map((item, index) => {
				let valids = this.$refs.fitem[index].getValid();
				console.log('字段校验', valids,item);
				if (item.display) {
					showsNum++;
					if (valids.valid) {
						valid++;
					}
				}
			});
			console.log(valid, showsNum);
			if (valid === showsNum) {
				console.log('表单校验通过', showsNum, valid, this.fieldModel);
				let model = {};
				switch (this.pageType) {
					case 'update':
						for (let key in this.fieldModel) {
							if (this.oldFieldModel[key] !== this.fieldModel[key]) {
								model[key] = this.fieldModel[key];
							}
						}
						break;
					case 'add':
						for (let key in this.fieldModel) {
							if (this.fieldModel[key] === '' && key !== 'openid') {
								delete this.fieldModel[key];
							}
						}
						model = this.fieldModel;
						break;
					default:
						model = this.fieldModel;
						break;
				}
				console.log('this.fieldModel', this.fieldModel, model);
				if (Object.keys(model).length > 0) {
					return model;
				} else {
					uni.showToast({
						title: '没有需要提交的数据',
						icon: 'none'
					});
				}
			} else {
				console.log('表单校验失败', showsNum, valid, this.fieldModel);
				uni.showToast({
					title: '请填写完信息后，再尝试提交',
					icon: 'none'
				});
				return false;
			}
		},
		getCascaderVal(val) {
			if (val) {
				this.$emit('get-cascader-val', val);
			} else {
				this.$emit('get-cascader-val');
			}
		},
		onReset() {
			this.allField = this.deepClone(this.oldField);
			console.log(this.oldField, 'this.oldField');
			try {
				return true;
			} catch (e) {
				return false;
				//TODO handle the exception
			}
		}
	},
	watch: {
		fields: {
			handler: function(newval, old) {
				console.log('newval', newval, this.allField);
				this.getAllField();
			},
			deep: true
		},
		moreConfig: {
			handler: function(newval, old) {
				if (newval) {
					this.more_config = this.deepClone(newval);
				}
			},
			deep: true
		},
		fieldModel: {
			deep: true,
			handler(newVal, oldVal) {}
		}
	}
};
</script>

<style lang="less"></style>
