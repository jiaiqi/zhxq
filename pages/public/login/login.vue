<template>
  <view class="content">
    <view class="login-bg">
      <view class="login-card">
        <view class="login-head">登录</view>
        <view class="login-input login-margin-b"><input type="text" placeholder="请输入账号" v-model="user_no" /></view>
        <view class="login-input"><input type="text" placeholder="请输入密码" v-model="password" /></view>
        <view class="login-function">
          <view class="login-forget" @click="go_forget">忘记密码</view>
          <view class="login-register" @click="go_register">快速注册></view>
        </view>
      </view>
    </view>
    <view class="login-btn"><button class="landing" type="primary" @click="toLogin">登录</button></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello',
      app_no: 'APPNO20200115100113',
      openid: '',
      user_no: '',
      password: ''
    };
  },
  onLoad(option) {
    if (option.openid) {
      this.openid = option.openid;
    }
    
  },
  methods: {
    
    toLogin() {
      let url = '';
      // #ifdef MP-WEIXIN
      url = this.getServiceUrl('wx', 'srvwx_app_login', 'operate');
      let req = [
        {
          data: [
            {
              app_no: this.app_no,
              type: '小程序',
              openid: this.openid,
              user_no: this.user_no,
              pwd: this.password
            }
          ],
          serviceName: 'srvwx_app_login'
        }
      ];
      this.$http.post(url, req).then(res => {
        console.log('res.data:', res.data);
      });
      // #endif
      // #ifdef H5
      // 浏览器内登录
      const isWeixin = this.isWeixinClient();
      if (isWeixin) {
        // 如果在微信环境 即公众号
        
      } else {
        // 浏览器环境
        url = this.getServiceUrl('sso', 'srvuser_login', 'operate');
        let reqs = [{ serviceName: 'srvuser_login', data: [{ user_no: this.user_no, pwd: this.password }] }];
        this.$http.post(url, reqs).then(res => {
          console.log('res.data:', res.data);
          if (res.data.resultCode === 'SUCCESS') {
            let resData = res.data.response[0].response;
            let expire_timestamp = parseInt(new Date().getTime() / 1000) + resData.expire_time; //过期时间的时间戳(秒数)
            uni.setStorageSync('is_login', true); // 登录状态
            uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
            sessionStorage.setItem('bx_auth_ticket', resData.bx_auth_ticket);
            uni.setStorageSync('expire_time', resData.expire_time); // 过期间隔
            uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
            uni.setStorageSync('login_user_info', resData.login_user_info); //登录信息
            uni.navigateTo({
              url: '../index/index'
            });
          } else {
            uni.setStorageSync('is_login', false); // 登录状态
            uni.showToast({
              content: res.data.resultMessage
            });
          }
        });
      }
      // #endif
    },
    go_forget() {
      uni.navigateTo({
        url: './forget'
      });
    },
    go_register() {
      uni.navigateTo({
        url: './register'
      });
    }
  }
};
</script>

<style>
.landing {
  height: 84upx;
  line-height: 84upx;
  border-radius: 44upx;
  font-size: 32upx;
  background: linear-gradient(left, #0bc99d, #0bc99d);
}
.login-btn {
  padding: 10upx 20upx;
  margin-top: 350upx;
}
.login-function {
  overflow: auto;
  padding: 20upx 20upx 30upx 20upx;
}
.login-forget {
  float: left;
  font-size: 26upx;
  color: #999;
}
.login-register {
  color: #666;
  float: right;
  font-size: 26upx;
}
.login-input input {
  background: #f2f5f6;
  font-size: 28upx;
  padding: 10upx 25upx;
  height: 62upx;
  line-height: 62upx;
  border-radius: 8upx;
}
.login-margin-b {
  margin-bottom: 25upx;
}
.login-input {
  padding: 10upx 20upx;
}
.login-head {
  font-size: 34upx;
  text-align: center;
  padding: 25upx 10upx 55upx 10upx;
}
.login-card {
  background: #fff;
  border-radius: 12upx;
  padding: 10upx 25upx;
  box-shadow: 0 6upx 18upx rgba(0, 0, 0, 0.12);
  position: relative;
  margin-top: 120upx;
}
.login-bg {
  height: 260upx;
  padding: 25upx;
  background: linear-gradient(#0bc99d, #0bc99d);
}
</style>
