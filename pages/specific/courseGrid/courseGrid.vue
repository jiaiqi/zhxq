<template>
  <view class="course" :class="{ rotate: rotate }">
    <view class="course-wrap">
      <view class="header">
        <!-- <text>{{ scheduleConfig.name }}</text> -->
        <view class="colhead-selector" v-if="timeRange.start && timeRange.end">
          <text class="cuIcon-back" @click="changeSchedule('prev')"></text>
          <text class="current-select" @click="selectCol">{{ getTimeExplain(timeRange.start, timeRange.end) }}</text>
          <text class="cuIcon-right" @click="changeSchedule('next')"></text>
        </view>
      </view>
      <view class="course" v-if="colHeadList.length > 0">
        <view class="time-area" :style="'width:' + rowLabelWidth + 'upx'">
          <view class="week"><view class="week-item" v-if="colHeadList.length > 0"></view></view>
          <view
            class="time-item"
            v-for="(item, index) in rowHeadList"
            :key="index"
            :class="{ 'bg-blue': scheduleConfig.row_head_key_col === 'user_no' && login_user_info.user_no === item[scheduleConfig.row_head_key_col] }"
          >
            <view class="time" v-if="item[scheduleConfig.row_head_disp_col]">{{ item[scheduleConfig.row_head_disp_col] }}</view>
          </view>
        </view>
        <view class="course-area" v-if="colHeadList.length > 0">
          <view class="week">
            <view class="week-item" v-for="(item, index) in colHeadList" :key="item.id">
              {{ item && item[scheduleConfig.col_head_disp_col] ? item[scheduleConfig.col_head_disp_col] : '' }}
            </view>
          </view>
          <view class="course-row" v-for="(row, rowIndex) in rowHeadList" :key="rowIndex">
            <grid-item
              v-for="(col, colIndex) in row.newRowDataList"
              :key="colIndex"
              @click.native="clickRow(col, row, colIndex, rowIndex)"
              :rowData="col"
              :colData="row.rowDataListCol"
            ></grid-item>
            <!-- <view class="course-row-item" v-for="(col, colIndex) in row.newRowDataList" :key="colIndex" @click="clickRow(col, row, colIndex, rowIndex)" :class="{ 'no-bg': !col }">
              <view class="" v-for="(column, columnIndex) in row.rowDataListCol" :key="column">
                <text v-if="col && col[column]">{{ column + '(' + col[column].length + ')' }}:</text>
                <view v-if="col && col[column] && Array.isArray(col[column])">
                  <view class="" v-for="(item, itemIndex) in col[column]" :key="itemIndex">
                    <text v-if="col[column].length > 1">{{ itemIndex + 1 + ':' }}</text>
                    {{ item && item[item['scheduleConfig']['schedule_col']] ? item[item['scheduleConfig']['schedule_col']] : '' }}
                  </view>
                </view>
              </view>
              <view v-if="!col"><text class="cuIcon-add" style="font-size: 20upx;"></text></view>
            </view> -->
          </view>
        </view>
      </view>
    </view>
    <view class="cu-modal" :class="{ show: showModal }" @click.stop.prevent="showModal = false" @touchmove.stop.prevent="clear">
      <view class="cu-dialog">
        <view class="modal-list">
          <view class="modal-title" v-if="itemData && itemData.row">
            <text
              class="row-head"
              :class="{ 'text-blue': scheduleConfig.row_head_key_col === 'user_no' && login_user_info.user_no === itemData['row'][scheduleConfig.row_head_key_col] }"
            >
              {{ itemData['row'][scheduleConfig['row_head_disp_col']] }}
            </text>
            <!--    <text class="col-head">
              {{colHeadList[itemData['colIndex']][scheduleConfig['col_head_key_col']]}}
            </text> -->
            <text class="col-head">周{{ colHeadList[itemData['colIndex']][scheduleConfig['col_head_disp_col']] }}</text>
          </view>
          <view class="page-item" v-for="(item, index) in modalList" :key="index">
            <view class="item-title">
              <view class="left">{{ item.group }} ({{ item.data.length }}):</view>
              <text class="btn bg-blue" @click="goPage(item)">进入</text>
            </view>
            <view class="item-content">
              <view class="item-list" :class="{ 'border-bottom': Array.isArray(item.data) && item.data.length > 1 }" v-for="(task, taskIndex) in item.data" :key="taskIndex">
                {{ item.data.length > 1 ? taskIndex + 1 + '.' : '1. ' }} {{ task['labelText'] }}
                <!-- {{ task[task.scheduleConfig.schedule_col] }} -->
              </view>
              <view class="margin-left" v-if="!item.data || item.data.length === 0">无</view>
            </view>
          </view>
        </view>
        <view class="padding-sm" @tap="showModal = false" style="text-align: center;font-size: 20px;">
          <!-- <text class="cuIcon-close text-red" @tap="showModal = false"></text> -->
          <button class="cu-btn bg-red" @tap="showModal = false">关闭</button>
        </view>
        <!-- 	<view class="cu-bar bg-white">
    			<view class="action margin-0 flex-sub text-green solid-left" @tap="showModal = false">取消</view>
    			<view class="action margin-0 flex-sub  solid-left" @tap="showModal = false">确定</view>
    		</view> -->
      </view>
    </view>
  </view>
</template>

<script>
const dayjs = require('dayjs');
require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn');
const weekday = require('dayjs/plugin/weekday');
dayjs.extend(weekday);
import gridItem from './grid-item/grid-item.vue';
import {
  formatDate,
  getMonthDays,
  getQuarterStartMonth,
  getWeekStartDate,
  getWeekEndDate,
  getLastWeekStartDate,
  getLastWeekEndDate,
  getNextWeekStartDate,
  getNextWeekEndDate,
  getMonthStartDate,
  getMonthEndDate,
  getLastMonthStartDate,
  getLastMonthEndDate,
  getQuarterStartDate,
  getQuarterEndDate
} from '@/common/date_utils.js';
export default {
  components: {
    gridItem
  },
  data() {
    return {
      login_user_info: null,
      showCaledar: false,
      scheduleConfig: {},
      scheduleList: [], //
      colHeadList: [], // 列标签
      rowHeadList: [], //行标签
      rotate: false,
      rowLabelWidth: 70,
      scheduleItemList: [],
      showModal: false,
      modalList: [],
      itemData: {},
      queryOption: {}
    };
  },
  computed: {
    timeStart() {
      if (Array.isArray(this.colHeadList) && this.colHeadList.length > 0) {
        let startDate = '';
        this.colHeadList.forEach((item, index) => {
          if (item[this.scheduleConfig.col_head_key_col] && index === 0) {
            startDate = item[this.scheduleConfig.col_head_key_col];
          }
        });
        return startDate;
      }
    },
    timeEnd() {
      if (Array.isArray(this.colHeadList) && this.colHeadList.length > 0) {
        let endDate = '';
        this.colHeadList.forEach((item, index) => {
          if (item[this.scheduleConfig.col_head_key_col] && index === this.colHeadList.length - 1) {
            endDate = item[this.scheduleConfig.col_head_key_col];
          }
        });
        return endDate;
      }
    },
    timeRange() {
      let startDate = '';
      let endDate = '';
      if (Array.isArray(this.colHeadList) && this.colHeadList.length > 0) {
        this.colHeadList.forEach((item, index) => {
          if (item[this.scheduleConfig.col_head_key_col] && index === 0) {
            startDate = item[this.scheduleConfig.col_head_key_col];
          }
          if (item[this.scheduleConfig.col_head_key_col] && index === this.colHeadList.length - 1) {
            endDate = item[this.scheduleConfig.col_head_key_col];
          }
        });
      }
      return { start: startDate, end: endDate };
    }
  },
  methods: {
    getTimeExplain(startDate, endDate) {
      const currentWeekStart = dayjs()
        .weekday(0)
        .format('YYYY-MM-DD');
      const prevWeekStart = dayjs()
        .weekday(-7)
        .format('YYYY-MM-DD');
      const nextWeekStart = dayjs()
        .weekday(7)
        .format('YYYY-MM-DD');
      switch (startDate) {
        case currentWeekStart:
          return '本周';
          break;
        case prevWeekStart:
          return '上周';
          break;
        case nextWeekStart:
          return '下周';
          break;
        default:
          return startDate + ' 至 ' + endDate;
          break;
      }
    },
    changeSchedule(operate) {
      if (this.scheduleConfig.col_head_disp_col === 'day_of_week_cn') {
        let cond = {};
        if (operate === 'prev') {
          //向前
          cond = {
            start: dayjs(this.timeStart)
              .weekday(-7)
              .format('YYYY-MM-DD'),
            end: dayjs(this.timeStart)
              .weekday(-1)
              .format('YYYY-MM-DD')
          };
        } else if (operate === 'next') {
          //向后
          cond = {
            start: dayjs(this.timeStart)
              .weekday(7)
              .format('YYYY-MM-DD'),
            end: dayjs(this.timeStart)
              .weekday(13)
              .format('YYYY-MM-DD')
          };
        }
        // #ifdef H5
        if (this.$route.query.no) {
          cond['no'] = this.$route.query.no;
        }
        // #endif
        // #ifdef MP-WEIXIN
        if (this.queryOption.no) {
          cond['no'] = this.queryOption.no;
        }
        // #endif

        this.getScheduleConfig(cond);
      }
    },
    goPage(e) {
      console.log(e);
      let cond = [];
      let scheduleConfig = {};
      if (e.data && e.data.length > 0) {
        scheduleConfig = e.data[0].scheduleConfig;
        cond = [
          { colName: scheduleConfig.table_col_head_col, ruleType: 'like', value: this.itemData['col'][scheduleConfig.tag][0][scheduleConfig.table_col_head_col] },
          { colName: scheduleConfig.table_row_head_col, ruleType: 'like', value: this.itemData['col'][scheduleConfig.tag][0][scheduleConfig.table_row_head_col] }
        ];
      } else if (e.scheduleConfig) {
        scheduleConfig = e.scheduleConfig;
        cond = e.cond;
      }
      // let scheduleConfig = e.scheduleConfig;

      const viewTemp = {
        title: scheduleConfig.schedule_col,
        tip: scheduleConfig.table_row_head_col,
        // img: 'img',
        // price: 'current_price',
        footer: scheduleConfig.table_col_head_col
      };
      // return;
      if (scheduleConfig.page_type && scheduleConfig.page_type === 'proc') {
        uni.navigateTo({
          url:
            '/pages/public/list/list?cond=' +
            decodeURIComponent(JSON.stringify(cond)) +
            '&serviceName=' +
            scheduleConfig.srv +
            '&pageType=proc&viewTemp=' +
            decodeURIComponent(JSON.stringify(viewTemp))
        });
        // uni.navigateTo({
        //   url: scheduleConfig.dest_page + '?proc_instance_no=' + e.proc_instance_no
        // });
      } else {
        uni.navigateTo({
          url:
            '/pages/public/list/list?cond=' +
            decodeURIComponent(JSON.stringify(cond)) +
            '&serviceName=' +
            scheduleConfig.srv +
            '&pageType=list&viewTemp=' +
            decodeURIComponent(JSON.stringify(viewTemp))
        });
      }
    },
    clickRow(col, row, colIndex, rowIndex) {
      let arr = [];
      const self = this;
      if (col && typeof col === 'object' && Object.keys(col).length > 0) {
        Object.keys(col).forEach(item => {
          let columnData = col[item];
          if (col[item] && Array.isArray(col[item])) {
            col[item].forEach(column => {
              let config = column.scheduleConfig;
              let str = '';
              config.disp_info.forEach(disp => {
                if (typeof disp === 'string') {
                  str += disp;
                } else if (typeof disp === 'object' && disp.srv_col_val) {
                  // if(disp.max_char&&Number(disp.max_char).toString()!=='NaN'){
                  //   let maxChar = Number(disp.max_char)
                  //   if(column[disp.srv_col_val].length>=maxChar){
                  //     str += column[disp.srv_col_val].slice(0,maxChar)+'...';
                  //   }else{
                  //     str += column[disp.srv_col_val];
                  //   }
                  // }else{
                  str += column[disp.srv_col_val];
                  // }
                }
              });
              column['labelText'] = str;
            });
          }
          arr.push({ group: item, data: col[item] });
        });
        let colData = this.colHeadList[colIndex];
        this.scheduleItemList.forEach(item => {
          let group = arr.map(item => item.group);
          if (!group.includes(item.config.tag)) {
            let cond = [
              { colName: item.config.table_col_head_col, ruleType: 'like', value: colData[self.scheduleConfig.col_head_key_col] },
              { colName: item.config.table_row_head_col, ruleType: 'like', value: row[self.scheduleConfig.row_head_key_col] }
            ];
            arr.push({ group: item.config.tag, data: [], scheduleConfig: item.config, cond: cond });
          }
        });
        this.modalList = arr;
        this.itemData = {
          col,
          row,
          colIndex,
          rowIndex
        };
        this.showModal = true;
      } else {
        let colData = this.colHeadList[colIndex];
        let arr = [];
        this.scheduleItemList.forEach(item => {
          let cond = [
            { colName: item.config.table_col_head_col, ruleType: 'like', value: colData[self.scheduleConfig.col_head_key_col] },
            { colName: item.config.table_row_head_col, ruleType: 'like', value: row[self.scheduleConfig.row_head_key_col] }
          ];
          arr.push({ group: item.config.tag, data: [], scheduleConfig: item.config, cond: cond });
        });
        this.modalList = arr;
        this.showModal = true;
      }
      uni.setStorageSync('activeApp', this.scheduleConfig.app);
      const serviceName = this.scheduleConfig.table.replace('bx', 'srv') + '_select';
      const viewTemp = {
        title: this.scheduleConfig.schedule_col,
        tip: this.scheduleConfig.table_row_head_col,
        footer: this.scheduleConfig.table_col_head_col
      };
      return;
      let cond = [];
      if (col && Array.isArray(col) && col.length > 0) {
        console.log(e, 'clickRow');
        cond = [
          { colName: this.scheduleConfig.table_col_head_col, ruleType: 'like', value: e[0][this.scheduleConfig.table_col_head_col] },
          { colName: this.scheduleConfig.table_row_head_col, ruleType: 'like', value: e[0][this.scheduleConfig.table_row_head_col] }
        ];
        uni.navigateTo({
          url:
            '/pages/public/list/list?cond=' +
            decodeURIComponent(JSON.stringify(cond)) +
            '&serviceName=' +
            serviceName +
            '&pageType=list&viewTemp=' +
            decodeURIComponent(JSON.stringify(viewTemp))
        });
      } else {
        const colValue = this.colHeadList[colIndex][this.scheduleConfig['col_head_key_col']];
        const rowValue = this.rowHeadList[rowIndex][this.scheduleConfig['row_head_key_col']];
        if (colValue && rowValue) {
          cond = [
            { colName: this.scheduleConfig.table_col_head_col, ruleType: 'like', value: colValue },
            { colName: this.scheduleConfig.table_row_head_col, ruleType: 'like', value: rowValue }
          ];
          const serviceName = this.scheduleConfig.table.replace('bx', 'srv') + '_add';
          uni.navigateTo({
            url: '/pages/public/formPage/formPage?serviceName=' + serviceName + '&type=add&cond=' + decodeURIComponent(JSON.stringify(cond))
          });
        } else {
          uni.showToast({
            title: '数据异常,请刷新后再进行操作',
            icon: 'none'
          });
          return;
        }
      }
    },
    selectCol() {
      uni.showToast({
        icon: 'none',
        title: `${this.timeStart}~${this.timeEnd}`
      });
    },
    change({ choiceDate, dayCount }) {
      console.log(choiceDate, dayCount);
    },
    changePopup(e) {},
    async getScheduleConfig(cond = { start: '', end: '', no: '' }) {
      // 获取排程配置数据
      const self = this;
      const url = this.getServiceUrl('daq', 'srvdaq_schedule_cfg_select', 'select');
      const req = { serviceName: 'srvdaq_schedule_cfg_select', colNames: ['*'], condition: [], order: [] };
      if (cond && cond.no) {
        req.condition = [
          {
            colName: 'no',
            value: cond.no,
            ruleType: 'eq'
          }
        ];
      }
      const res = await this.$http.post(url, req);
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        this.scheduleConfig = res.data.data[0];
        // document.title = this.scheduleConfig.name;
        this.getScheduleItemList(cond).then(scheduleItemList => {
          this.getRowHead().then(rowHeadList => {
            rowHeadList.forEach((row, rowIndex) => {
              // rowHeadList.forEach(item => {
              row['rowDataList'] = [];
              row['newRowDataList'] = [];
              row['rowDataList'].length = 7;
              row['newRowDataList'].length = 7;
            });
            self.getColHead(cond).then(colHeadList => {
              colHeadList.forEach((col, colIndex) => {
                self.scheduleItemList.forEach(scheduleList => {
                  scheduleList.data.forEach(schedule => {
                    rowHeadList.forEach((row, rowIndex) => {
                      if (
                        col[self.scheduleConfig.col_head_key_col] === schedule[scheduleList.config.table_col_head_col] &&
                        row[self.scheduleConfig.row_head_key_col] === schedule[scheduleList.config.table_row_head_col]
                      ) {
                        let newObj = row['newRowDataList'][colIndex] ? row['newRowDataList'][colIndex] : {};
                        if (row.user_no === 'zhangj') {
                          // 
                          console.log(newObj, row, col, colIndex);
                        }
                        schedule.scheduleConfig = scheduleList.config;
                        newObj[scheduleList.config.tag] && Array.isArray(newObj[scheduleList.config.tag])
                          ? newObj[scheduleList.config.tag].push(schedule)
                          : (newObj[scheduleList.config.tag] = [schedule]);
                        row['newRowDataList'][colIndex] = newObj;

                        // row['rowDataListCol'] = row['rowDataListCol'] && row['rowDataListCol'].length > Object.keys(newObj).length ? row['rowDataListCol'] : Object.keys(newObj);
                        row['rowDataListCol'] = row['rowDataListCol'] ? row['rowDataListCol'].concat(Object.keys(newObj)) : Object.keys(newObj);
                        row['rowDataListCol'] = Array.from(new Set(row['rowDataListCol']));
                      }
                      self.$set(self.rowHeadList, rowIndex, row);
                    });
                  });
                });
              });
            });
          });
        });

        return;
        //   this.getScheduleList(cond).then(scheduleList => {
        //     this.getRowHead()
        //       .then(rowHeadList => {
        //         rowHeadList.forEach(item => {
        //           item['rowDataList'] = [];
        //           item['rowDataList'].length = 7;
        //         });
        //       })
        //       .then(() => {
        //         this.getColHead(cond).then(colHeadList => {
        //           colHeadList.forEach((col, colIndex) => {
        //             this.scheduleList.forEach(schedule => {
        //               this.rowHeadList.forEach((row, rowIndex) => {
        //                 if (
        //                   col[this.scheduleConfig.col_head_key_col] === schedule[this.scheduleConfig.table_col_head_col] &&
        //                   row[this.scheduleConfig.row_head_key_col] === schedule[this.scheduleConfig.table_row_head_col]
        //                 ) {
        //                   Array.isArray(row['rowDataList'][colIndex]) ? row['rowDataList'][colIndex].push(schedule) : (row['rowDataList'][colIndex] = [schedule]);
        //                   console.log(schedule, col, rowIndex);
        //                 } else if (row[this.scheduleConfig.row_head_key_col] === schedule[this.scheduleConfig.table_row_head_col]) {
        //                   if (schedule[this.scheduleConfig.table_col_head_col].indexOf(col[this.scheduleConfig.col_head_key_col]) !== -1) {
        //                     Array.isArray(row['rowDataList'][colIndex]) ? row['rowDataList'][colIndex].push(schedule) : (row['rowDataList'][colIndex] = [schedule]);
        //                   }
        //                 }
        //                 this.$set(this.rowHeadList, rowIndex, row);
        //               });
        //             });
        //           });
        //         });
        //       });
        //   });
      }
    },
    async getScheduleItemList(cond = { start: '', end: '', no: '' }) {
      const scheduleConfig = this.deepClone(this.scheduleConfig);
      let schedule_item_cfg = scheduleConfig.schedule_item_cfg;
      if (schedule_item_cfg && typeof schedule_item_cfg === 'string') {
        schedule_item_cfg = JSON.parse(schedule_item_cfg);
      }
      let scheduleItemList = [];
      let weekStart = getWeekStartDate();
      let weekEnd = getWeekEndDate();
      if (schedule_item_cfg && Array.isArray(schedule_item_cfg)) {
        for (let i of schedule_item_cfg) {
          const url = this.getServiceUrl(i['app'], i['srv'], 'select');
          const req = (req = {
            serviceName: i['srv'],
            colNames: ['*'],
            condition: [{ colName: i['table_col_head_col'], ruleType: 'between', value: [cond.start ? cond.start : weekStart, cond.end ? cond.end : weekEnd] }]
          });
          const res = await this.$http.post(url, req);
          if (res.data.state === 'SUCCESS') {
            scheduleItemList.push({
              config: i,
              data: res.data.data
            });
          }
        }
      }
      this.scheduleItemList = scheduleItemList;
      return scheduleItemList;
    },
    async getScheduleList(cond = { start: '', end: '', no: '' }) {
      const scheduleConfig = this.scheduleConfig;
      let serviceName = '';
      if (scheduleConfig.table) {
        serviceName = scheduleConfig.table.replace('bx', 'srv') + '_select';
        console.log('serviceName', serviceName);
        const url = this.getServiceUrl(scheduleConfig.app, serviceName, 'select');
        let weekStart = getWeekStartDate();
        let weekEnd = getWeekEndDate();
        const req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: [{ colName: this.scheduleConfig.table_col_head_col, ruleType: 'between', value: [cond.start ? cond.start : weekStart, cond.end ? cond.end : weekEnd] }],
          order: []
        };
        const res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS') {
          console.log('aaa', res.data.data);
          this.scheduleList = res.data.data;
          return res.data.data;
        }
      }
    },
    async getColHead(cond = { start: '', end: '' }) {
      const scheduleConfig = this.scheduleConfig;
      const url = this.getServiceUrl(scheduleConfig.col_head_app, scheduleConfig.col_head_service, 'select');
      let weekStart = getWeekStartDate();
      let weekEnd = getWeekEndDate();
      const req = {
        serviceName: scheduleConfig.col_head_service,
        colNames: ['*'],
        condition: [{ colName: this.scheduleConfig.col_head_key_col, ruleType: 'between', value: [cond.start ? cond.start : weekStart, cond.end ? cond.end : weekEnd] }],
        order: []
      };

      const res = await this.$http.post(url, req);
      if (res.data.state === 'SUCCESS') {
        let list = res.data.data.map(item => item[scheduleConfig.col_head_disp_col]);
        this.colHeadList = res.data.data;
        console.log('bbb', res.data.data, list);
        return res.data.data;
      }
    },
    async getRowHead(rowHead) {
      const scheduleConfig = this.scheduleConfig;
      const url = this.getServiceUrl(scheduleConfig.row_head_app, scheduleConfig.row_head_service, 'select');
      const req = {
        serviceName: scheduleConfig.row_head_service,
        colNames: ['*']
      };
      if (this.scheduleConfig.row_head_srv_cond) {
        let cond = this.scheduleConfig.row_head_srv_cond;
        if (typeof cond === 'string') {
          cond = JSON.parse(cond);
        }
        req.condition = cond;
        //   req.condition = JSON.parse(this.scheduleConfig.row_head_srv_cond);
      }
      const res = await this.$http.post(url, req);
      if (res.data.state === 'SUCCESS') {
        let list = res.data.data.map(item => item[scheduleConfig.col_head_disp_col]);
        list = [...new Set(list)];
        this.rowHeadList = res.data.data;
        return this.rowHeadList;
      }
    },
    clear(e) {
      // TODO nvue 取消冒泡
      e.stopPropagation();
    }
  },
  watch: {
    scheduleConfig: {
      deep: true,
      handler(newValue, oldValue) {
        if (newValue.schedule_item_cfg && typeof newValue.schedule_item_cfg === 'string') {
          this.scheduleConfig.schedule_item_cfg = JSON.parse(newValue.schedule_item_cfg);
        }
        if (newValue.row_head_srv_cond && typeof newValue.row_head_srv_cond === 'string') {
          this.scheduleConfig.row_head_srv_cond = JSON.parse(newValue.row_head_srv_cond);
        }
      }
    },
    rowHeadList: {
      deep: true,
      handler(newValue, oldValue) {}
    }
  },
  mounted() {
    if (uni.getStorageSync('login_user_info')) {
      this.login_user_info = uni.getStorageSync('login_user_info');
    }
  },
  onLoad(option) {
    console.log('--------', option);
    // #ifdef MP-WEIXIN
    let query = JSON.parse(decodeURIComponent(option.query));
    if (query.no) {
      this.getScheduleConfig({ no: query.no });
    } else {
      this.getScheduleConfig();
    }
    this.queryOption = query;
    // #endif
  },
  onShow() {
    console.log('--------');
    // #ifdef H5
    if (this.$route.query.no) {
      this.getScheduleConfig({ no: this.$route.query.no });
    } else {
      this.getScheduleConfig();
    }
    // #endif
    // #ifdef MP-WEIXIN
    if (this.queryOption.no) {
      this.getScheduleConfig({ no: this.queryOption.no });
    } else {
      this.getScheduleConfig();
    }
    // #endif
  },
  created() {
    // this.getScheduleConfig();
  }
};
</script>

<style lang="scss">
.rotate {
  transform: rotate(90deg);
}
.cu-dialog {
  width: 96%;
  height: auto;
  left: 2%;
  min-height: 500upx;
  background-color: #fff;
  // background-color: #e54d42;
  // color: #fff;
  .modal-list {
    display: flex;
    // justify-content: space-around;
    padding: 0 20upx 20upx;
    flex-direction: column;
    // background-color: #fff;
    .modal-title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30upx;
      height: 60upx;
      .col-head {
        margin: 0 20upx;
      }
    }
    .page-item {
      padding: 20upx 0 10upx;
      // border-bottom: 1px solid #fff;
      .item-title {
        color: #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10upx;
        letter-spacing: 2upx;
        .left {
          display: flex;
          align-items: center;
          border-left: 3px solid #e54d42;
          text-indent: 20upx;
          font-weight: 600;
          color: #666;
        }
        .btn {
          margin-top: 5upx;
          padding: 10upx 10upx 10upx 20upx;
          letter-spacing: 10upx;
          border-radius: 10upx;
        }
      }
      .item-content {
        // background-color: #e54d42;
        padding-left: 40upx;
        font-size: 32upx;
        .item-list {
          padding-bottom: 10upx;
          line-height: 60upx;
        }
        .item-list.border-bottom {
          // border-bottom: 1px solid #fff;
          &:last-child {
            border: none;
          }
        }
      }
    }
  }
}
.course-wrap {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  padding-top: 80upx;
  // max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .header {
    font-size: 32upx;
    line-height: 80upx;
    text-align: center;
    background-color: #2980b9;
    color: #fff;
    display: flex;
    justify-content: center;
    position: fixed;
    top: 0;
    width: 100%;
    max-width: 1000px;
    .colhead-selector {
      min-width: 80%;
      display: flex;
      justify-content: space-around;
      .current-select {
        display: inline-block;
        margin: 0 10upx;
        min-width: 100upx;
        text-align: center;
      }
    }
  }
  .week {
    display: flex;
    background-color: #2980b9;
    color: #efefef;
    .week-item {
      min-width: 150upx;
      width: 150upx;
      flex: 1;
      height: 40upx;
      text-align: center;
      background-color: #2980b9;
    }
  }
  .course {
    display: flex;
    background-color: #fff;
    // overflow: scroll;
    // flex-direction: column;
    margin-bottom: 20upx;
    .time-area {
      display: flex;
      flex-direction: column;
      .week {
        margin: 0;
        padding: 0;
        height: 40upx;
        margin-bottom: 10upx;
      }
      .time-item {
        height: 200upx;
        margin-bottom: 2px;
        display: flex;
        flex-direction: column;
        text-align: center;
        justify-content: center;
        .index {
          font-size: 30upx;
          line-height: 40upx;
        }
        .time {
          overflow: hidden;
          writing-mode: vertical-rl;
          display: flex;
          align-items: center;
          justify-content: space-between;
          letter-spacing: 5px;
        }
      }
    }

    .course-area {
      flex: 1;
      overflow: scroll;
      // padding-top: 25px;
      .week {
        margin-bottom: 10upx;
        // position: fixed;
        // top: 40px;
      }
    }

    .course-row {
      display: flex;
      width: 15 0%;
      flex: 1;
    }
  }
}
</style>
