// 把所有api的url统一在一起并挂在到vue对象上
// 所有接口都在一个文件里会比较大
let remoteAddress = {
	// ssourl: 'http://www.100xsys.cn', // 微信登陆sso 端口
	// ssoAddress: 'http://sso.100xsys.cn',
	// serviceAddress: 'https://zhxq.100xsys.cn', // http://login.100xsys.cn 接口地址srvms.100xsys.cn
	serviceAddress: 'https://srvms.100xsys.cn', // http://login.100xsys.cn 接口地址srvms.100xsys.cn
	// serviceAddress: 'https://qq.prochanges.cn:11443', // http://login.100xsys.cn 接口地址srvms.100xsys.cn
	// frontEndAddress: 'https://wx2.100xsys.cn',
	singleApp: true, // 是否单应用， true 时 所有请求均使用 appName 配置
	appName: "daq", //singleApp 为 true 时 必须配置
	bx_auth_ticket: "e2cc16a3-6a87-42da-ae5f-99a6af84c5f8",
	onTicket: false, // 是否使用配置的静态 bx_auth_ticket
	homePath:"/pages/public/sitePage/sitePage", // 首页路径，配置完整路径
	// homePath: "/pages/public/index/index?website_no=WS2021040620510017&page_no=BX202104062056350036",
	// homePath:"/pages/public/index/index", // 首页路径，配置完整路径
	isThirdParty: true, // 是否必须第三方认证登录
	thirdPartyType: ['WeChat'], // 第三方类型
	// homePath:"/pages/specific/home/home", // 首页路径， 配置完整路径
}


let ENV = {
	backEndAddress: "https://login.100xsys.cn", //后台管理系统地址
	frontEndAddress: remoteAddress.frontEndAddress, //前端线上地址
	appNo: {
		// wxmp: 'APPNO20200706143751', //海纳小区小程序
		// wxmp:'APPNO20200728153113', //海纳小程序外网
		// wxmp: 'APPNO20200214122021', //百想助理小程序
		wxmp: "APPNO20210413095640", // 百想智慧小区
		wxh5: 'APPNO20200107181133', //百想助理公众号
	},
	appID: {
		// wxmp: 'wxce3602949765245f', //海纳小区小程序AppID
		// wxmp: 'wx8e6f993081f6e979', //百想助理小程序
		wxmp: 'wx93d6f482fb65baed', //百想智慧小区小程序
		wxh5: ''
	},
	isThirdParty: remoteAddress.isThirdParty,
	homePath: remoteAddress.homePath, // 应用业务的入口页面 首页。
	singleApp: remoteAddress.singleApp, // 是否单应用
	appName: remoteAddress.appName, // 服务 app
	getAuthorization: { //获取公众号授权
		url: remoteAddress.serviceAddress + '/wx/operate/srvwx_public_page_authorization',
		serviceName: 'srvwx_public_page_authorization'
	},
	verifyLogin: { //公众号/小程序验证登录
		url: remoteAddress.serviceAddress + '/wx/operate/srvwx_app_login_verify',
		serviceName: 'srvwx_app_login_verify'
	},
	accountLogin: { //公众号/小程序账号登录
		url: remoteAddress.serviceAddress + '/wx/operate/srvwx_app_login',
		serviceName: 'srvwx_app_login'
	},
	getSignature: remoteAddress.serviceAddress + '/wx/select/srvwx_app_signature_select', //获取js-sdk签名
	getUserInfo: remoteAddress.serviceAddress + '/wx/select/srvwx_basic_user_info_select', //获取用户信息
	saveShareRecord: remoteAddress.serviceAddress + '/daq/add/srvdaq_record_share_add', //保存微信分享记录
	downloadFile: remoteAddress.serviceAddress + '/file/download?fileNo=', // 根据fileNo直接下载图片，不用查找filePath
	bindWxUser: remoteAddress.serviceAddress + "/wx/operate/srvwx_user_bind", // 绑定已有帐号
	unbindWxUser: remoteAddress.serviceAddress + "/wx/operate/srvwx_user_unbind", // 解绑
	changePassword:remoteAddress.serviceAddress + '/sso/operate/srvsso_user_pwd_reset', //修改密码
	/**
	 * 新旧api 分割线—————————————————————————————————————————————————————————— old 
	 * */
	backUrl: remoteAddress.ssourl, // 授权域名
	serverURL: remoteAddress.serviceAddress, // 后台地址
	srvHost: remoteAddress.serviceAddress,
	savewxuser: remoteAddress.ssoAddress + '/wx/savewxuser', // sso保存微信用户
	testssoAuthor: remoteAddress.testUrl + '/wx/authorize', // sso授权地址
	testgetSignature: remoteAddress.testUrl + '/wx/getSignature', // sso保存微信用户 /wx/getSignature ,
	downloadImg: remoteAddress.serviceAddress + '/download?filePath=', // 图片地址
	getFilePath: remoteAddress.serviceAddress + '/file/download?filePath=', // 文件路径地址
	selectByUser: remoteAddress.serviceAddress + '/bxsys/srvms.100xsys.cn', // 用户菜单
	startProc: remoteAddress.serviceAddress + '/bxsys/startProc', // 流程开启
	approval: remoteAddress.serviceAddress + '/bxsys/approval', // 流程开启
	startDataProc: remoteAddress.serviceAddress + '/bxsys/startDataProc', // 流程子开启
	upload: remoteAddress.serviceAddress + '/file/upload',
	file: remoteAddress.serviceAddress + '/file/',
	deleteFile: remoteAddress.serviceAddress + '/file/delete', // 删除文件
	onTicket: remoteAddress.onTicket,
	ticket: remoteAddress.bx_auth_ticket,
}
export default ENV
