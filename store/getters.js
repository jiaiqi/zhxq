// 创建可以获取状态信息的方法
export default {
  getSysViewCfg: (state) => {
    return state.sysViewCfg
  },
  headerShow: (state) => {
    return state.headShow
  },
  showLoading: (state) => {
    return state.loading
  },
  footerShow: (state) => {
    return state.footerShow
  },
  showMenus: (state) => {
    return state.showMenus
  },
  showLeftBack: (state) => {
    return state.showLeftBack
  },
  onLogin (state) {
    return state.userInfo.user_info
  },
  logined (state) {
    return state.userInfo.logined
  },
  selectByUser (state) {
    if (state.parentMenu) {
      return state.parentMenu
    } else {
      return null
    }
  },
  getLoginMsg (state) {
    if (state.loginMsg.bxssocookieid !== '') {
      return state.loginMsg
    } else {
      return state.loginMsg
    }
  },
  getHeadrBar (state) {
    if (state.headrBar) {
      return state.headrBar
    } else {
      return null
    }
  },
  getAuthorState (state) {
    if (state.AuthorState !== '') {
      return state.AuthorState
    } else {
      return false
    }
  },
  getIsWeixinCient (state) {
    if (state.isWeixinCient !== '') {
      return state.AuthorState
    } else {
      return false
    }
  },
  getSrvCol (state) {
    return state.srvCol
  },
  getShowSearch (state) {
    return state.showSearch
  },
  getAppInfo(state) {
    return state.appInfo
  },
  getLoginState(state) {
    return state.is_login
  },
  getOpenid(state) {
    return state.openid
  },
  getTicket(state) {
    return state.bx_auth_ticket
  },
  getExpireDate(state) {
    return state.expire_timestamp
  },
  getUserInfo(state) {
    return state.testvuex
  },
  getVisitorInfo(state) {
    return state.visiter_user_info
  },
  getAuthorState(state) {
    return state.author_state
  },
  getUserType(state, user_type) {
    return state.user_type
  },
  getClientType(state, client_type) {
    return state.client_type
  },
  getClientEnv(state, client_env) {
    return state.client_env
  }
}
