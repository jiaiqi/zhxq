// 创建驱动actions可以使方法启动
export default {
  setSysViewCfg: ({commit}, payload) => {
    commit('sysViewCfg', payload.data)
  },
  showHeader: ({commit}) => {
    commit('showHeader')
  },
  hideHeader: ({commit}) => {
    commit('hideHeader')
  },
  showFooter: ({commit}) => {
    commit('showFooter')
  },
  hideFooter: ({commit}) => {
    commit('hideFooter')
  },
  showLoading: ({commit}) => {
    commit('showLoading')
  },
  hideLoading: ({commit}) => {
    commit('hideLoading')
  },
  showMenus: ({commit}) => {
    commit('showMenus')
  },
  hideMenus: ({commit}) => {
    commit('hideMenus')
  },
  showLeftBack: ({commit}) => {
    commit('showLeftBack')
  },
  hideLeftBack: ({commit}) => {
    commit('hideLeftBack')
  },
  logined: ({commit}, payload) => {
    commit('logined', payload)
  },
  setLogined: ({commit}, payload) => {
    commit('setLogined', payload)
  },
  selectByUser: ({commit}, payload) => {
    commit('selectByUser', payload)
  },
  setHeadrBar: ({commit}, payload) => {
    commit('setHeadrBar', payload)
  },
  setLoginMsg: ({commit}, payload) => {
    commit('setLoginMsg', payload)
  },
  setAuthorState: ({commit}, payload) => {
    commit('setAuthorState', payload)
  },
  setIsWeixinCient: ({commit}, payload) => {
    commit('setIsWeixinCient', payload)
  },
  setSrvCol: ({commit}, payload) => {
    commit('setSrvCol', payload)
  },
  setShowSearch: ({commit}, payload) => {
    commit('setShowSearch', payload.amount)
  },
  setOpenId: ({commit}, payload) => {
    commit('setOpenId', payload)
  }
}
