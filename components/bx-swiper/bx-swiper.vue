<template>
  <view class="carousel-view">
    <swiper class="screen-swiper" :class="dotStyle ? 'square-dot' : 'round-dot'" :indicator-dots="true" :circular="true" :autoplay="true" interval="5000" duration="500">
      <swiper-item v-for="(item, index) in swiperList" :key="index" @click="clickSwiper(item)">
        <image :src="item[imgCol]" mode="aspectFill" v-if="item[imgCol]"></image>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  data() {
    return {
      dotStyle: true
    };
  },
  props: {
    imgCol: {
      type: String,
      required:true,
      default: 'picUrl'
    },
    swiperList: {
      type: Array,
      default: () => {
        [];
      }
    }
  },
  methods: {
    clickSwiper(e) {
      this.$emit('clickSwiper', e);
    }
  }
};
</script>

<style lang="scss">
.carousel-view {
  background-color: #fff;
  // border-bottom-left-radius: 20upx;
  // border-bottom-right-radius: 20upx;
  // width: 750upx;
  width: 100%;
  min-width: 750upx;
  margin: 0 auto;
  overflow: hidden;
}
// @media screen and (min-width: 750px){
//   .carousel-view {
//     background-color: #fff;
//     // border-bottom-left-radius: 20upx;
//     // border-bottom-right-radius: 20upx;
//     max-width: 1366px;
//     min-width: 500px;
//     max-height: 370px;
//     margin: 0 auto;
//     overflow: hidden;
//   }
// }
</style>
