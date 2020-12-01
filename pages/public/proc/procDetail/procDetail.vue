<template>
  <view class="proc-wrap">
    <!-- #ifdef H5 -->
    <cu-custom bgColor="bg-blue" :isBack="true">
      <block slot="backText">返回</block>
      <block slot="content">流程详情</block>
    </cu-custom>
    <!-- #endif -->
    <scroll-view scroll-x class="bg-white nav">
      <view class="flex text-center">
        <view
          class="cu-item flex-sub"
          :class="index == TabCur ? 'current-tab cur' : ''"
          v-for="(item, index) in tabList"
          :key="index"
          @tap="tabSelect"
          :data-id="index"
        >
          {{ item.label }}
        </view>
      </view>
    </scroll-view>
    <view class="detail-view content-box" v-if="TabCur === 0">
      <view class="detail-form"
        ><bxform
          ref="bxDetailForm"
          :pageType="type"
          :BxformType="'detail'"
          :fields="fields"
        ></bxform
      ></view>
    </view>
    <view class="steps-view content-box" v-if="TabCur === 1"
      ><BxSteps
        :infoList="procBasicConfig.proCharData"
        :scroll="scroll"
        @clickSteps="clickSteps"
      ></BxSteps
    ></view>
    <view class="step-list content-box" v-else-if="TabCur === 2">
      <view
        class="step-list-item"
        v-for="(item, index) in procRecord"
        :key="index"
        @click="toRecordDetail(item)"
      >
        <view class="title">
          <text class="label">步骤名称：</text>
          <text class="value">{{ item.step_no_name }}</text>
        </view>
        <view class="status">
          <text class="label">处理结果：</text>
          <text class="value">{{ item.proc_result }}</text>
        </view>
        <view class="detail">
          <view class="detail-item">
            <view class="label" v-if="item.data_status"
              >数据状态：{{ item.data_status }}</view
            >
            <view class="value"></view>
          </view>
          <view class="detail-item">
            <view class="label" v-if="item.create_user"
              >审核人：{{ item.create_user }}</view
            >
            <view class="value"></view>
          </view>
          <view class="detail-item">
            <view class="label" v-if="item.create_user"
              >创建人：{{ item.create_user }}</view
            >
            <view class="value"></view>
          </view>

          <view class="detail-item">
            <view class="label"
              >审核时间：{{ item.modify_time.slice(0, 10) }}</view
            >
            <view class="value"></view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="" style="flex: 1;">
        <view class="">
          <text class="text-gray">{{
            currentStepInfo.state === "已处理" ? "当前状态：" : "当前步骤："
          }}</text>
          <text class="value text-blue">{{
            currentStepInfo.state === "已处理"
              ? currentStepInfo.state
              : currentStepInfo.step_name
          }}</text>
        </view>
        <view class="approve">
          <text class="text-gray">责任人：</text>
          <text class="approve_name">{{
            currentStepInfo._approval_user
              ? currentStepInfo._approval_user
              : currentStepInfo._approval_user_no
          }}</text>
        </view>
      </view>
      <view
        class=""
        v-if="
          procBasicConfig.proHanleData && procBasicConfig.proHanleData.authority
        "
      >
        <text
          class="cu-btn bg-blue margin-right"
          v-if="
            procBasicConfig.proHanleData &&
            procBasicConfig.proHanleData.activeStep !== 0
          "
          @click="showApprovalForm(currentStepInfo, 'approval')"
        >
          <!-- 审批 -->
          {{ currentStepInfo.step_name }}
        </text>
        <text
          class="cu-btn bg-blue margin-right"
          v-if="
            procBasicConfig.proHanleData &&
            procBasicConfig.proHanleData.activeStep === 0
          "
          @click="showApprovalForm(currentStepInfo, 'approval')"
        >
          <!-- 申请 -->
          {{ currentStepInfo.step_name }}
        </text>
      </view>
    </view>
    <uni-popup ref="approvalPopup" type="bottom">
      <view class="form-view" v-if="stepsCfgData.length > 0">
        <view
          class=""
          style="width: 100%;"
          v-for="(item, index) in stepsCfgData"
          :key="index"
        >
          <bxform
            :procData="activityData"
            :ref="'bxFormStep' + index"
            :pageType="item.formType"
            :BxformType="item.formType"
            :fields="item.fields"
          ></bxform>
        </view>
        <bxform
          :procData="activityData"
          v-if="isHandler && activityData"
          ref="approvalForm"
          class="approvalForm"
          :pageType="'detail'"
          :BxformType="'detail'"
          :fields="approvalFormCfg"
        ></bxform>
        <bxform
          v-if="
            procBasicConfig.proHanleData &&
            procBasicConfig.proHanleData.activeStep !== 0 &&
            !isHandler &&
            activityData &&
            detailFiledData
          "
          ref="approvalForm"
          :pageType="'add'"
          class="approvalForm"
          :BxformType="'add'"
          :procData="activityData"
          :fields="approvalFormCfg"
          :detailFiledData="detailFiledData"
        ></bxform>
        <view
          class="button-box"
          v-if="procBasicConfig.proHanleData && !isHandler"
        >
          <text class="cu-btn bg-blue margin-right" @click="approvalForm"
            >提交</text
          >
          <text class="cu-btn bg-green" @click="$refs.approvalPopup.close()"
            >取消</text
          >
        </view>
        <text
          class="cu-btn bg-blue"
          @click="$refs.approvalPopup.close()"
          v-if="isHandler"
          >确定</text
        >
      </view>
    </uni-popup>
    <uni-popup ref="recordPopup" type="bottom">
      <view
        class="form-view"
        v-if="currentRecord.fields && currentRecord.fields.length > 0"
      >
        <bxform
          ref="bxFormRecord "
          pageType="detail"
          BxformType="detail"
          :fields="currentRecord.fields"
        ></bxform>
        <view class="cu-btn bg-blue radius" @click="$refs.recordPopup.close()"
          >确定</view
        >
      </view>
    </uni-popup>
  </view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
import uniPopup from '@/components/uni-popup/uni-popup.vue';
import BxSteps from '@/components/bx-steps/bx-steps.vue';
export default {
  components: { bxform, uniPopup, BxSteps },
  data () {
    return {
      TabCur: 0,
      scrollLeft: 0,
      tabList: [
        {
          label: '基本信息'
        },
        {
          label: '流程步骤'
        },
        {
          label: '流程审批记录'
        }
      ],
      isHandler: false,
      activityData: {},
      proc_instance_no: '',
      detailFiledData: {},
      scroll: 0,
      type: 'add',
      procRecord: [],
      recordFields: [],
      currentRecord: {},
      procBasicConfig: {},
      colsV2Data: {},
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
            conditions: [ { colName: 'dept_no', ruleType: 'eq', value: 'bx100sys' } ],
            key_disp_col: 'user_disp'
          },
          type: 'treeSelector',
          display: true,
          disabled: false,
          isRequire: true,
          isShowExp: [ { colName: 'proc_result', ruleType: 'eq', value: 'turn' } ],
          options: []
        },
        {
          label: '说明',
          column: 'remark',
          value: '',
          type: 'textarea',
          display: true,
          isRequire: false,
          isShowExp: [ { colName: 'proc_result', ruleType: 'eq', value: 'pass' } ],
          options: []
        },
        {
          label: '说明',
          column: 'remark',
          value: '',
          type: 'textarea',
          display: true,
          isRequire: true,
          isShowExp: [ { colName: 'proc_result', ruleType: 'neq', value: 'pass' } ],
          options: []
        }
      ]
    };
  },
  onShareAppMessage (res) {
    return {
      title: '访客流程审批',
      path: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + this.proc_instance_no
    };
  },
  methods: {
    tabSelect (e) {
      this.TabCur = Number(e.currentTarget.dataset.id);
      this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
    },
    toRecordDetail (data) {
      //查看流程审批记录详情
      console.log(data);
      this.currentRecord = data;
      this.$refs.recordPopup.open();
    },
    hideApprovalForm () {
      this.$refs.approvalPopup.close();
    },
    showApprovalForm (data, type) {
      this.stepsCfgData = [];
      if (data.state === '已处理') {
        this.isHandler = true;
      } else {
        this.isHandler = false;
      }
      this.getApprovalForm(data).then(e => {
        if (e) {
          this.stepsCfgData = [];
          if (type && type == 'approval') {
            this.approvalFormCfg.forEach(item => {
              item.value = '';
            });
            let fieldList = this.deepClone(e)
            if (fieldList.length > 0 && fieldList[ 0 ].fields) {
              fieldList.forEach(item => {
                item.fields.forEach(item2 => {
                  item2.value = '';
                  // if(this.activityData[item2.column]){
                  // 	item2.value =this.activityData[item2.column];
                  // }
                });
              });
            }
          }
          this.stepsCfgData = fieldList;
          this.$refs.approvalPopup.open();
        }
      });
    },
    clickSteps (e) {
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
                  field[ 'value' ] = stepData[ key ];
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
    async getBasicCfg (proc_instance_no) {
      console.log('进入===', proc_instance_no);
      // srvprocess_basic_cfg_select 流程初始化数据查询
      let serviceName = this.srvInfo.serviceName;
      this.approvalFormCfg[ 0 ].options = [];

      let req = { serviceName: 'srvprocess_basic_cfg_select', colNames: [ '*' ], condition: [ { colName: 'proc_instance_no', ruleType: 'eq', value: proc_instance_no } ] };
      let res = await this.onRequest('select', 'srvprocess_basic_cfg_select', req, this.srvInfo.app ? this.srvInfo.app : 'zhxq');
      console.log('进入res===', res);
      // console.log("流程-----",res)
      if (res.data.state === 'SUCCESS') {
        this.procBasicConfig = res.data;
        this.activityData = res.data.mainData;
        console.log('进入this.activityData===', this.activityData);
        for (let key in res.data.proHanleData.proc_result) {
          let obj = {
            value: '',
            label: ''
          };
          obj.label = res.data.proHanleData.proc_result[ key ];
          obj.value = key;
          this.approvalFormCfg[ 0 ].options.push(obj);
        }
        // console.log("000000000000000",obj)
        // this.approvalFormCfg[0].options.forEach(procs=>{

        // })
        // this.getCurStepConfig(res.data['proCharData'][res.data['proHanleData']['activeStep']]);
        this.getApprovalForm(res.data[ 'proCharData' ][ res.data[ 'proHanleData' ][ 'activeStep' ] ]); //获取当前步骤的信息
        this.getCurStepConfig(res.data[ 'proCharData' ][ 0 ], 'firstStep'); //获取第一步信息
        this.currentStepInfo = res.data[ 'proCharData' ][ res.data[ 'proHanleData' ][ 'activeStep' ] ];
        this.firstStepInfo = res.data[ 'proCharData' ][ 0 ];
        this.scroll = res.data.proHanleData.activeStep;
      }
    },
    async getApprovalForm (e) {
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
          const item = cfg[ i ];
          if (item.type === 'form') {
            if (item._type_form && e.state !== '已处理') {
              let serviceName = item[ `${item._type_form}_service` ];
              let type = item._type_form;
              let fields = await this.getColV2(serviceName, item._type_form);
              cfg[ i ][ 'fields' ] = fields;
              cfg[ i ][ 'formType' ] = type;
            } else if (item.select_service && e.state === '已处理' && item._type_form) {
              let serviceName = item.select_service;
              let fields = await this.getColV2(serviceName, 'detail');
              cfg[ i ][ 'formType' ] = 'detail';
              let data = await this.getDetail(serviceName, fields);
              console.log('getDetail(serviceName)', data);
              Object.keys(data).forEach(key => {
                fields.forEach((field, index) => {
                  if (field.column === key) {
                    field[ 'value' ] = data[ key ];
                    field[ 'disabled' ] = true;
                    this.$set(fields, index, field);
                    cfg[ i ][ 'fields' ] = fields;
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
    async getProcRecord () {
      //查找流程审批记录
      let req = {
        serviceName: 'srvprocess_record_select',
        colNames: [ '*' ],
        condition: [ { colName: 'proc_instance_no', value: this.proc_instance_no, ruleType: 'eq' } ],
        order: [ { colName: 'id', orderType: 'desc' } ]
      };
      let res = await this.onRequest('select', 'srvprocess_record_select', req, this.srvInfo.app ? this.srvInfo.app : 'zhxq');
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
                  field[ 'value' ] = item[ key ];
                }
              });
            });
            item[ 'fields' ] = recordFields;
            this.$set(this.procRecord, i, item);
          });
        });
      }
    },
    async getDetail (serviceName, fields) {
      uni.showLoading({});
      let col = fields.map(item => item.column);
      let req = {
        serviceName: serviceName,
        condition: [ { colName: 'proc_instance_no', ruleType: 'eq', value: this.proc_instance_no } ],
        colNames: col,
        hisVer: true
      };
      let res = await this.onRequest('select', req.serviceName, req, 'zhxq');
      uni.hideLoading();
      if (res.data.state === 'SUCCESS') {
        console.log('getDetail111', res.data.data);
        if (res.data.data.length > 0) {
          return res.data.data[ 0 ];
        }
      }
    },
    getCurStepConfig (e, type) {
      if (e && e.state !== '未开始') {
        console.log('getCurStepConfig', e);
        if (e.biz_cfg_data && e.biz_cfg_data.length > 0) {
          const biz_cfg = e.biz_cfg_data;
          biz_cfg.map(item => {
            if (item._type_form) {
              this.formInfo.formType = item._type_form;
              this.type = item._type_form;
              this.formInfo.serviceName = item[ `${item._type_form}_service` ];
              this.getColV2(this.formInfo.serviceName, item._type_form).then(fields => {
                if (type === 'firstStep') {
                  this.fields = fields;
                  Object.keys(this.procBasicConfig.mainData).forEach(key => {
                    this.fields.forEach((field, index) => {
                      if (field.column === key) {
                        field[ 'value' ] = this.procBasicConfig.mainData[ key ];
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
                        field[ 'value' ] = this.procBasicConfig.mainData[ key ];
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
    async approvalForm () {
      // 提交审批
      let self = this;
      if (this.procBasicConfig.proHanleData.activeStep === 0) {
        //重新申请
        for (let i = 0; i < this.stepsCfgData.length; i++) {
          let ref = 'bxFormStep' + i;
          let item = this.stepsCfgData[ i ];
          if (item.formType) {
            let serviceName = item[ `${item.formType}_service` ];
            let itemData = self.$refs[ ref ][ 0 ].getFieldModel();
            // if (Object.values(itemData).length===0) {
            // 	itemData = this.activityData;
            // }
            if (itemData === false) {
              return
            }
            let req = [
              {
                serviceName: serviceName,
                // serviceName: 'srvoa_issue_info_update',
                condition: [ { colName: 'proc_instance_no', ruleType: 'eq', value: this.proc_instance_no } ],
                proc_instance_no: this.proc_instance_no,
                data: itemData == undefined ? [ {} ] : [ itemData ]
              }
            ];
            let res = await this.onRequest('apply', serviceName, req, this.srvInfo.app ? this.srvInfo.app : 'zhxq');
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
                success (res) {
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
            let item = this.stepsCfgData[ i ];
            if (item.formType) {
              let serviceName = item[ `${item.formType}_service` ];
              let end_datas = self.$refs[ ref ][ 0 ].getFieldModel();
              console.log('------=========serviceName', serviceName);
              let obj = {
                serviceName: item[ `${item.formType}_service` ],
                data: [ self.$refs[ ref ][ 0 ].getFieldModel() ],
                condition: [
                  {
                    colName: 'id',
                    ruleType: 'in',
                    value: self.procBasicConfig.mainData.id
                  }
                ]
              };
              if (self.$refs[ ref ][ 0 ].getFieldModel()) {
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
        let url = this.getServiceUrl(this.srvInfo.app ? this.srvInfo.app : 'zhxq', 'approval', 'process');
        let res = await self.onRequest('process', 'approval', reqData, this.srvInfo.app ? this.srvInfo.app : 'zhxq');
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
    async getColV2 (serviceName, type) {
      let self = this;
      let colVs = await this.getServiceV2(serviceName, type, type, this.srvInfo.app ? this.srvInfo.app : 'zhxq');
      this.colsV2Data = colVs;
      if (!this.navigationBarTitle) {
        uni.setNavigationBarTitle({
          title: colVs.service_view_name
        })
      }
      // let type = this.type;
      console.log('colsV2Data', colVs);
      let fields = [];
      switch (type) {
        // case 'update':
        //   fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
        //   break;
        case 'update':
          fields = colVs._fieldInfo;
          break;
        case 'add':
          fields = colVs._fieldInfo;
          break;
        case 'detail':
          fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
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
          if (item.column == 'lybm' || item.column == 'dybm' || item.column == 'fwbm') {
            let condition = [];
            // let lybm_no = this.lybm_no
            // let dybm_no = this.dybm_no
            if (item.column == 'lybm') {
              self.lybm_no = item.value;
              condition = [
                {
                  colName: 'lybm',
                  ruleType: 'eq',
                  value: item.value
                }
              ];
            }
            if (item.column == 'dybm') {
              condition = [
                {
                  colName: 'lybm',
                  ruleType: 'eq',
                  value: self.lybm_no
                },
                {
                  colName: 'dybm',
                  ruleType: 'eq',
                  value: item.value
                }
              ];
              self.dybm_no = item.value;
            }
            if (item.column == 'fwbm') {
              condition = [
                {
                  colName: 'lybm',
                  ruleType: 'eq',
                  value: self.lybm_no
                },
                {
                  colName: 'dybm',
                  ruleType: 'eq',
                  value: self.dybm_no
                },
                {
                  colName: 'fwbm',
                  ruleType: 'eq',
                  value: item.value
                }
              ];
            }
            self.getItemLabel(item, condition).then(lab => {
              // if(item.column == 'lybm'){
              item.value = lab.name;
              // }
              console.log('lab----===', lab);
            });
          }
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
    async getItemLabel (dataItem, cond) {
      let serviceName = dataItem.option_list_v2.serviceName;
      let req = {
        condition: cond,
        colNames: [ '*' ],
        serviceName: serviceName
      };
      let res = await this.onRequest('select', serviceName, req, dataItem.option_list_v2.srv_app);
      return res.data.data[ 0 ];
      // console.log("------------",res.data.data[0])
    }
  },

  onLoad (option) {
    console.log('-------------------------', option);
    // this.app = uni.getStorageSync('activeApp')
    if (option.proc_instance_no || option.query) {
      let instanceNo = null;
      if (option.proc_instance_no) {
        instanceNo = option.proc_instance_no;
      } else {
        instanceNo = JSON.parse(decodeURIComponent(option.query)).proc_instance_no;
        this.TabCur = 0;
      }
      console.log('------------instanceNo-------------', instanceNo);
      this.proc_instance_no = instanceNo;
      this.srvInfo.app = uni.getStorageSync('activeApp') ? uni.getStorageSync('activeApp') : 'zhxq';
      console.log('------------instanceNo-------------', this.srvInfo.app);
      this.getBasicCfg(instanceNo);
      this.getProcRecord(instanceNo);
    }
  }
};
</script>

<style scoped lang="scss">
.proc-wrap {
  // padding-bottom: 150upx;
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
  padding-bottom: 150upx;
  min-height: 100vh;
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
  // margin-bottom: 100upx;
}
.approvalForm {
  width: 100%;
}

.approve {
  display: flex;
  .approve_name {
    height: 17px;
    display: flex;
    overflow: hidden;
    width: 150px;
  }
}
</style>
