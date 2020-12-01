<template>
  <view class="selector-wrap" :class="{ ' cu-timeline': !singleNode }">
    <view class="parent-node cu-item text-green animation-slide-top">
      <view class="parent-list" :class="{ 'single-parent': singleNode }">
        <view class="list-item" v-for="(item, index) in treeData" :key="index" @click="clickParentNode(item, index)">
          <!-- <view class="label" :class="item[nodeKey] === activeNode[nodeKey] ? 'active' : 'normal',index%2===0?'bg-blue':'bg-green'"> -->
          <view
            class="label"
            :class="{ active: item[nodeKey] === activeNode[nodeKey], 
            normal: item[nodeKey] !== activeNode[nodeKey]
             }"
          >
            {{ disColName && item[disColName] ? item[disColName] : srvInfo&&srvInfo.key_disp_col ? item[srvInfo.key_disp_col] : '暂无数据' }}
          </view>
        </view>
      </view>
    </view>
    <treeSelector
      :key="key"
      v-if="childNode.length > 0"
      :name="activeNode[nodeKey]"
      :treeData="childNode"
      :childNodeCol="childNodeCol"
      :disColName="disColName"
      @clickLastNode="clickLastNode"
      :nodeKey="nodeKey"
    ></treeSelector>
  </view>
</template>

<script>
export default {
  name: 'treeSelector',
  data() {
    return {
      activeNode: {},
      childNode: [],
      key: false
    };
  },
  props: {
    srvInfo: {
      type: Object,
      default: () => {}
    },
    treeData: {
      type: Array,
      default: () => {}
    },
    childNodeCol: {
      type: String,
      default: '_childNode'
    },
    disColName: {
      type: String,
      default: 'name'
    },
    nodeKey: {
      type: String,
      default: 'no'
    }
  },
	mounted() {
		console.log("srvInfo",this.srvInfo)
	},
  computed: {
    singleNode() {
      //是否没有子节点
      // return false
      if (this.treeData && Array.isArray(this.treeData)) {
        if (this.treeData.length === 0) {
          return true;
        } else {
          return this.treeData.filter(tree => tree._childNode && Array.isArray(tree._childNode) && tree._childNode.length > 0||(tree._childNode && Array.isArray(tree._childNode) &&tree._childNode.length === 0&&tree.parent_no!==null)).length > 0 ? false : true;
        }
      }
    }
  },
  methods: {
    onTree(e) {
      if (e.item._childNode.length === 0) {
        // this.$emit('clickLastNode', e);
      }
    },
    clickParentNode(item, index) {
      this.key = !this.key;
      if (item._childNode && item._childNode.length === 0) {
        this.$emit('clickLastNode', { item, index });
      } else if (item._childNode && item._childNode.length > 0) {
        if (this.activeNode[this.nodeKey] === item[this.nodeKey]) {
          this.activeNode = {};
          this.childNode = [];
        } else {
          this.activeNode = item;
          this.childNode = item[this.childNodeCol];
        }
      } else if(!item._childNode){
        this.$emit('clickLastNode', { item, index });
      }
      this.$emit('clickParentNode', { item, index });
    },
    clickLastNode(e) {
      //点击最底层节点
      if (e.item._childNode.length === 0) {
        this.$emit('clickLastNode', e);
      }
    }
  },
  treeData: {
    handler: function(nVal, oVal) {
      console.log('newVal', nVal);
      this.childNode.length = 0;
      this.activeNode = {};
    },
    deep: true
  }
};
</script>

<style scoped lang="scss">
.cu-timeline > .cu-item::before {
  // background-color: #efefef;
}
.cu-timeline > .cu-item::after {
  background-color: #39b54a;
  // background-color: #999;
}
.cu-timeline > .cu-item {
  padding: 5px 15px 5px 60px;
}
.cu-timeline {
  // background-color: #efefef;
}
.left-timeline {
  &::before {
    font-family: 'cuIcon';
    display: block;
    position: absolute;
    top: 18px;
    z-index: 9;
    background-color: #ffffff;
    width: 25px;
    height: 25px;
    text-align: center;
    border: none;
    line-height: 25px;
    left: 18px;
    content: '⚪';
  }
  &::after {
    content: '';
    display: block;
    position: absolute;
    width: 0.5px;
    background-color: #ddd;
    left: 30px;
    height: 50%;
    top: 0;
    z-index: 8;
  }
}

.selector-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  // padding: 20px 0;
  width: 100%;
  // max-height: calc(100vh - 100px);
  // overflow-y: scroll;
  .parent-node {
    display: flex;
    width: 100%;

    .line-box {
      width: 30upx;
      // height: 100upx;
      flex: 1;
    }
  }
  .parent-list {
    max-height: 800upx;
    overflow-y: scroll;
    width: 100%;
    background-color: #fff;
    min-height: 200upx;
    border-radius: 20upx;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    color: #333;
    box-shadow: 3px 3px 5px rgba($color: #333, $alpha: 0.5);
    .list-item {
      box-sizing: border-box;
      .label {
        padding: 10upx 20upx;
        margin: 10upx;
        // border: 1px solid #0081ff;#39b54a
        border: 1px solid #39b54a;
        border-radius: 20upx;
        &.active {
          background-color: #39b54a;
          // background-color: #0081ff;
          color: #fff;
        }
        &.normal {
          box-sizing: border-box;
        }
      }
    }
    &.single-parent {
      max-height: 80vh;
      padding: 10upx 10upx 20upx;
      box-shadow: none;
      overflow: scroll;
      z-index: 9999;
      .list-item {
        width: 50%;
        text-overflow: ellipsis;
        .label {
          border: none;
          background-color: #efefef;
          border-radius: 5px;
        }
      }
    }
  }
}
[class*='animation-'] {
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: both;
}
.animation-slide-top {
  animation-name: slide-top;
}
.animation-slide-bottom {
  animation-name: slide-top;
  animation-direction: reverse;
}
@keyframes slide-top {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  50% {
    opacity: 0.1;
    transform: translateY(-50%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
