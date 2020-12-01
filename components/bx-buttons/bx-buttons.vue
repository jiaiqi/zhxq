<template>
  <view class="button-box">
    <view v-for="(item, index) in buttons" :key="index" class="button">
      <button v-if="item.display !== false" @click="onclick(item)" class="cu-btn bg-blue">{{ item.button_name }}</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'bx-button',
  props: {
    buttons: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    onclick(e) {
      this.$emit('on-button-change', e);
    }
  }
};
</script>

<style lang="less" scoped>
.button-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 200upx;
  background-color: #fff;
  padding: 0 20rpx;
  .button {
    flex: 1;
    display: flex;
    margin: 0 auto;
    padding-right: 20rpx;
    &:last-child{
      padding-right: 0;
    }
  }
  .bg-blue {
    background-color: #0bc99d;
    flex: 1;
  }
}
</style>
