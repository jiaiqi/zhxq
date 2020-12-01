<template>
  <view class="step-detail-wrap">
    <view class="form-view"><bxform ref="bxForm" :pageType="type" :BxformType="type" :fields="fields"></bxform></view>
    <view class="approval-view" v-if="stepData.state === '正在处理' && fields.length > 0">
      <bxform ref="approvalForm" :pageType="'add'" :BxformType="'add'" :fields="approvalFormCfg"></bxform>
      <view class="buttons"><button type="primary" @click="approval">提交审批</button></view>
    </view>
  </view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
export default {
  components: { bxform },
  data() {
    return {
      id: '',
      stepData: {},
      serviceName: '',
      proc_instance_no: '',
      type: '',
      fields: [],
      procBasicConfig: {},
      activityData: {},
      approvalFormCfg: [
        {
          label: '意见',
          column: 'proc_result',
          value: 'pass',
          type: 'radioFk',
          display: true,
          isRequire: true,
          isShowExp: [],
          options: [
            { value: 'pass', label: '已处理' },
            { value: 'turn', label: '转派' },
            { value: 'return_to_start', label: '退回开始' },
            { value: 'return_to_last', label: '退回' }
          ]
        },
        {
          label: '转派用户',
          column: 'turn_user_no',
          value: '',
          type: 'input',
          display: true,
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
          isRequire: true,
          isShowExp: [],
          options: []
        }
      ],
      formFields: []
    };
  },
  methods: {
    async getBasicCfg(proc_instance_no, step_no) {
      // srvprocess_basic_cfg_select 流程初始化数据查询
      let req = { serviceName: 'srvprocess_basic_cfg_select', colNames: ['*'], condition: [{ colName: 'proc_instance_no', ruleType: 'eq', value: proc_instance_no }] };
      let res = await this.onRequest('select', 'srvprocess_basic_cfg_select', req, 'oa');
      if (res.data.state === 'SUCCESS') {
        this.procBasicConfig = res.data;
        // this.activityData = res.data.mainData;
        if (res.data['proCharData'] && res.data['proCharData'].length > 0) {
          res.data['proCharData'].map(item => {
            if (item.step_no === step_no) {
              this.stepData = item;
              this.getCurStepConfig(item);
            }
          });
        }
      }
    },
    getCurStepConfig(e, type) {
      const self = this;
      if (e && e.state !== '未开始') {
        this.authority = e.authority;
        if (!this.authority) {
          this.approvalFormCfg.map(item => {
            item.disabled = true;
          });
        }
        console.log('getCurStepConfig', e);
        if (e.biz_cfg_data && e.biz_cfg_data.length > 0) {
          const biz_cfg = e.biz_cfg_data[0];
          self.getColV2(biz_cfg['select_service'], self.type).then(fields => {
            console.log('fields', fields, this.type);
            // this.fields = fields.filter(item => {
            this.formFields = fields;
            this.fields = fields.concat(this.approvalFormCfg);
            let activityData = {};
            this.fields.forEach(item => {
              if (item.display && !item.disabled) {
                activityData[item.column] = '';
                this.$set(this.activityData, item.column, '');
              }
            });
            self.getDetail(biz_cfg['select_service'], fields).then(() => {});
          });
        }
      }
    },
    async getDetail(serviceName, fields) {
      let self = this;
      let col = fields.map(item => item.column);
      let req = {
        serviceName: serviceName,
        condition: [{ colName: 'proc_instance_no', ruleType: 'eq', value: this.proc_instance_no }],
        colNames: col
        // hisVer: true
      };
      let res = await this.onRequest('select', req.serviceName, req, 'oa');
      if (res.data.state === 'SUCCESS') {
        console.log('getDetail111', res.data.data);
        if (res.data.data.length > 0) {
          self.id = res.data.data[0].id;
          Object.keys(res.data.data[0]).forEach(key => {
            self.fields.forEach((field, index) => {
              if (field.column === key) {
                field['value'] = res.data.data[0][key];
                self.$set(self.fields, index, field);
              }
            });
          });
        }
      }
    },
    async getColV2(serviceName, type) {
      let colVs = await this.getServiceV2(serviceName, type, type, 'oa');
      this.colsV2Data = colVs;
			uni.setNavigationBarTitle({
				title:colVs.service_view_name
			})
      // let type = this.type;
      console.log('colsV2Data', colVs);
      let fields = [];
      switch (type) {
        case 'update':
          fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
          break;
        // case 'update':
        //   fields = colVs._fieldInfo;
        //   break;
        case 'detail':
          fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
          break;
        default:
          break;
      }
      if (fields && Array.isArray(fields)) {
        fields = fields.filter((item, index) => {
          if (!item.value) {
            item.value = '';
          }
          if (!this.authority) {
            item.disabled = true;
          }
          // if (item['in_' + type] === 1) {
          return item;
          // }
        });
        // this.fields = fields;
      }
      return fields;
    },
    approval() {
      // 提交审批
      let self = this;
      let itemData = self.$refs.bxForm.getFieldModel();
      // let itemData2
      console.log('itemData', itemData);
      let req = {
        proc_instance_no: this.proc_instance_no,
        step_no: this.procBasicConfig.proHanleData.step_no,
        data: []
      };
      let obj = itemData;
      let len = Object.keys(obj);
      req.data.push(obj);
      if (itemData.proc_result && itemData.proc_result === 'pass') {
        let childDataList = [];
        let d = {
          serviceName: this.stepData.biz_cfg_data[0].update_service,
          condition: [
            {
              colName: 'id',
              ruleType: 'in',
              value: this.id
            }
          ]
        };
        childDataList.push(d);
      }
    }
  },
  onLoad(option) {
    if (option.step_no && option.proc_instance_no && option.type) {
      this.type = option.type;
      this.proc_instance_no = option.proc_instance_no;
      this.getBasicCfg(option.proc_instance_no, option.step_no);
    }
  }
};
</script>

<style lang="scss" scoped>
.step-detail-wrap {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  .buttons {
    height: 200upx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
