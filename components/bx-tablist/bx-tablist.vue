<template>
  <view class="tab-list" v-if="cateList.length > 0&&contList.length>0">
    <view class="tab-view" v-if="!onlyList">
      <view class="tab-item  " :class="index === TabCur ? 'current-tab' : ''" :data-id="index" v-for="(cate, index) in cateList" :key="index" @tap="tabSelect($event, cate)">
        <view v-if="cate && cate.tablist_name" class="tab-title">{{ cate.tablist_name }}</view>
      </view>
    </view>
    <view class="content-view">
      <view class="news-list " v-for="list in contList" :key="list.id" @click="clickListItem(list)">
        <!-- 单图布局 -->
        <view class="news-list-item single-image left-image animation-slide-left" v-if="list[contentTemplate['imgCol']]">
          <image :src="list.picUrl" mode="" class="image" v-if="list.picUrl"></image>
          <!-- <image src="../../static/img/loading-1.gif" mode="" class="image" v-if="!list.picUrl"></image> -->
          <view class="content">
            <view class="title">{{ list[contentTemplate['titleCol']] }}</view>
            <view class="text">{{ list[contentTemplate['dateCol']] }}</view>
          </view>
        </view>
        <!-- 单行 纯文本布局 -->
        <view class="news-list-item none-image animation-slide-left" v-if="!list[contentTemplate['imgCol']]">
          <view class="content">
            <view class="title">{{ list[contentTemplate['titleCol']] }}</view>
            <view class="text"></view>
          </view>
        </view>
      </view>
      <view class=""><button class="bg-blue light" v-if="page.total > 5" @click="showMore">更多</button></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabList',
  data() {
    return {
      TabCur: 0, //当前tab
      scrollLeft: 0,
      cateList: [], //分类列表
      contList: [], //内容列表
      currentTab: {}, //当前分类
      page: {
        total: 0,
        rownumber: 5,
        pageNo: 1
      }
    };
  },
  props: {
    srvApp: {
      //服务对应的app
      type: String,
      required: true,
      default: 'daq'
    },
    cateService: {
      //分类服务名
      type: String,
      required: true,
      default: 'srvdaq_page_item_tablist_select'
    },
    contentService: {
      // 内容服务名
      type: String,
      required: true,
      default: 'srvdaq_cms_content_select'
    },
    contentTemplate: {
      //内容模板
      type: Object,
      default: () => {
        return {
          imgCol: 'icon_image',
          titleCol: 'title',
          dateCol: 'create_time'
        };
      }
    },
    pageItem: {
      //页面项数据
      type: Object,
      default: () => {}
    },
    onlyList: {
      // 当前页面是否只显示list
      type: Boolean,
      default: false
    }
  },
  methods: {
    clickListItem(e) {
      // //点击列表项
      // console.log('点击了列表项,', e);
      this.$emit('clickListItem', e);
    },
    tabSelect(e, item) {
      //点击tab
      this.TabCur = Number(e.currentTarget.dataset.id);
      this.currentTab = this.cateList[this.TabCur];
      this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
      console.log('点击了Tab,', e, item);
      this.getContList(item.no);
    },
    /**
     * 获取分类列表
     */
    async getCateList() {
      uni.showLoading({
        mask: true
      });
      const url = this.getServiceUrl(this.srvApp, this.cateService, 'select');
      const req = { serviceName: this.cateService, colNames: ['*'], condition: [{ colName: 'item_no', ruleType: 'eq', value: this.pageItem.item_no }] };
      let res = await this.$http.post(url, req);
      uni.hideLoading();
      if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
        let data = res.data.data;
        this.cateList = data;
        return data;
      }
    },
    /**
     * 获取内容列表
     * @param {String} cate_no -分类编号
     */
    async getContList(cate_no) {
      uni.showLoading({
        mask: true
      });
      const url = this.getServiceUrl(this.srvApp, this.contentService, 'select');
      const req = { serviceName: this.contentService, colNames: ['*'], condition: [{ colName: 'no', value: cate_no, ruleType: 'eq' }], page: { rownumber: 5 } };
      let res = await this.$http.post(url, req);
      uni.hideLoading();
      if (res.data.state === 'SUCCESS' && res.data.data.length >= 0) {
        this.page = res.data.page;
        let data = res.data.data;
        this.contList = data;
        data.forEach((item, index) => {
          item['picUrl'] = this.$api.serverURL + '/file/download?fileNo=' + item.icon_image;
          this.$set(data, index, item);
          // this.getPictureUrl(item.icon_image).then(url => {
          //   item['picUrl'] = url;
          //   this.$set(data, index, item);
          //   this.contList = data;
          // });
        });
        // this.contList = data;
        return data;
      }
    },
    showMore() {
      this.$emit('showMore', this.currentTab);
    },
    /**
     * 根据文件编号查找对应文件url
     * @param {String} file_no -文件编号
     */
    async getPictureUrl(file_no) {
      const serviceName = 'srvfile_attachment_select';
      const url = this.getServiceUrl('file', serviceName, 'select');
      const req = {
        serviceName: serviceName,
        colNames: ['*'],
        condition: [{ colName: 'file_no', value: file_no, ruleType: 'eq' }]
      };
      if (file_no !== null && file_no !== '' && file_no !== undefined) {
        let res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          const data = res.data.data[0];
          if (data) {
            const fileurl = this.$api.srvHost + '/file/download?filePath=' + data.fileurl+'&bx_auth_ticket='+uni.getStorageSync('bx_auth_ticket');
            return fileurl;
          }
        }
      }
    }
  },
  watch: {
    contList: {
      deep: true,
      handler(newValue, oldValue) {}
    }
  },
  mounted() {
    if (!this.onlyList) {
      this.getCateList().then(data => {
        if (data && data.length > 0) {
          this.getContList(data[0].no);
          this.currentTab = this.cateList[0];
        }
      });
    } else {
      if (this.pageItem.cate_no) {
        this.getContList(this.pageItem.cate_no);
      }
    }
  }
};
</script>

<style lang="scss">
.tab-list {
  width: 100%;
  min-height: 400upx;
  max-height: 1200upx;
  background-color: #fff;
  // border-radius: 20upx;
  padding-top: 20upx;
  overflow: hidden;
  margin: 0upx auto 20upx;
  .tab-view {
    align-items: center;
    display: flex;
    padding-left: 20upx;
    .tab-item {
      // border: 1px solid #ff9700;
      // border-left: 1px solid #0BC99D;
      min-width: 150upx;
      padding: 0 20upx;
      height: 60upx;
      line-height: 60upx;
      text-align: center;
      &:first-child {
        // border-top-left-radius: 20upx;
        // border-bottom-left-radius: 20upx;
        border-right: none;
      }
      &:last-child {
        // border-top-right-radius: 20upx;
        // border-bottom-right-radius: 20upx;
        border-left: none;
      }
    }
    .current-tab {
      border-left:2px solid #0BC99D ;
      // background-color: #ff9700;
      color: #333;
      position: relative;
      .tab-title{
		  min-height:30px;
		  line-height: 30px;
      &::before{
        content: '';
        height: 16px;
        width: 10rpx;
        color: #0BC99D;
        border-left: 8rpx solid #0BC99D;
        position: absolute;
        left: 0rpx;
        top: calc(50% - 8px);

      }
      }
    }
  }
  .content-view {
  }
  .news-list {
    width: 100%;
    padding: 20upx 0;
    display: flex;
    .news-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      &.none-image {
        line-height: 40upx;
        position: relative;
        text-indent: 40upx;
        &::before {
          content: '';
          width: 10upx;
          height: 10upx;
          border-radius: 50%;
          color: #333;
          left: 20upx;
          top: calc(50% - 5upx);
          position: absolute;
          background-color: #333;
        }
      }
      &.single-image {
        width: calc(100% - 40upx);
        margin: 0 auto;
        .image {
          width: 200upx;
          height: 150upx;
          margin-right: 20upx;
          border-radius: 12upx;
        }
        .content {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 0;
          flex: 1;
          height: 160upx;
          // max-width: 520upx;
          .title {
            font-weight: 600;
            height: auto;
            overflow: hidden;
          }
          .text {
            width: 95%;
            max-height: 120upx;
            font-size: 24upx;
            color: #666;
            padding-top: 10upx;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }
      .content {
        flex: 1;
        line-height: 40upx;
        padding: 10upx;
      }
    }
  }
}
[class*='animation-'] {
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: both;
}
.animation-fade {
  animation-name: fade;
  animation-duration: 0.8s;
  animation-timing-function: linear;
}
.animation-slide-top {
  animation-name: slide-top;
}
.animation-slide-bottom {
  animation-name: slide-bottom;
}
.animation-slide-left {
  animation-name: slide-left;
}
.animation-slide-right {
  animation-name: slide-right;
}
@keyframes fade {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
@keyframes slide-top {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slide-bottom {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slide-left {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slide-right {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
