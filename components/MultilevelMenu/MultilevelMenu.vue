<template>
  <view class="multilevel-menu">
    <view class="menu-item animation-slide-left" v-for="(menu, index) in listData" :key="index">
      <view class="menu-title ">
        <text class="lg text-green icon cuIcon-add margin-right-xs" v-if="menu._childNode.length > 0 && !menu.showChild" @click="showChildNode(menu, index)"></text>
        <text class="lg text-blue icon cuIcon-refresharrow margin-right-xs" v-if="menu._childNode.length > 0 && menu.showChild" @click="showChildNode(menu, index)"></text>
        <text
          class="label padding  radius text-center shadow-blur"
          :class="{
            'margin-left': menu._childNode.length === 0,
            'bg-blue': menu.no === activeNode.no,
            'bg-gradual-green': menu.no !== activeNode.no
          }"
          @click="clickMenu(menu, index)"
        >
          {{ menu.name }}
        </text>
      </view>
      <view class="menu-children" v-if="menu._childNode.length > 0 && menu.showChild">
      <MultilevelMenu :menuList="menu._childNode"
      @clickLastNode="clickLastNode"
      ></MultilevelMenu></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MultilevelMenu', //多级菜单
  data() {
    return {
      listData: [],
      showChild: true,
      activeNode: {}
    };
  },
  props: {
    menuList: {
      type: Array,
      default: () => {
        [];
      }
    },
    keyColumn: {
      type: String,
      default: ''
    },
    labelColumn: {
      type: String,
      default: ''
    },
    childColumn: {
      type: String,
      default: ''
    }
  },
  methods: {
    clickMenus(menu, index){
      // if (menu['_childNode'].length > 0) {
      //   console.log('clickMenus：', menu,index);
      //   this.$emit('clickMenu', menu,index);
      // } else if(menu['_childNode'].length===0){
      //   this.clickLastNode(menu);
      // }
    },
    clickMenu(menu, index) {
      console.log('clickMenu：', menu,index);
      this.showChildNode(menu, index);
      if (menu['_childNode'].length > 0) {
        console.log('clickMenu：', menu);
        this.$emit('clickMenu', menu,index);
      } else if(menu['_childNode'].length===0){
        this.clickLastNode(menu);
      }
    },
    clickLastNode(menu) {
    	console.log('clickLastNode：', menu);
    	this.$emit('clickLastNode', menu);
    },
    showChildNode(menu, index) {
      let listData = JSON.parse(JSON.stringify(this.listData));
      this.listData.map((item, itemIndex) => {
        if (menu.no === item.no) {
          item.showChild = !item.showChild;
          if (item.showChild) {
            this.activeNode = menu;
          } else {
            this.activeNode = {};
          }
        } else {
          item.showChild = false;
        }
        this.$set(this.listData, itemIndex, item);
      });
    }
  },
  watch: {
    menuList: {
      deep: true,
      immediate: true,
      handler(newValue, oldValue) {
        let list = newValue.map(item => {
          item['showChild'] = false;
          return item;
        });
        this.listData = list;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.multilevel-menu {
  width: 95%;
  margin: 0 auto;
  // display: flex;
  .menu-item {
    .menu-title {
      width: 100%;
      line-height: 50upx;
      display: flex;
      align-items: center;
      .icon {
        font-size: 40upx;
        padding-right: 10upx;
      }
      .label {
        display: inline-block;
        margin-left: 20upx;
        padding: 0 40upx;
        margin: 10upx 0;
        min-width: 120upx;
        min-height: 60upx;
        line-height: 60upx;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
        &.margin-left {
          margin-left: 60upx;
        }
        &:active {
          transform: translate(2px, 2px);
        }
      }
    }
  }
  .menu-children {
    width: 100%;
    padding-left: 40upx;
    .menu-title {
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
