// import { HEAD_SHOW_SUCCESS, HEAD_SHOW_FAIL, HIDE_LOADING, SHOW_LOADING, FOOTER_HIDE, FOOTER_SHOW, ON_LOGIN } from './type'
// 创建基本状态
import getters from './getters'

const state = {
	openid: null,
	is_login: false, //登录状态 Boolean
	bx_auth_ticket: "", // token String
	expire_timestamp: 0, // 过期截止时间 Number
	login_user_info: null, // 登录用户信息 Object
	visiter_user_info: null, // 匿名用户信息 Object
	author_state: false, // 微信授权状态 Boolean
	user_type: '游客', // 用户类型 String 游客(浏览器环境)/登录用户/匿名用户(微信环境)
	client_type: 'browser', //客户端类型 android||ios||browser
	client_env: 'web', // 客户端所在环境 wxmp(微信小程序)||wxh5(公众号)||web(网页)||app
	// 原有分割线
  headShow: true,   // 是否显示头部
  loading: true,   // 是否显示loading
  footerShow: true,   // 是否显示底部导航
  showMenus: false,    // 是否显示菜单
  showLeftBack: false,  // 是否显示返回
  AuthorState: false,  // 授权状态
  isWeixinCient: false, // 是否在微信
  userInfo: {
    logined: false,   // 授权登陆状态
    user_info: {
      user_no: '',
      dept_no: '',
      email: '',
      mobile: '',
      user_disp: '',
      real_name: ''
    }
  },
  appInfo: [{
    appId: 'wx78d1d4139f97ffca',
    secret: '3271e13ac4246495d982dc5b6f50f749'
  }],
  // openid: '',  // o9ioVwiMfUq9VEkjGQp4jDx9_N-4   o9ioVwteA3RXnjdK00i8MYW6Pob8
  sysViewCfg: Object, // 系统基本配置信息 logo | 名称
  srvCol: [], // 组件共享的srv_col
  templateCfg: {}, //
  loginMsg: {      // 授权登陆服务器信息
    bxssocookieid: '',
    listdomain: []
  },
  parentMenu: [],  // 模块数据
  openMenu: [],
  headrBar: {
    buttons: [],
    menus: [],
    showMenus: false
  }, // 表头按钮
  showSearch: false
}

const mutations = {
  sysViewCfg (state, data) {
    state.sysViewCfg = data
  },
  showHeader (state) {
    state.headShow = true
  },
  hideHeader (state) {
    state.headShow = false
  },
  showFooter (state) {
    state.footerShow = true
  },
  hideFooter (state) {
    state.footerShow = false
  },
  showLoading (state) {
    state.loading = true
  },
  hideLoading (state) {
    state.loading = false
  },
  showMenus (state) {
    state.showMenus = true
  },
  hideMenus (state) {
    state.showMenus = false
  },
  showLeftBack (state) {
    state.showLeftBack = true
  },
  hideLeftBack (state) {
    state.showLeftBack = false
  },
  setLogined (state, loginInfo) {
    if (loginInfo.amount.logined) {
      if (loginInfo.amount.user_info) {
        state.userInfo.logined = loginInfo.amount.logined
        state.userInfo.user_info = loginInfo.amount.user_info
      } else {
        state.userInfo.logined = loginInfo.amount.logined
        state.userInfo.user_info = {
          user_no: '',
          dept_no: '',
          email: '',
          mobile: '',
          user_disp: '',
          real_name: ''
        }
      }
      state.userInfo.logined = loginInfo.amount.logined
      console.log(loginInfo.amount.logined)
    } else {
      state.userInfo.logined = loginInfo.amount.logined
      console.log(loginInfo.amount.logined)
      state.userInfo.user_info = {
        user_no: '',
        dept_no: '',
        email: '',
        mobile: '',
        user_disp: '',
        real_name: ''
      }
    }
  },
  setLoginMsg (state, loginMsg) {
    if (loginMsg.amount.bxssocookieid) {
      state.loginMsg.bxssocookieid = loginMsg.amount.bxssocookieid
      state.loginMsg.listdomain = loginMsg.amount.listdomain
    } else {
      state.loginMsg.bxssocookieid = ''
      state.loginMsg.listdomain = []
    }
  },
  selectByUser (state, datas) {
    state.parentMenu = datas.amount
  },
  setHeadrBar (state, list) {
    state.headrBar = list.data
  },
  setAuthorState (state, data) {
    state.AuthorState = data
  },
  setIsWeixinCient (state, data) {
    console.log('当前微信状态' + data)
    state.isWeixinCient = data
  },
  setSrvCol (state, data) {
    state.srvCol.push(data)
  },
  delSrvCol (state, data) {
    let fils = state.srvCol.filter(item => item.service_name !== data)
    state.srvCol = fils
  },
  setShowSearch (state, data) {
    state.showSearch = data
  },
  setOpenId (state, data) {
    state.openid = data
  },
  setLoginState(state, is_login) {
    state.is_login = is_login;
  },
  setTicket(state, ticket) {
    state.bx_auth_ticket = ticket
  },
  setExpireDate(state, expire_timestamp) {
    state.expire_timestamp = expire_timestamp
  },
  setUserInfo(state, login_user_info) {
    state.testvuex = false
  },
  setVisitorInfo(state, visitorInfo) {
    state.visiter_user_info = visitorInfo
  },
  setAuthorState(state, author_state) {
    state.author_state = author_state
  },
  setUserType(state, user_type) {
    state.user_type = user_type
  },
  setClientType(state, client_type) {
    state.client_type = client_type
  },
  setClientEnv(state, client_env) {
    state.client_env = client_env
  }
}

export default {
  state,
  mutations,
  getters
}
