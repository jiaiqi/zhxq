<template>
  <view class="proc-wrap">
    <!-- #ifdef H5 -->
    <cu-custom bgColor="bg-blue" :isBack="true">
      <block slot="backText">返回</block>
      <block slot="content">流程详情</block>
    </cu-custom>
    <!-- #endif -->
    <scroll-view scroll-x class="bg-white nav ">
      <view class="flex text-center">
        <view class="cu-item flex-sub" :class="index == TabCur ? 'current-tab cur' : ''" v-for="(item, index) in tabList" :key="index" @tap="tabSelect" :data-id="index">
          {{ item.label }}
        </view>
      </view>
    </scroll-view>
    <view class="detail-view content-box" v-if="TabCur === 0">
      <view class="detail-form"><bxform ref="bxDetailForm" :service='service' :pageType="type" :BxformType="type" :fields="fields"></bxform></view>
    </view>
	<view class="share_det_bot">
		<button v-if="detailQuery && detailQuery.type" class="bg-green cu-btn lg bot_btn" :data-service='service' :data-id='proc_instance_no' open-type="share">分享</button>
		<button v-else-if="detailQuery && detailQuery.pageType && detailQuery.pageType == 'update'" class="bg-green cu-btn lg bot_btn" @tap="submitData">提交</button>
	</view>
	
  </view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
import uniPopup from '@/components/uni-popup/uni-popup.vue';
import BxSteps from '@/components/bx-steps/bx-steps.vue';
export default {
  components: { bxform, uniPopup, BxSteps },
  data() {
    return {
      TabCur: 0,
	  oldData:{},
      scrollLeft: 0,
      tabList: [
        {
          label: '基本信息',		  
		  }
      ],
      isHandler: false,
      activityData: {},
      proc_instance_no: '',
      scroll: 0,
      type: 'detail',
      procRecord: [],
      recordFields: [],
      currentRecord: {},
      procBasicConfig: {},
      colsV2Data: {},
	  serviceName:'',
	  service:'srvzhxq_guest_mgmt_fangke_update',
      srvInfo: {
        app: '',
        serviceName: 'srvprocess_basic_cfg_select'
      },
      currentStepInfo: {}, //当前步骤的信息
      stepsCfgData: [], //当前步骤表单数据
      firstStepInfo: {}, //基础信息
      firstStepForm: [],
      formInfo: {
        serviceName: '',
        formType: ''
      },
	  detailQuery:"",
      showProcApproval: false, //是否显示审批表单
      approvalVal: {
        proc_result: '',
        remark: '',
        turn_user_no: '',
        step_no: ''
      },
      fields: [],
      lybm_no: '',
      dybm_no: '',
      currentStepFields: [], //当前步骤的字段
      authority: false, //编辑权限
      approvalFormCfg: [
        {
          label: '意见',
          column: 'proc_result',
          value: '',
          type: 'radioFk',
          display: true,
          isRequire: true,
          isShowExp: [],
          options: [
            // { value: 'pass', label: '同意来访' },
            // { value: 'turn', label: '转派' },
            // { value: 'return_to_start', label: '退回开始' },
            // { value: 'return_to_last', label: '拒绝来访' }
          ]
        },
        {
          label: '转派用户',
          column: 'turn_user_no',
          value: '',
          srvInfo: {
            serviceName: 'srvsso_user_select',
            appNo: 'sso',
            isTree: false,
            column: 'user_no',
            showCol: 'real_name', //要展示的字段
            srv_app: 'sso'
          },
          option_list_v2: {
            refed_col: 'user_no',
            srv_app: 'sso',
            serviceName: 'srvsso_user_select',
            conditions: [{ colName: 'dept_no', ruleType: 'eq', value: 'bx100sys' }],
            key_disp_col: 'user_disp'
          },
          type: 'treeSelector',
          display: true,
          disabled: false,
          isRequire: true,
          isShowExp: [{ colName: 'proc_result', ruleType: 'eq', value: 'turn' }],
          options: []
        },
        {
          label: '说明',
          column: 'remark',
          value: '',
          type: 'textarea',
          display: true,
          isRequire: false,
          isShowExp: [{ colName: 'proc_result', ruleType: 'eq', value: 'pass' }],
          options: []
        },
        {
          label: '说明',
          column: 'remark',
          value: '',
          type: 'textarea',
          display: true,
          isRequire: true,
          isShowExp: [{ colName: 'proc_result', ruleType: 'neq', value: 'pass' }],
          options: []
        }
      ]
    };
  },
  onShareAppMessage(res) {
  	console.log("res=====>>>>>",res)
	let obj = {
		serviceName:res.target.dataset.service,
		id:res.target.dataset.id,
		pageType:"update"
	}
  		return {
  		  title: '邀请来访',
  		  path: '/pages/public/shareApply/shareDetail?query=' + JSON.stringify(obj),
  		  success: function (res) {
  		          console.log('成功', res)
  		        }
  		}
  	//  }
  },
  methods: {
	  async getFKcode(fkcode){
	  		  let req = {
	  			  serviceName:"srvzhxq_guest_mgmt_select",
	  			   colNames: ['*'],
	  			  condition:[{
	  				  colName:"id",
	  				  ruleType:"eq",
	  				  value:fkcode
	  			  }]
	  		  }
	  		  let res = await this.onRequest('select', req.serviceName, req, uni.getStorageSync('activeApp'))
	  		  console.log("------------====",res.data.data)
	  		  if(res.data.data.length>0){
	  			  return res.data.data[0]
	  		  }
	  },
	async submitData(){
		let itemData = this.$refs.bxDetailForm.getFieldModel();
		console.log("itemData",itemData)
		if (!itemData) {
		  return;
		}else{
			// let req = [
			//   {
			//     data: [itemData],
			//     serviceName: this.serviceName
			//   }
			// ];
			itemData['proc_status'] = '完成'
			itemData['fwbm'] = this.oldData['fwbm']
			let req = [{ data: [itemData],serviceName: 'srvzhxq_guest_mgmt_fangke_update', colNames: ['*'], condition: [{ colName: 'id', ruleType: 'eq', value: this.proc_instance_no }] }]
			// let res = await this.onRequest('operate', 'srvzhxq_guest_mgmt_fangke_update', 'zhxq');
			let res = await this.onRequest('operate', 'srvzhxq_guest_mgmt_fangke_update', req,uni.getStorageSync('zhxq'));
			if(res.data.state === 'SUCCESS'){
				console.log("---------------------",res.data.response[0].response.effect_data[0].id)
				let resDataId = res.data.response[0].response.effect_data[0].id
				this.getFKcode(resDataId).then(codes=>{
				// if(!this.detailQuery || !this.detailQuery.type){
					// let resData = res.data.response[0].response;	
									console.log("codes======",codes.qr_code)
						if(codes.qr_code){
							uni.redirectTo({
								url:'/pages/specific/permit/permit?code=' + codes.qr_code + '&rowData=' + encodeURIComponent(JSON.stringify(codes))
							})
						}					
				// }
				// else{
				// 	uni.redirectTo({
				// 		url:'/pages/specific/permit/permit?type=share&code=' + codes.qr_code
				// 	})
				// }
				})
				
			}
			console.log("res-----=========",res)
		}
	  
	},
    tabSelect(e) {
      this.TabCur = Number(e.currentTarget.dataset.id);
      this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
    },
    toRecordDetail(data) {
      //查看流程审批记录详情
      console.log(data);
      this.currentRecord = data;
      this.$refs.recordPopup.open();
    },
    hideApprovalForm() {
      this.$refs.approvalPopup.close();
    },
    showApprovalForm(data, type) {
      this.stepsCfgData = [];
      if (data.state === '已处理') {
        this.isHandler = true;
      } else {
        this.isHandler = false;
      }
      this.getApprovalForm(data).then(e => {
        if (e) {
          console.log('eeeeeeeeeeeeee', e, e.length, e[0].fields);
          this.stepsCfgData = [];
          if (type && type == 'approval') {
            this.approvalFormCfg.forEach(item => {
              item.value = '';
            });
            if (e.length > 0 && e[0].fields) {
              e.forEach(item => {
                item.fields.forEach(item2 => {
                  item2.value = '';
                });
              });
            }
          }
          this.stepsCfgData = e;
          this.$refs.approvalPopup.open();
        }
      });
    },
    clickSteps(e) {
      if (e.data.step_no === this.currentStepInfo.step_no && !this.procBasicConfig.proHanleData.authority) {
        //若 点击的步骤是当前处理步骤并且当前登录用户没有权限操作
        uni.showToast({
          title: '无权处理',
          icon: 'none'
        });
        return;
      } else {
        let approvalFormCfg = this.approvalFormCfg;
        let stepData = e.data;
        let recordData = this.procRecord;
        recordData.forEach(record => {
          if (stepData.step_no === record.step_no) {
            // stepData = Object.assign(record,stepData)
            stepData.remark = record.remark;
            stepData.proc_result = record.proc_result;
            console.log('step,record', stepData);
            Object.keys(stepData).forEach(key => {
              this.approvalFormCfg.forEach((field, index) => {
                if (field.column === key) {
                  field['value'] = stepData[key];
                  this.$set(this.approvalFormCfg, index, field);
                }
              });
            });
          }
        });
        if (e.index !== 0 && e.index <= this.scroll) {
          if (e.data.state !== '已处理') {
            this.showApprovalForm(e.data, 'approval');
          } else {
            this.showApprovalForm(e.data);
          }
        } else if (e.index === 0) {
          this.TabCur = 0;
        }
        console.log('clickSteps', e);
      }
    },
    async getBasicCfg(proc_instance_no) {
      // srvprocess_basic_cfg_select 流程初始化数据查询
      let serviceName = this.srvInfo.serviceName;
	  this.approvalFormCfg[0].options = []
      let req = { serviceName: 'srvprocess_basic_cfg_select', colNames: ['*'], condition: [{ colName: 'proc_instance_no', ruleType: 'eq', value: proc_instance_no }] };
      let res = await this.onRequest('select', 'srvprocess_basic_cfg_select', req, this.srvInfo.app ? this.srvInfo.app : 'oa');
	  // console.log("流程-----",res)
      if (res.data.state === 'SUCCESS') {
        this.procBasicConfig = res.data;
        this.activityData = res.data.mainData;
		for(let key in res.data.proHanleData.proc_result){
			let obj = {
				value:"",
				label:""
			}
			obj.label = res.data.proHanleData.proc_result[key]
			obj.value = key
			this.approvalFormCfg[0].options.push(obj)
		}
		// console.log("000000000000000",obj)
		// this.approvalFormCfg[0].options.forEach(procs=>{
			
		// })
        // this.getCurStepConfig(res.data['proCharData'][res.data['proHanleData']['activeStep']]);
        this.getApprovalForm(res.data['proCharData'][res.data['proHanleData']['activeStep']]); //获取当前步骤的信息
        this.getCurStepConfig(res.data['proCharData'][0], 'firstStep'); //获取第一步信息
        this.currentStepInfo = res.data['proCharData'][res.data['proHanleData']['activeStep']];
        this.firstStepInfo = res.data['proCharData'][0];
        this.scroll = res.data.proHanleData.activeStep;
      }
    },
    async getApprovalForm(e) {
      console.log('getApprovalForm', e);
      let cfg = e.biz_cfg_data; //表单配置
      let cfgData = [
        {
          type: '',
          serviceName: '',
          fields: [],
          formData: {}
        }
      ];
      if (cfg && cfg.length > 0) {
        for (let i = 0; i < cfg.length; i++) {
          const item = cfg[i];
          if (item.type === 'form') {
            if (item._type_form && e.state !== '已处理') {
              let serviceName = item[`${item._type_form}_service`];
              let type = item._type_form;
              let fields = await this.getColV2(serviceName, item._type_form);
              cfg[i]['fields'] = fields;
              cfg[i]['formType'] = type;
            } else if (item.select_service && e.state === '已处理' && item._type_form) {
              let serviceName = item.select_service;
              let fields = await this.getColV2(serviceName, 'detail');
              cfg[i]['formType'] = 'detail';
              let data = await this.getDetail(serviceName, fields);
              console.log('getDetail(serviceName)', data);
              Object.keys(data).forEach(key => {
                fields.forEach((field, index) => {
                  if (field.column === key) {
                    field['value'] = data[key];
                    field['disabled'] = true;
                    this.$set(fields, index, field);
                    cfg[i]['fields'] = fields;
                  }
                });
              });
            }
          }
        }
        return cfg;
      } else {
        return this.approvalFormCfg;
      }
    },
    async getProcRecord() {
      //查找流程审批记录
      let req = {
        serviceName: 'srvprocess_record_select',
        colNames: ['*'],
        condition: [{ colName: 'proc_instance_no', value: this.proc_instance_no, ruleType: 'eq' }],
        order: [{ colName: 'id', orderType: 'desc' }]
      };
      let res = await this.onRequest('select', 'srvprocess_record_select', req, this.srvInfo.app ? this.srvInfo.app : 'oa');
      if (res.data.state === 'SUCCESS') {
        this.procRecord = res.data.data;
        this.getColV2(req.serviceName, 'detail').then(cols => {
          console.log('recordFields', cols);
          this.recordFields = cols;
          this.procRecord.forEach((item, i) => {
            let recordFields = this.deepClone(cols);
            console.log('recordFields121', item);
            Object.keys(item).forEach(key => {
              recordFields.forEach((field, index) => {
                if (field.column === key) {
                  field['value'] = item[key];
                }
              });
            });
            item['fields'] = recordFields;
            this.$set(this.procRecord, i, item);
          });
        });
      }
    },
    async getDetail(serviceName, fields) {
      uni.showLoading({});
      let col = fields.map(item => item.column);
      let req = {
        serviceName: serviceName,
        condition: [{ colName: 'id', ruleType: 'eq', value: this.proc_instance_no }],
        colNames: col,
        hisVer: true
      };
      let res = await this.onRequest('select', req.serviceName, req, 'zhxq');
      uni.hideLoading();
      if (res.data.state === 'SUCCESS') {
        console.log('getDetail111', res.data.data);
        if (res.data.data.length > 0) {
          return res.data.data[0];
        }
      }
    },
    getCurStepConfig(e, type) {
      if (e && e.state !== '未开始') {
        console.log('getCurStepConfig', e);
        if (e.biz_cfg_data && e.biz_cfg_data.length > 0) {
          const biz_cfg = e.biz_cfg_data;
          biz_cfg.map(item => {
            if (item._type_form) {
              this.formInfo.formType = item._type_form;
              this.type = item._type_form;
              this.formInfo.serviceName = item[`${item._type_form}_service`];
              this.getColV2(this.formInfo.serviceName, item._type_form).then(fields => {
                if (type === 'firstStep') {
                  this.fields = fields;
                  Object.keys(this.procBasicConfig.mainData).forEach(key => {
                    this.fields.forEach((field, index) => {
                      if (field.column === key) {
                        field['value'] = this.procBasicConfig.mainData[key];
                        this.$set(this.fields, index, field);
                      }
                    });
                  });
                } else {
                  this.currentStepFields = fields;
                }
              });
            } else if (item.select_service) {
              this.formInfo.formType = 'detail';
              this.type = 'detail';
              this.formInfo.serviceName = item.select_service;
              this.getColV2(this.formInfo.serviceName, this.type).then(fields => {
                if (type === 'firstStep') {
                  this.fields = fields;
                  Object.keys(this.procBasicConfig.mainData).forEach(key => {
                    this.fields.forEach((field, index) => {
                      if (field.column === key) {
                        field['value'] = this.procBasicConfig.mainData[key];
                        this.$set(this.fields, index, field);
                      }
                    });
                  });
                } else {
                  this.currentStepFields = fields;
                }
              });
            }
          });
        }
      }
    },
    async approvalForm() {
      // 提交审批
      let self = this;
      if (this.procBasicConfig.proHanleData.activeStep === 0) {
        //重新申请
        for (let i = 0; i < this.stepsCfgData.length; i++) {
          let ref = 'bxFormStep' + i;
          let item = this.stepsCfgData[i];
          if (item.formType) {
            let serviceName = item[`${item.formType}_service`];
            let itemData = self.$refs[ref][0].getFieldModel();
            if (!itemData) {
              itemData = this.activityData;
            }
            if (!itemData.file_no) {
              itemData.file_no = '';
            }
            if (!itemData.remark) {
              itemData.remark = '';
            }
            let req = [
              {
                serviceName: 'srvoa_issue_info_update',
                condition: [{ colName: 'proc_instance_no', ruleType: 'eq', value: this.proc_instance_no }],
                proc_instance_no: this.proc_instance_no,
                data: [itemData]
              }
            ];
            let res = await this.onRequest('apply', serviceName, req, this.srvInfo.app ? this.srvInfo.app : 'oa');
            if (res.data.state === 'SUCCESS') {
              console.log(res.data, 'res.data');
              uni.showToast({
                title: res.data.resultMessage,
                icon: 'none'
              });
              uni.showModal({
                title: '提示',
                content: res.data.resultMessage,
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    self.hideApprovalForm();
                    self.getBasicCfg(self.proc_instance_no);
                    self.getProcRecord(self.proc_instance_no);
                  }
                }
              });
            } else {
              uni.showToast({
                title: res.data.resultMessage,
                icon: 'none'
              });
            }
            // });
          }
        }
      } else {
        let approval = self.$refs.approvalForm.getFieldModel();
        console.log('approval', approval);
        let child_data_list = [];
        let id = this.procBasicConfig.mainData.id;
        let stepsCfgData = this.stepsCfgData;
        if (approval.proc_result === 'pass') {
          for (let i = 0; i < this.stepsCfgData.length; i++) {
            let ref = 'bxFormStep' + i;
            let item = this.stepsCfgData[i];
            if (item.formType) {
              let serviceName = item[`${item.formType}_service`];
              let obj = {
                serviceName: item[`${item.formType}_service`],
                data: [self.$refs[ref][0].getFieldModel()],
                condition: [
                  {
                    colName: 'id',
                    ruleType: 'in',
                    value: self.procBasicConfig.mainData.id
                  }
                ]
              };
              if (self.$refs[ref][0].getFieldModel()) {
                child_data_list.push(obj);
              }
            }
          }
        }
        console.log(child_data_list, 'child_data_list');
        let reqData = [
          {
            data: [
              {
                child_data_list: child_data_list,
                key: approval.proc_result,
                proc_result: approval.proc_result,
                remark: approval.remark,
                turn_user_no: approval.turn_user_no
              }
            ],
            proc_instance_no: self.proc_instance_no,
            step_no: self.currentStepInfo.step_no
          }
        ];
        let url = this.getServiceUrl(this.srvInfo.app ? this.srvInfo.app : 'oa', 'approval', 'process');
        let res = await self.onRequest('process', 'approval', reqData, this.srvInfo.app ? this.srvInfo.app : 'oa');
        // .then(res => {
        if (res.data.state === 'SUCCESS') {
          console.log(res.data);
          uni.showToast({
            title: res.data.resultMessage,
            icon: 'none'
          });
          this.hideApprovalForm();
          this.getBasicCfg(this.proc_instance_no);
          this.getProcRecord(this.proc_instance_no);
        } else {
          uni.showToast({
            title: res.data.resultMessage,
            icon: 'none'
          });
        }
        // });
        console.log(`reqData`, reqData);
      }
    },
    async getColV2(serviceName, type) {
      let self = this;
      let colVs = await this.getServiceV2(serviceName, type, type, this.srvInfo.app ? this.srvInfo.app : 'oa');
      this.colsV2Data = colVs;
      // let type = this.type;
      console.log('colsV2Data', colVs);
      let fields = [];
      switch (type) {
        // case 'update':
        //   fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
        //   break;
        case 'update':
          fields = colVs._fieldInfo;
		  // this.fields = fields
		  this.getDetail('srvzhxq_guest_mgmt_select',fields).then(a=>{
			  let infoObj = uni.getStorageSync('infoObj')
			  this.oldData = JSON.parse(JSON.stringify(a))
			  fields.forEach(item=>{
				  for(let key in a){
					  if(item.column == key){
						  item.value = a[key]
						  if(key == 'fwbm'){
							  item.value = a['_fwbm_disp']
						  }
						  if(a[key]){
							  item.disabled = false
						  }
					  }
				  }
				  if(!self.detailQuery.type){
					  if(infoObj && infoObj.id){
						  for(let info in infoObj){
							  if((item.column == 'bfrgx' && info == '_yfzgx_disp') 
							  ||(item.column == 'lxdh' && info == 'lxfs')
							  ||(item.column == 'zjhm' && info == 'gmsfhm')
							  ||(item.column == 'xm' && info == 'xm')
							  ){
								  item.value = infoObj[info]
							  }
						  }
					  }	
				  }
				 			  				 				  
			  })
			  this.fields = fields
			  console.log("------srvzhxq_guest_mgmt_select-------",fields)
		  })
		  
          break;
        case 'add':
          fields = colVs._fieldInfo;
          break;
        case 'detail':
          fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
		  this.getDetail(this.serviceName,fields).then(a=>{
		  			  fields.forEach(item=>{
		  				  for(let key in a)
		  				  if(item.column == key){
		  					  item.value = a[key]
		  					  if(a[key]){
		  						  item.disabled = true
		  					  }
		  				  }
		  			  })
		  			  this.fields = fields
		  			  console.log("-------------",a)
		  })
		  // this.fields = fields
          break;
        default:
          break;
      }
      if (this.scroll === 0 && type == 'update') {
        fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
      }
      if (fields && Array.isArray(fields)) {
        fields = fields.filter((item, index) => {
          if (!item.value) {
            item.value = '';
          }
          // if (item.column == 'lybm' || item.column == 'dybm' || item.column == 'fwbm') {
          //   let condition = [];
          //   // let lybm_no = this.lybm_no
          //   // let dybm_no = this.dybm_no
          //   ;
          //   if (item.column == 'lybm') {
          //     self.lybm_no = item.value;
          //     condition = [
          //       {
          //         colName: 'lybm',
          //         ruleType: 'eq',
          //         value: item.value
          //       }
          //     ];
          //   }
          //   if (item.column == 'dybm') {
          //     condition = [
          //       {
          //         colName: 'lybm',
          //         ruleType: 'eq',
          //         value: self.lybm_no
          //       },
          //       {
          //         colName: 'dybm',
          //         ruleType: 'eq',
          //         value: item.value
          //       }
          //     ];
          //     self.dybm_no = item.value;
          //   }
          //   if (item.column == 'fwbm') {
          //     condition = [
          //       {
          //         colName: 'lybm',
          //         ruleType: 'eq',
          //         value: self.lybm_no
          //       },
          //       {
          //         colName: 'dybm',
          //         ruleType: 'eq',
          //         value: self.dybm_no
          //       },
          //       {
          //         colName: 'fwbm',
          //         ruleType: 'eq',
          //         value: item.value
          //       }
          //     ];
          //   }
          //   self.getItemLabel(item, condition).then(lab => {
          //     // if(item.column == 'lybm'){
          //     // item.value = lab.name;
          //     // }
          //     // console.log('lab----===', lab);
          //   });
          // }
          // if (item.type === 'Note') {
          //   item.type = 'textarea';
          // }
          // if (item['in_' + type] === 1) {
          return item;
          // }
        });

        // this.fields = fields;
      }
      console.log('colsV2Datafields', fields);
      return fields;
    },
    async getItemLabel(dataItem, cond) {
      let serviceName = dataItem.option_list_v2.serviceName;
      let req = {
        condition: cond,
        colNames: ['*'],
        serviceName: serviceName
      };
      let res = await this.onRequest('select', serviceName, req, dataItem.option_list_v2.srv_app);
      return res.data.data[0];
      // console.log("------------",res.data.data[0])
    }
  },
	onShow() {
		this.srvInfo.app = 'zhxq';
		if(this.detailQuery && !this.detailQuery.type){
			this.selectInfoFromMember().then(result=>{
				console.log("---selectInfoFromMember------",result)
			})
		}
		this.getColV2(this.serviceName, this.detailQuery.pageType)
		console.log('==============onShow',this.detailQuery)
	},
  onLoad(option) {
	  if(this.detailQuery.serviceName){
		  return
	  }
    console.log("-------------------------",option)
	// this.selectInfoFromMember().then(result=>{
	// 	console.log("---selectInfoFromMember------",result)
	// })
	if (option.proc_instance_no || option.query) {
	  let instanceNo = null;
	  let query = JSON.parse(option.query)
	  this.detailQuery = query
	  if(!this.detailQuery || !this.detailQuery.type){
		   this.type = 'add'
	  }
	  if (query.id) {
	    instanceNo = query.id
	  } else {
	    // instanceNo = JSON.parse(decodeURIComponent(option.query)).proc_instance_no;
	    this.TabCur = 0;
	  }
	this.serviceName = query.serviceName
	  this.proc_instance_no = instanceNo;
	  this.srvInfo.app = uni.getStorageSync('activeApp')?uni.getStorageSync('activeApp'):'zhxq';
	  // this.getColV2(query.serviceName, query.pageType)
	}
    
  }
};
</script>

<style scoped lang="scss">
.proc-wrap {
  padding-bottom: 100upx;
  position: relative;
  .current-tab {
    color: #0bc99d;
  }
  .nav {
    height: 90upx;
  }
  .scroll-fixed {
    top: 90upx;
    z-index: 1024;
    position: fixed;
  }
  .uni-popup {
    z-index: 999;
  }
  /deep/ .uni-scroll-view {
    height: auto;
  }
}
.steps-view {
  // margin-top: 100upx;
  // padding-bottom: 150upx;
}
.flow-view {
  width: 100%;
  // min-height: 80vh;
  margin-top: 10upx;
  background-color: #fff;
  overflow: hidden;
  .scroll-view {
    padding: 30upx 10upx;
  }
  .cu-timeline {
    .cu-item {
      padding: 5px 15px 5px 54px;
      position: relative;
      display: block;
      z-index: 0;
    }
    .head {
      display: flex;
    }
    .name {
      flex: 1;
      font-size: 34upx;
      line-height: 60upx;
      font-weight: 700;
    }
    .state {
      flex: 1;
      font-size: 30upx;
      line-height: 60upx;
    }
  }
}
.step-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  .step-list-item {
    background-color: #fff;
    width: calc(100% - 20upx);
    display: flex;
    flex-direction: column;
    margin: 10upx;
    padding: 20upx;
    border-radius: 10upx;
    .title {
      font-size: 32upx;
      line-height: 50upx;
      font-weight: bold;
    }
    .detail {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .detail-item {
        min-width: 40%;
      }
    }
  }
}
.detail-view {
  margin-top: 10upx;
  // padding-bottom: 150upx;
  // min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
.cu-dialog {
  height: auto;
}
.form-view {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: calc(100vh - 200upx);
  padding: 30upx 0 100upx;
  overflow: scroll;
  .button-box {
    height: 100upx;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20upx 0 40upx;
  }
  .cu-btn {
    max-width: 60%;
    min-height: 60upx;
    margin-top: 50upx;
  }
}
.bottom-bar {
  background-color: #fff;
  z-index: 20;
  width: 100%;
  height: 100upx;
  padding-left: 20upx;
  display: flex;
  // flex-direction: column;
  // justify-content: center;
  align-items: center;
  border-top: 1px solid rgba($color: #999, $alpha: 0.5);
  position: fixed;
  bottom: 0;
  .text-blue {
    font-weight: bold;
    font-size: 32upx;
  }
}
.content-box {
  margin-bottom: 100upx;
}
.approvalForm{
	width: 100%;
}
.share_det_bot{
	
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	.bg-green {
			background-color: #0bc99d;
		}
	.bot_btn{
		width: 85%;
	}
}
</style>
