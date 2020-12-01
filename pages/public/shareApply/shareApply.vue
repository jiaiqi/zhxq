<template>
  <view>
    <!-- <cu-custom bgColor="bg-blue" :isBack="true">
      <block slot="backText">返回</block>
      <block slot="content" v-if="colsV2Data.service_view_name">{{ colsV2Data.service_view_name }}</block>
    </cu-custom> -->
    <view class="form-wrap" v-if="fields.length > 0">
      <bxform ref="bxForm" :service="serviceName" :pageType="type" :BxformType="type" :fields="fields"></bxform>
      <view class="apply_button_bot">
        <button class="bg-green cu-btn lg" @click="submitData">提交</button>
        <!-- <button class="bg-green cu-btn lg" @click="toList">查看记录</button> -->
        <!-- #ifdef MP-WEIXIN -->
        <!-- <button class="share-btn cu-btn lg bg-blue" open-type="share">分享</button> -->
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
export default {
  components: { bxform },
  data() {
    return {
      type: 'add',
      serviceName: '',
      fields: [],
      procBasicConfig: {},
      colsV2Data: {},
      isTouchs: false,
      defaultCondition: [],
	  stratDateTime:""
    };
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
    async submitData() {
      let self = this;
      let serviceName = this.serviceName;
      let itemData = this.$refs.bxForm.getFieldModel();
	  let basic = uni.getStorageSync("basics_info")
      console.log('itemData', itemData);
	  itemData["person_no"] = basic.person_no
      if (!itemData) {
        return;
      } else {
        if (serviceName !== 'srvzhxq_member_fuwu_add') {
          itemData['proc_status'] = '完成';
        }
		// for(let key in itemData){
		// 	if(key == 'fwrq'){
		// 		itemData[key] = this.stratDateTime
		// 	}
		// 	if(key == 'lkrq'){
		// 		let a = new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1)
		// 		let hours = a.getHours()
		// 		let mins = a.getMinutes()
		// 		let scends = a.getSeconds()
		// 		itemData[key] = itemData[key] + ' '  + hours + ':' + mins + ':' + scends
		// 	}
		// }
        let req = [
          {
            data: [itemData],
            serviceName: this.serviceName
          }
        ];
        console.log(this.colsV2Data, 'this.colsV2Data', itemData);
        let colV2Datsa = this.colsV2Data._fieldInfo;
        let isOk = true;
        ;
        // colV2Datsa.forEach(colV2=>{
        for (let i = 0; i < colV2Datsa.length; i++) {
          for (let key in itemData) {
            if (colV2Datsa[i].column == key && itemData[key]) {
              isOk = true;
              break;
            } else {
              isOk = false;
            }
          }
          if (!isOk) {
            break;
          }
        }

        // })

        uni.showLoading({
          title: '加载中'
        });
        let res = await this.onRequest('add', this.serviceName, req, uni.getStorageSync('activeApp'));
		console.log("req-==========----------==========",res)
        if (res.data.state === 'SUCCESS') {
          console.log(res.data, 'res.data');
          uni.hideLoading();
          let resData = res.data.response[0].response;
		  this.getFKcode(resData.ids[0]).then(codes=>{
			  if(codes.qr_code){				  
			  uni.showModal({
			    title: '提示',
			    content: '申请成功',
			    showCancel: false,
			    success(res) {
			      if (res.confirm) {
			        if (serviceName.indexOf('_add')) {
			          serviceName = serviceName.replace('_add', '_select');
			        }
			        let queryObj = {};
			        if (self.serviceName != 'srvzhxq_member_fuwu_add') {
			          queryObj = {
			            serviceName: 'srvzhxq_guest_mgmt_fangke_update',
			            id: resData.ids[0],
			            type: 'share',
			            pageType: 'update'
			          };
			          if (isOk) {
			            uni.redirectTo({
			              url: '/pages/specific/permit/permit?type=share&code=' + codes.qr_code + '&rowData=' + encodeURIComponent(JSON.stringify(codes))
			            });
			          } else {
			            uni.redirectTo({
			              url: '/pages/public/shareApply/shareDetail?query=' + JSON.stringify(queryObj)
			            });
			            console.log('=================');
			          }
			        } else {
			          queryObj = {
			            serviceName: 'srvzhxq_member_fuwu_select',
			            id: resData.ids[0],
			            pageType: 'detail'
			          };
			          uni.redirectTo({
			            url: '/pages/public/shareApply/shareDetail?query=' + JSON.stringify(queryObj)
			          });
			        }
			      }
			    }
			  });
			  }
		  })	            
        }
      }
    },
    async getBasicCfg() {
      // srvprocess_basic_cfg_select 流程初始化数据查询
      let serviceName = this.serviceName;
      let req = { serviceName: 'srvprocess_basic_cfg_select', colNames: ['*'], condition: [{ colName: 'service_name', ruleType: 'eq', value: serviceName }] };
      let res = await this.onRequest('select', 'srvprocess_basic_cfg_select', req, uni.getStorageSync('activeApp'));
      if (res.data.state === 'SUCCESS') {
        this.procBasicConfig = res.data;
      }
    },
    async getColV2() {
      let colVs = await this.getServiceV2(this.serviceName, this.type, this.type, uni.getStorageSync('activeApp'));
      this.colsV2Data = colVs;
      let type = this.type;
      console.log('colsV2Data', colVs);
      let fields = [];
      switch (type) {
        case 'update':
          fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
          break;
        case 'add':
          if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs._fieldInfo && Array.isArray(colVs._fieldInfo)) {
            console.log('this.defaultCondition', this.defaultCondition, colVs._fieldInfo);
            let arr = [];
            this.defaultCondition.forEach(cond => {
              colVs._fieldInfo.forEach(field => {
                if (cond.colName === field.column) {
                  field['value'] = cond['value'];
                  field['disabled'] = false;
                }
              });
            });
          }
          fields = colVs._fieldInfo;
          break;
        case 'detail':
          fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
          break;
        default:
          break;
      }
      console.log('fields:', fields, type);
      if (fields && Array.isArray(fields)) {
        fields = fields.filter((item, index) => {
          if (!item.value) {
            item.value = '';
          }
          if (item.column === 'activity_no') {
            item['disabled'] = true;
          }
          if (item['in_' + type] === 1 || item['in_' + type] === 2) {
            return item;
          }
        });
        console.log('this.fields ', fields);
        this.fields = fields;
      }
    }
  },
  onLoad(option) {
    // this.isTouchs = true
    console.log('---onLoad--------', option);

    // let query = option
    let query = {};
    if (option.cond) {
      query = option;
    } else if (option.query) {
      query = option.query;
    }
    if (query) {
      if (typeof query === 'string') {
        query = JSON.parse(decodeURIComponent(option.query));
      }
      //  // let cond = JSON.parse(option.cond)
      if (query.cond) {
        let conds = JSON.parse(query.cond);
        conds.forEach(item => {
          if (item.colName === 'fwrq' && item.value === 'date') {
            let date = this.getDayDate(new Date());
            item.value = date;
			this.stratDateTime = this.getDayDate(new Date(),'all')
          }
          if (uni.getStorageSync('activeApp') == 'zhxq') {
            let basicInfo = uni.getStorageSync('basics_info');
            // if (item.colName === 'xm') {
            //   item.value = basicInfo.real_name;
            // }
            if (item.colName === 'lxfs' || item.colName === 'lxdh') {
              item.value = basicInfo.tel;
            }
            if (item.colName === 'gmsfhm' || item.colName === 'zjhm') {
              item.value = basicInfo.picp;
            }
          }
        });

        this.defaultCondition = conds;
		console.log("this.defaultCondition",this.defaultCondition)
      }
    }
    if (query.title) {
      uni.setNavigationBarTitle({
        title: JSON.parse(query.title).title
      });
      // if(query.title || JSON.parse(decodeURIComponent(query.query)).title){
      // 	console.log("JSON.parse(decodeURIComponent(query.query)).title",JSON.parse(decodeURIComponent(query.query)).title)
      // 	 uni.setNavigationBarTitle({
      // 		 title: JSON.parse(JSON.parse(decodeURIComponent(query.query)).title).title
      // 	 });
      // }else{
      //   uni.setNavigationBarTitle({
      // 	  title: '邀请来访'
      //   });
      // }
      // uni.setStorageSync('activeApp', 'zhxq');

      // this.listConfig = JSON.parse(decodeURIComponent(decodeURIComponent(option.listConfig)));
    }
    this.serviceName = option.serviceName ? option.serviceName : query.serviceName;
    // this.getBasicCfg();
    this.getColV2();
  },
  onShow() {}
};
</script>

<style lang="scss" scoped>
.form-wrap {
  min-height: calc(100vh - 100upx);
}
.apply_button_bot {
  padding: 15px;
  display: flex;
  justify-content: space-around;
  background-color: #fff;
}
.bg-green {
  background-color: #0bc99d;
  width: 60vw
}
</style>
