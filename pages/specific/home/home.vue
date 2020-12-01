<template>
  <view class="container999" @touchstart="refreshStart" @touchmove="refreshMove" @touchend="refreshEnd">
    <!-- 刷新组件需搭配scroll-view使用，并在pages.json中添加 "disableScroll":true-->
    <refresh ref="refresh" @isRefresh="isRefresh"></refresh>
    <!-- <cu-custom bgColor="bg-gradual-pink" :isBack="false"><block slot="content">首页</block></cu-custom> -->
    <view class="nav">
      <!-- #ifdef H5 -->
      <!-- <view style="height: 45px;width: 100%;">边距盒子</view> -->
      <!-- #endif -->
      <navTab ref="navTab" :tabTitle="tabTitle" @changeTab="changeTab"></navTab>
    </view>
    <!-- swiper切换 swiper-item表示一页 scroll-view表示滚动视窗 -->
    <swiper style="min-height: 100vh;" :current="currentTab" @change="swiperTab">
      <swiper-item v-for="(listItem, listIndex) in list" :key="listIndex">
        <scroll-view style="height: 100%;" scroll-y="true" @scrolltolower="lower1" scroll-with-animation :scroll-into-view="toView">
          <view :id="'top' + listIndex" style="width: 100%;height: 120upx;"></view>
          <view class="content">
            <view class="cu-list menu">
              <view class="cu-item" v-for="(item, index) in listItem" :key="index">
                <view class="content padding-tb-sm">
                  <!-- <view class="content padding-tb-sm" @click="toActivityUpdata(item.activity_no)"> -->
                  <view class="titleWrap" @click.stop="toPreview(item.activity_no, item.status, item.fill_batch_no)">
                    <view class="text-cut">{{ item.title }}</view>
                    <text class="placehold"></text>
                    <view class="cu-tag round " v-if="currentTab===0" :class="item.status == '未开始' ? 'bg-orange' : item.status == '已结束' ? 'bg-grey' : 'bg-olive'">{{ item.status }}</view>
                    <view class="cu-tag round " v-if="currentTab===1" :class="item.state == '未完成' ? 'bg-orange' : item.status == '完成' ? 'bg-grey' : 'bg-olive'">{{ item.state }}</view>
                  </view>
                  <view class="text-gray text-sm" style="display: flex;">
                    <view class="" @click="toViewList('view', item)">
                      <text class="cuIcon-attentionfill margin-right-xs"></text>
                      查看：
                      <text class="text-blue">{{ item.view_count }}人</text>
                    </view>
                    <view class="" @click="toViewList('feedback', item)">
                      <text class="placehold"></text>
                      反馈：
                      <text class="text-blue">{{ item.feedback_count }}人</text>
                    </view>
                  </view>
                  <view class="text-gray text-sm">
                    <text class="cuIcon-timefill margin-right-xs"></text>
                    {{ item.create_time }}
                  </view>
                  <view class="action line_action">
                    <!-- <view class="cuIcon-notice_forbid_fill text-gray">修改11</view> -->
                    <view v-if="item.status === '未开始'" style="margin-right: 10upx;" @click.stop="updateState(item)" class="btn">发布</view>
                    <view v-if="item.status === '未开始'" @click.stop="toUpdate(item.activity_no)" class="btn update_btn">修改</view>
                    <view v-if="item.status !== '未开始'&&currentTab===0" @click.stop="toAnalyze(item.activity_no)" class="btn">分析</view>

                    <!-- <button android:gravity='center_vertical' v-if="item.status === '未开始'" style="margin-right: 10upx;" @click.stop="updateState(item)" class="cu-btn sm round bg-green">发布</button>
										<button v-if="item.status === '未开始'" class="cu-btn sm round bg-cyan" @click.stop="toUpdate(item.activity_no)">修改</button> -->
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="noCard" v-if="list.length === 0">暂无信息</view>
          <view style="width: 100%;height: 100upx;opacity:0;">底部占位盒子</view>
        </scroll-view>
      </swiper-item>
    </swiper>
    <view class="cu-bar tabbar foot bg-white">
      <view class="action text-gray add-action" style="font-size: 28upx;">
        <button class="cu-btn cuIcon-add bg-green shadow" @click="toAdd"></button>
        创建
      </view>
    </view>
  </view>
</template>

<script>
const util = require('@/util/util.js');
import refresh from '@/components/tablist/refresh.vue';
import navTab from '@/components/tablist/navTab.vue';
import tabBar4 from '@/components/tablist/tabBar4.vue';
export default {
  components: { refresh, navTab, tabBar4 },
  data() {
    return {
      currentPage: 'index',
      toView: '', //回到顶部id
      tabTitle: ['我创建的', '我反馈的'], //导航栏格式 --导航栏组件
      currentTab: 0, //sweiper所在页
      pages: [1, 1, 1, 1], //第几个swiper的第几页
      list: [{}], //数据格式，
      pageInfo: {
        pageNo: 1,
        rownumber: 10,
        total: 0
      },
      currentLoginUser: '',
      questList: []
    };
  },
  created() {
    // this.initLogin();
  },
  onShow() {
    let isWeixinClient = this.isWeixinClient();
    if (isWeixinClient) {
      this.getSignature();
    }
  },
  mounted() {},
  onLoad(e) {
    let user = uni.getStorageSync('login_user_info');
    console.log(user);
    this.currentLoginUser = user.user_no;
    uni.hideNavigationBarLoading();
  },
  onShow() {
    this.testV2();
    this.getList(this.currentTab);
  },
  onHide() {},
  methods: {
    testV2() {
      this.getServiceV2();
    },
    toActivityUpdata(e) {
      uni.navigateTo({
        url: '../activityUpdate/activityUpdate?activity_no=' + e
      });
    },
    toViewList(type, item) {
      console.log(type, item);
      if (this.currentTab === 0) {
        // 我创建的
        if ((type === 'view' && item.view_count !== 0) || (type === 'feedback' && item.feedback_count !== 0)) {
          uni.navigateTo({
            url: '../viewRecord/viewRecord?activity_no=' + item.activity_no + '&record_type=' + type
          });
        }
      }
    },
    toPreview(e, status, fill_batch_no) {
      console.log(e, status, fill_batch_no);
      let formType = 'detail';
      // if (this.currentTab === 0) {
      // 	formType = 'form';
      // }
      if (status !== '已结束') {
        if (fill_batch_no) {
          uni.navigateTo({
            url: `/pages/specific/questionnaire/questionnaire?formType=${formType}&activity_no=${e}&status=${status}&fill_batch_no=${fill_batch_no}`
          });
        } else {
          uni.navigateTo({
            url: `/pages/specific/questionnaire/questionnaire?formType=${formType}&activity_no=${e}&status=${status}`
          });
        }
      } else {
        uni.showToast({
          title: '已结束问卷不支持查看',
          icon: 'none'
        });
      }
    },

    toAdd() {
      uni.navigateTo({
        url: '/pages/specific/added/added?serviceName=' + 'srvdaq_activity_cfg_add' + '&type=add'
      });
    },
    toUpdate(e) {
      uni.navigateTo({
        url: '/pages/specific/activityUpdate/activityUpdate?activity_no=' + e
      });
    },
    toAnalyze(e){
      uni.navigateTo({
        url: '/pages/specific/questionnaire/questionnaireAnalysis/questionnaireAnalysis?activity_no=' + e
      });
    },
    async updateState(e) {
      let reqData = [
        {
          status: '进行中'
        }
      ];
      let url = this.getServiceUrl('daq', 'srvdaq_activity_cfg_update', 'operate');
      let req = [
        {
          serviceName: 'srvdaq_activity_cfg_update',
          data: reqData,
          order: [{colName: "create_time", orderType: "desc"}],
          condition: [
            {
              colName: 'id',
              ruleType: 'eq',
              value: e.id
            }
          ]
        }
      ];
      let response = await this.$http.post(url, req);
      if (response.data.resultCode === 'SUCCESS') {
        this.getList(this.currentTab);
      }
      console.log(response);
    },
    toTop() {
      this.toView = '';
      setTimeout(() => {
        this.toView = 'top' + this.currentTab;
      }, 10);
    },
    async getList(e) {
      let that = this;
      if (e === 0) {
        let url = this.getServiceUrl('daq', 'srvdaq_activity_mine_select', 'select');
        let req = {
          serviceName: 'srvdaq_activity_mine_select',
          colNames: ['*'],
          order: [{colName: "create_time", orderType: "desc"}],
          page: { pageNo: this.pageInfo.pageNo, rownumber: this.pageInfo.rownumber }
        };
        let response = await this.$http.post(url, req);
        if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
          let listData = response.data.data;
          this.pageInfo = response.data.page;
          if (this.pageInfo.pageNo === 1) {
            this.$set(this.list, e, listData);
          } else if (this.pageInfo.pageNo > 1) {
            listData = this.list[e].concat(listData);
            this.$set(this.list, e, listData);
            uni.showToast({
              title: '加载成功'
            });
          }
        }
      } else if (e === 1) {
        let url = this.getServiceUrl('daq', 'srvdaq_activity_mine_feedback_select', 'select');
        let req = { serviceName: 'srvdaq_activity_mine_feedback_select', colNames: ['*'], order: [{colName: "create_time", orderType: "desc"}],page: { pageNo: this.pageInfo.pageNo, rownumber: this.pageInfo.rownumber } };
        let response = await this.$http.post(url, req);
        if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
          this.$set(this.list, e, response.data.data);
          let questList = [];
          response.data.data.forEach(item => {
            // activity_no
            this.getFeedbackList(item).then(list => {
              console.log(questList);
              questList = [...questList, ...list];

              this.questList = questList;
              this.$set(this.list, e, questList);
            });
          });
        }
      }
    },
    async getFeedbackList(item) {
      let url2 = this.getServiceUrl('daq', 'srvdaq_record_reply_select', 'select');
      let req2 = {
        serviceName: 'srvdaq_record_reply_select',
        colNames: ['*'],
        condition: [{ colName: 'activity_no', ruleType: 'in', value: item.activity_no }, { colName: 'user_no', ruleType: 'in', value: this.currentLoginUser }],
        order: [{ colName: 'create_time', orderType: 'desc' }]
      };
      let response2 = await this.$http.post(url2, req2);
      if (response2.data.state === 'SUCCESS') {
        let questList = response2.data.data;
        // console.log(questList)
        questList.forEach(quest => {
          quest = Object.assign(quest, item);
          return quest;
        });
        return questList;
      }
    },
    changeTab(index) {
      this.pageInfo = {
        pageNo: 1,
        rownumber: 10,
        total: 0
      };
      this.currentTab = index;
      console.log(index);
      this.getList(index);
    },
    // 其他请求事件 当然刷新和其他请求可以写一起 多一层判断。
    isRequest() {
      return new Promise((resolve, reject) => {
        this.pages[this.currentTab]++;
        var that = this;
        this.pageInfo.pageNo++;
        this.getList(this.currentTab);
        setTimeout(() => {
          // uni.showToast({
          // 	icon: 'none',
          // 	title: `请求第${that.currentTab + 1}个导航栏的第${that.pages[that.currentTab]}页数据成功`
          // });
          // let newData = ['新数据1', '新数据2', '新数据3'];
          // resolve(newData);
        }, 1000);
      });
    },
    // swiper 滑动
    swiperTab: function(e) {
      var index = e.detail.current; //获取索引
      this.$refs.navTab.longClick(index);
    },
    // 加载更多 util.throttle为防抖函数
    lower1: util.throttle(function(e) {
      console.log('lower1');
      const page = this.pageInfo;
      const self = this;
      if (page.rownumber * page.pageNo >= page.total) {
        uni.showToast({
          title: '已经没有数据了...',
          icon: 'none'
        });
      } else {
        console.log(`加载${this.currentTab}`); //currentTab表示当前所在页数 根据当前所在页数发起请求并带上page页数
        let page = this.pageInfo;
        self.isRequest().then(res => {
          let tempList = self.list;
          tempList[self.currentTab] = tempList[self.currentTab].concat(res);
          console.log(tempList);
          self.list = tempList;
          self.$forceUpdate(); //二维数组，开启强制渲染
        });
      }
    }, 300),
    // 刷新touch监听
    refreshStart(e) {
      this.$refs.refresh.refreshStart(e);
    },
    refreshMove(e) {
      this.$refs.refresh.refreshMove(e);
    },
    refreshEnd(e) {
      this.$refs.refresh.refreshEnd(e);
    },
    isRefresh() {
      this.pageInfo = {
        pageNo: 1,
        rownumber: 10,
        total: 0
      };
      this.getList(this.currentTab);
      setTimeout(() => {
        uni.showToast({
          icon: 'success',
          title: '刷新成功'
        });
        this.$refs.refresh.endAfter(); //刷新结束调用
      }, 1000);
    }
  }
};
</script>

<style lang="scss" scoped>
uni-app,
uni-page-head {
  display: none;
}

.container999 {
  width: 100vw;
  font-size: 28upx;
  min-height: 100vh;
  overflow: hidden;
  color: #6b8082;
  position: relative;
  background-color: #f6f6f6;
}
.content {
  width: 100%;
  .text-sm {
    font-size: 30upx;
  }
}
.placehold {
  display: inline-block;
  width: 25upx;
  opacity: 0;
}
.card {
  width: 90%;
  height: 368upx;
  background-color: white;
  margin: 0 auto 42upx auto;
  background: #ffffff;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  position: relative;
}
.text-cut {
  font-size: 30upx;
  font-weight: bold;
}
.titleWrap {
  margin-bottom: 10upx;
}
.noCard {
  width: 90%;
  height: 200upx;
  margin: auto;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  box-shadow: 0 0 10upx 0 rgba(0, 0, 0, 0.1);
  border-radius: 10upx;
}
.nav {
  position: fixed;
  left: 0;
  top: 0;
  color: white;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  font-size: 24upx;
  background-color: #50b7ea;
  z-index: 996;
}

.searchInput999 {
  width: 90%;
  padding: 10upx;
  margin: 12upx auto;
  background: white;
  border-radius: 30upx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 66upx;
}
.line_action {
  display: flex;
  justify-content: flex-end;

  .btn {
    color: white;
    background-color: #8dc63f;
    border-radius: 20upx;
    padding: 0upx 18upx;
    font-size: 30upx;
    // width: 45upx;
    // height: 24upx;
  }
  .update_btn {
    background-color: #1cbbb4;
  }
  text-align: right;
}
.search999 {
  width: 32upx;
  height: 32upx;
}

.searchBox999 {
  width: 56upx;
  height: 56upx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.input999 {
  color: #999;
  width: 80%;
}
.navTabBox {
  font-size: 16px;
}
</style>
