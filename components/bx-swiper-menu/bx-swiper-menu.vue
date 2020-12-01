<template>
  <view class="menu-list">
    <view class="item_label" v-if="menuLabel">
      <view class="text">{{ menuLabel }}</view>
    </view>

    <view class="bg-white  menu-item" v-if="menus&&Array.isArray(menus)&&menus.length <= 10">
      <view
        :class="{ 'bg-imgs': !item.icon, 'menu-image': item.icon }"
        v-for="(item, index) in menus"
        :key="index"
        :style="{ width:gridWidth&&gridWidth<=5?100/gridWidth+'%': menus.length === 5 || menus.length > 8 ? '20%' : '25%' }"
      >
        <!-- <view class="menu-pic bg-blue" @click="clickMenu(item)" v-if="!item.icon">{{ item[menuTemplate['lableCol']].slice(0, 2) }}</view> -->
        <view class="menu-pic" @click="clickMenu(item)" v-if="item.icon">
          <image class="picture" :src="urls + item.icon" mode=""></image>
        </view>
        <view class="label">{{ item[menuTemplate['lableCol']] }}</view>
      </view>
    </view>
    <swiper
      class="round-dot"
      :indicator-dots="false"
      :circular="true"
      :autoplay="false"
      interval="5000"
      duration="500"
      style="height: auto;max-height: 380upx;overflow: hidden;"
      v-if="menus&&Array.isArray(menus)&&menus.length > 10"
    >
      <swiper-item>
        <view class="bg-white  menu-item" v-if="menus&&Array.isArray(menus)&&menus.length <= 10">
          <view
            :class="{ 'bg-imgs': !item.icon, 'menu-image': item.icon }"
            v-for="(item, index) in menus"
            :key="index"
            :style="{ width: menus.length === 5 || menus.length > 8 ? '20%' : '25%' }"
          >
            <view class="menu-pic bg-blue" @click="clickMenu(item)" v-if="!item.icon">{{ item[menuTemplate['lableCol']].slice(0, 2) }}</view>
            <view class="menu-pic" @click="clickMenu(item)" v-if="item.icon">
              <image class="picture" :src="urls + item.icon" mode=""></image>
            </view>
            <view class="label">{{ item[menuTemplate['lableCol']] }}</view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // menuList:[],
      // menus:[]
    };
  },
  props: {
    menuList: {
      type: Array,
      default: () => {
        [];
      }
    },
    menuLabel: {
      type: String,
      default: ''
    },
		gridWidth:{
			type: Number,
			default: 0
		},
    menuTemplate: {
      type: Object,
      default: () => {
        return {
          lableCol: 'dest_menu_no'
        };
      }
    }
  },
  computed: {
    menus() {
      //菜单数量小于5 一行4个
      //菜单数量等于5 一行5个
      //菜单数量在5-8之间 一行4个
      //菜单数量在8-10之间 一行5个
      if (Array.isArray(this.menuList) && this.menuList.length > 10) {
        return this.menuList.slice(0, 10);
      } else if (Array.isArray(this.menuList) && this.menuList.length <= 10) {
        return this.menuList;
      }
    },
	urls(){		
		return this.$api.backEndAddress + '/main/images/appicon/'
	}
  },
  watch: {
    menuList: {
      deep: true,
      immediate: true,
      handler(newValue, oldValue) {
        if (Array.isArray(newValue) && newValue.length > 8) {
          // this.menus = newValue.slice(0,8)
        }
      }
    }
  },
  methods: {
    clickMenu(e) {
      this.$emit('clickMenu', e);
    }
  }
};
</script>

<style scoped lang="scss">
.screen-swiper {
  margin: 20upx auto;
  background-color: #fff;
  overflow: hidden;
  width: 100%;
}
.menu-list {
  margin-top: 20rpx;
}
.item_label {
  padding: 20rpx;
  background-color: #fff;
  .text {
    text-indent: 10upx;
    border-left: 4px solid #e54d42;
    line-height: 40upx;
    font-size: 30upx;
  }
}
.menu-item {
  display: flex;
  box-sizing: border-box;
  flex-wrap: wrap;
  padding-top: 20rpx;
  .menu-image {
    width: 25%;
    min-height: 180upx;
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: space-around;
    .menu-pic {
      .picture {
        width: 100upx;
        height: 100upx;
      }
    }
    .label {
      line-height: 50upx;
      margin-top: 10upx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      // font-size: .16rem;
    }
  }
  .bg-imgs {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 10upx;
    width: 22%;
    max-width: 100px;
    .menu-pic {
      width: 100upx;
      height: 100upx;
      border-radius: 20upx;
      font-size: 30upx;
      margin: 0 auto;
      justify-content: center;
      align-items: center;
      display: flex;
      font-family: '黑体';
      // background-color: #409EFF;
      z-index: 1;
      &::before {
        content: '';
        position: absolute;
        width: 100upx;
        height: 100upx;
        // opacity: 1;
        background: rgba($color: #0081ff, $alpha: 0.8);
        transform: translate(3px, 4px);
        border-radius: 20upx;
        z-index: -1;
        box-shadow: 10px 10px 22px 2px rgba(0, 0, 100, 0.2);
      }
      &:active {
        transform: translate(2px, 2px);
      }
    }
    .label {
      line-height: 50upx;
      margin-top: 10upx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      // font-size: .16rem;
    }
  }
}
</style>
