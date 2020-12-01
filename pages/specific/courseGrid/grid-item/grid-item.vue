<template>
  <view v-if="colData.length > 0" class="course-row-item">
    <!-- <view v-if="colData.length > 0" class="course-row-item" :class="{ 'no-bg': !newRowData || Object.keys(newRowData).length === 0 }"> -->
    <view class="" v-for="col in colData" :key="col">
      <text v-if="col && newRowData && newRowData[col]">{{ col + '(' + newRowData[col].length + ')' }}:</text>
      <view>
        <!-- <view v-if="col && newRowData && typeof newRowData === 'object' && newRowData[col] && Array.isArray(newRowData[col])"> -->
        <view class="" v-for="(item, itemIndex) in newRowData[col]" :key="itemIndex">
          <text v-if="newRowData[col].length > 1">{{ itemIndex + 1 + ':' }}</text>
          {{ item.labelText }}
        </view>
        <!-- </view> -->
      </view>
    </view>
    <!-- #ifdef H5 -->
    <view v-if="!newRowData || Object.keys(newRowData).length === 0 || !colData || colData.length === 0"><text class="cuIcon-add" style="font-size: 20upx;"></text></view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      newRowData: {}
    };
  },
  watch: {
    rowData: {
      deep: true,
      immediate: true,
      handler(newValue, oldValue) {
        let newRowData = {};
        if (typeof newValue === 'object') {
          let rowData = JSON.parse(JSON.stringify(newValue));
          if (rowData && Object.keys(rowData).length > 0) {
            Object.keys(rowData).forEach(row => {
              newRowData[row] = [];
              let data = rowData[row];
              if (Array.isArray(data)) {
                data.forEach(item => {
                  let config = item.scheduleConfig;
                  if (config.disp_info && Array.isArray(config.disp_info)) {
                    let str = '';
                    config.disp_info.forEach(disp => {
                      if (typeof disp === 'string') {
                        str += disp;
                      } else if (typeof disp === 'object' && disp.srv_col_val) {
                        if (disp.max_char && Number(disp.max_char).toString() !== 'NaN') {
                          let maxChar = Number(disp.max_char);
                          if (item[disp.srv_col_val].length > maxChar) {
                            str += item[disp.srv_col_val].slice(0, maxChar - 1) + '...';
                          } else {
                            str += item[disp.srv_col_val];
                          }
                        } else {
                          str += item[disp.srv_col_val];
                        }
                      }
                    });
                    item['labelText'] = str;
                  }
                  newRowData[row].push(item);
                });
              }
              return row;
            });
          }
        }
        this.newRowData = newRowData;
      }
    }
  },

  props: {
    rowData: {
      type: Object,
      default: () => {}
    },
    colData: {
      type: Array,
      default: () => []
    }
  },
  methods: {}
};
</script>

<style scoped lang="scss">
  .course-row-item {
    overflow-y: scroll;
    box-sizing: border-box;
    min-width: calc(150upx - 2px);
    font-size: 20upx;
    height: 200upx;
    margin-left: 2px;
    margin-bottom: 2px;
    padding: 5px;
    background-color: rgba($color: #e64340, $alpha: 0.8);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    color: #fff;
    flex: 1;
   /* #ifdef H5 */
   &:first-child {
     background-color: rgba($color: #e74c3c, $alpha: 0.8);
   }
   &:nth-child(2) {
     background-color: rgba($color: #1abc9c, $alpha: 0.8);
   }
   &:nth-child(3) {
     background-color: rgba($color: #2ecc71, $alpha: 0.8);
   }
   &:nth-child(4) {
     background-color: rgba($color: #3498db, $alpha: 0.8);
   }
   &:nth-child(5) {
     background-color: rgba($color: #f1c40f, $alpha: 0.8);
   }
   &:nth-child(6) {
     background-color: rgba($color: #00b294, $alpha: 0.8);
   }
   &.no-bg {
     background-color: rgba($color: #efefef, $alpha: 0.5);
     color: rgba($color: #333, $alpha: 0.5);
     display: flex;
     justify-content: center;
     align-items: center;
   }
   /* #endif */
  }
</style>
