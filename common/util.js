import api from './api.js'
import dayjs from '@/static/js/dayjs.min.js'
import store from '@/store/index.js'
export default {
	install(Vue, options) {
		Vue.prototype.pageTitle = '加载中…' // 可以自定义变量
		/**
		 * 登录相关
		 */
		/**
		 *@param {Array} loginInfoList 要存储的登录信息 [{key:'',value:''}]
		 */
		Vue.prototype.saveLoginInfo = function(loginInfoList = []) {
			loginInfoList.map(item => {
				uni.setStorageSync(item.key, item.value)
			})
		}

		Vue.prototype.$logout = function() {
			try {
				uni.clearStorageSync();
			} catch (e) {
				console.error(e)
			}
		}
		// 初始化查询
		Vue.prototype.selectRequestObjs = function(srv, cond, order) { // 给自定义方法起个名
			let selectRequestObj = {}
			selectRequestObj['serviceName'] = ''
			selectRequestObj['colNames'] = ['*']
			selectRequestObj['condition'] = []
			if (srv) {
				selectRequestObj['serviceName'] = srv
			}
			if (cond) {
				selectRequestObj['condition'] = cond
			}
			if (order) {
				selectRequestObj['order'] = order
			}

			return selectRequestObj
		}
		Vue.prototype.urlParamsFilter = function(e) {
			let reqUrlParams = this.$api.reqUrlParams
			let params = []
			let filter = this.$api.reqUrlParamsFilter
			let isFilter = false // false  不添加参数
			let url = e
			let appfilters = []
			let srvfilters = []
			if (e !== undefined) {
				if (reqUrlParams.length > 0 && url.indexOf("select") !== -1) {
					// 是否存在自定义参数
					params = reqUrlParams.map((item) => {
						if (item.value.indexOf("$") !== -1) {
							let arr = item.value.split("$")
							let store = arr[1]
							item.value = uni.getStorageSync(store)
						}
						return item
					})
					if (filter.app.length > 0) {
						// 存在 白名单 app

						for (let key in filter.app) {
							let filterStr = "/" + filter.app[key] + "/"
							appfilters.push(filterStr)
						}
					}
					if (filter.filterSrv.length > 0) {
						// 需要过滤的 srv 
						for (let key in filter.filterSrv) {
							let filterStr = filter.filterSrv[key]
							srvfilters.push(filterStr)
						}
					}
					if (appfilters.length > 0) {
						// 有需要过滤的app
						let arr = []
						let sarr = []
						for (let key in appfilters) {
							if (url.indexOf(appfilters[key]) !== -1) {
								// 无需添加参数
								arr.push(true)
							}
						}
						if (srvfilters.length > 0) {
							// 有需要过滤的srv
							for (let key in srvfilters) {
								if (url.indexOf(srvfilters[key]) !== -1) {
									// 无需添加参数
									sarr.push(true)
								}
							}
						}
						if (arr.length > 0 && sarr.length === 0) {
							isFilter = true
						}
					}




					if (isFilter) {

						if (params.length > 0) {
							for (let key in params) {
								if (url.indexOf("?") !== -1) {
									url = url + "&" + params[key].colName + "=" + params[key].value
								} else {
									url = url + "?" + params[key].colName + "=" + params[key].value
								}
							}
						}
					}
					return url
				} else {
					// 无自定义参数， 直接返回
					return url
				}
			} else {
				// 无效入参 返回 false
				return false
			}

		}
		/**
		 * @param {String} srv - 服务名(serviceName)
		 * @param {String} srvType 
		 * @param {String} pageType  // use_type 取值
		 * @param {String} app 
		 */
		Vue.prototype.getServiceV2 = async function(srv, srvType, pageType,
			app) { // 表单信息 srvType : add | update | list | detail | select
			// use_type: detail | proclist | list | treelist | detaillist | selectlist | addchildlist | updatechildlist | procdetaillist | add | update
			let self = this
			let appName = app || uni.getStorageSync("activeApp")
			if (srv && srvType && pageType) {
				let len = srv.lastIndexOf('_')
				let serviceName = srv.slice(0, len) + '_'
				if (srvType === 'list' || srvType === 'detail') {
					serviceName += 'select'
				} else {
					serviceName += srvType
				}
				let cols = self.$store.getters.getSrvCol
				let nCols = cols.filter(item => item.service_name === serviceName && item.use_type === pageType)
				console.log('=====1', nCols)
				// if (nCols.length === 0) {
				let req = this.selectRequestObjs()
				req.serviceName = 'srvsys_service_columnex_v2_select'
				req.colNames = ['*']
				req.condition = []
				let condObj = {}
				condObj['colName'] = 'service_name'
				condObj['ruleType'] = 'eq'
				condObj['value'] = serviceName
				req.condition[0] = JSON.parse(JSON.stringify(condObj))
				condObj['colName'] = 'use_type'
				condObj['ruleType'] = 'eq'
				condObj['value'] = pageType
				req.condition[1] = JSON.parse(JSON.stringify(condObj))
				req.order = [{}]
				req.order[0]['colName'] = 'seq'
				req.order[0]['orderType'] = 'asc'
				let url = Vue.prototype.getServiceUrl(appName, "srvsys_service_columnex_v2_select", "select",
					url)
				url = url + "?colsel_v2=" + serviceName
				const response = await this.$http.post(url, req)
				if (response.data.data) {
					console.log('=====2', response.data.data)
					response.data.data.use_type = pageType
					// 第一次拿到，缓存
					let pageconfig = Vue.prototype.getPageConfig(response.data.data, pageType)
					self.$store.commit('setSrvCol', pageconfig)

					return pageconfig
				}
				// } else {
				// 	return nCols[0]
				// }
			} else {
				return false
			}
		}
		/**
		 * @param {String} v2res  V2 请求原始数据
		 * 
		 */
		Vue.prototype.getPageConfig = function(v2res, useType) {
			let pageConfigs = v2res || false
			if (pageConfigs) {
				pageConfigs["_fieldInfo"] = Vue.prototype.getFieldInfo(v2res.srv_cols, useType)
				// pageConfigs["_fieldInfo"] = Vue.prototype.arraySort(pageConfigs["_fieldInfo"], "seq")
				if (useType === 'list') {
					pageConfigs["_buttonInfo"] = Vue.prototype.getButtonInfo(v2res.gridButton, useType)
				}
				if (useType === 'treelist') {
					// pageConfigs["_buttonInfo"] = Vue.prototype.getButtonInfo(v2res.gridButton)
					pageConfigs["_rowButtons"] = Vue.prototype.getButtonInfo(v2res.rowButton, useType)
					pageConfigs["_handerButtons"] = Vue.prototype.getButtonInfo(v2res.gridButton, useType)
				} else if (useType === 'update' || useType === 'add' || useType === 'detail') {
					pageConfigs["_formButtons"] = Vue.prototype.getButtonInfo(v2res.formButton, useType)
				}
				console.log('ticket:', uni.getStorageSync('bx_auth_ticket'))
				return pageConfigs
			} else {
				return false
			}
		}
		/** 封装 field 的配置信息
		 * @param {String} srvCol  cols 数组
		 * @param {String} useType userType,页面类型
		 */
		Vue.prototype.getFieldInfo = function(srvCol, useType) {
			let cols = srvCol
			let fieldInfo = {}
			switch (useType) {
				// 统一根据页面类型 过滤字段显示 === 2 暂不支持
				case "add":
					cols = cols.filter((item, index) => {
						// if (item.in_add !== 0) {
						if (item.in_add === 1 || item.in_add == 2) {
							if (item.in_add === 2) {
								// item.display = false
							}
							return item
						}
					})
					break;
				case "update":
					cols = cols.filter((item, index) => {
						if (item.in_update === 1) {
							return item
						}
					})
					break;
				case "detail":
					cols = cols.filter((item, index) => {
						// if (item.in_detail !== 0) {
						if (item.in_detail === 1) {
							return item
						}
					})
					break;
				default:
					break;
			}
			cols = cols.map((item, index) => {
				fieldInfo = {
					column: "",
					label: "",
					defaultValue: null,
					isRequire: null,
					type: null,
				}
				fieldInfo.column = item.columns
				fieldInfo.label = item.label
				fieldInfo.seq = item.seq
				fieldInfo.option_list_v2 = item.option_list_v2
				fieldInfo.bx_col_type = item.bx_col_type
				fieldInfo.redundant = item.redundant
				fieldInfo.col_type = item.col_type
				fieldInfo.section = item.section
				fieldInfo.validators = item.validators
				// col_type 转换 表单组件 type 
				if (item.col_type === "String" || item.col_type === "TelNo" || item.col_type === 'IdNo') {
					fieldInfo.type = "input"
				} else if (item.col_type === "DateTime") {
					fieldInfo.type = "dateTime"
				} else if (item.col_type === "FileList") {
					fieldInfo.type = "file"
					fieldInfo.srvInfo = {
						tableName: item.table_name,
						appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
							.table_name.indexOf("_"))
					}
				} else if (item.col_type === "Image") {
					// } else if (item.col_type === "Image" || item.col_type === "FileList") {
					fieldInfo.type = "images"
					fieldInfo.srvInfo = {
						tableName: item.table_name,
						appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
							.table_name.indexOf("_"))
					}
				} else if (item.col_type === "Enum" || item.col_type === "Dict") {
					fieldInfo.type = "radioFk"
					fieldInfo.options = item.option_list_v2
				} else if (item.col_type === "MultilineText") {
					fieldInfo.type = "textarea"
					// fieldInfo.type = "input"
				} else if (item.col_type === "Money" || item.col_type === "Float") {
					fieldInfo.type = "digit"
				} else if (item.col_type === "Integer" || item.col_type === "int") {
					fieldInfo.type = "number"
				} else if (item.bx_col_type === "fk" && item.col_type !== "User") {
					if (fieldInfo.option_list_v2.is_tree) {
						fieldInfo.type = "treeSelectorPro"
					} else {
						fieldInfo.type = "poupchange"
						// fieldInfo.type = "treeSelector"
					}
					fieldInfo.srvInfo = fieldInfo.option_list_v2
					fieldInfo.srvInfo.isTree = fieldInfo.option_list_v2.is_tree
					fieldInfo.srvInfo.column = fieldInfo.option_list_v2.refed_col
					fieldInfo.srvInfo.showCol = fieldInfo.option_list_v2.key_disp_col
				} else if (item.col_type === "User") {
					fieldInfo.type = "treeSelector"
					fieldInfo.option_list_v2 = {
						"refed_col": "user_no",
						"srv_app": "sso",
						"serviceName": "srvsso_user_select",
						"key_disp_col": "user_disp"
					}
					fieldInfo.srvInfo = {
						serviceName: 'srvsso_user_select',
						appNo: 'sso',
						isTree: false,
						column: 'user_no',
						showCol: 'real_name', //要展示的字段
					}
				} else if (item.col_type === 'snote' || item.col_type === 'Note') {
					fieldInfo.type = 'richText'
				} else {
					fieldInfo.type = item.col_type
				}

				switch (useType) {
					case "add":
						fieldInfo.showExp = (item.in_add === 1)
						fieldInfo.display = (item.in_add === 1)
						fieldInfo.in_add = item.in_add
						break;
					case "update":
						fieldInfo.showExp = (item.in_update === 1)
						fieldInfo.display = (item.in_update === 1)
						fieldInfo.in_update = item.in_update
						break;
					case "list":
						fieldInfo.showExp = (item.in_list === 1)
						fieldInfo.display = (item.in_list === 1)
						break;
					case "detail":
						fieldInfo.showExp = (item.in_detail === 1)
						fieldInfo.display = (item.in_detail === 1)
						break;
					case "proclist":
						fieldInfo.showExp = (item.in_list === 1)
						fieldInfo.display = (item.in_list === 1)
						break;
					case "cond":
						break;
					default:
						break;
				}
				// 处理字段统一属性
				fieldInfo.disabled = item.updatable === 0 ? true : false; //字段是否冻结
				if (item.updatable === 0 && item.updatable_add === 1 && useType === 'add') {
					fieldInfo.disabled = false
				}
				fieldInfo._validators = Vue.prototype.getValidators(item.validators, item
					.validators_message)
				fieldInfo._validator_obj = Vue.prototype.getValidators(item.validators, item
					.validators_message)
				if (typeof fieldInfo._validators === 'object' && Object.keys(fieldInfo._validators).length >
					0) {
					fieldInfo.item_type_attr = {
						max: fieldInfo._validators.max,
						min: fieldInfo._validators.min
					}
				}
				if (item.more_config && typeof item.more_config === 'string') {
					try {
						fieldInfo.moreConfig = JSON.parse(item.more_config)
					} catch (e) {
						//TODO handle the exception
					}
				}
				fieldInfo.isRequire = fieldInfo._validators.required
				fieldInfo.value = null //初始化value
				fieldInfo._colDatas = item //保存原始data
				if (item.more_config && typeof item.more_config == "string") {
					try {
						let moreConfig = JSON.parse(item.more_config)
						if (moreConfig.formulaShow) {
							fieldInfo.formulaShow = moreConfig.formulaShow
						}
					} catch (e) {
						console.error(e)
					}
				}
				if (item.init_expr) {
					item.init_expr = item.init_expr.replace(/\'/ig, '')
					fieldInfo.defaultValue = item.init_expr
					if (item.col_type === 'Enum' || item.col_type === 'Dict') {
						fieldInfo.value = fieldInfo.defaultValue
					}
					if (item.init_expr === 'new Date()') {
						fieldInfo.defaultValue = dayjs().format('YYYY-MM-DD')
						fieldInfo.value = dayjs().format('YYYY-MM-DD')
						if (item.col_type === "DateTime") {
							fieldInfo.defaultValue = dayjs().format('YYYY-MM-DD HH:mm:ss')
							fieldInfo.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
						}
					}
					if (item.init_expr.indexOf('top.user.user_no') !== -1) {
						if (uni.getStorageSync('login_user_info') && uni.getStorageSync('login_user_info')
							.user_no) {
							fieldInfo.defaultValue = uni.getStorageSync('login_user_info').user_no;
							fieldInfo.value = uni.getStorageSync('login_user_info').user_no
						}
					}
				}
				return fieldInfo
			})
			return cols
		}
		/** 封装按钮的配置信息
		 * @param {String} buttons  按钮数据
		 * 
		 */
		Vue.prototype.getButtonInfo = function(buttons, pageType) {
			let cols = buttons
			let buttonInfo = {}
			cols = cols.filter((item, index) => {
				switch (pageType) {
					case "treelist":
						if ((item.button_type === "addchild" || item.button_type === "edit" || item
								.button_type === "delete" ||
								item.button_type === "add") && item.permission) {
							return item
						}
						break;
					case "list":
						if ((item.button_type === "addchild" || item.button_type === "edit" || item
								.button_type === "delete" ||
								item.button_type === "add") && item.permission) {
							return item
						}
						break;
					case "add":
						if ((item.button_type === "reset" || item.button_type === "submit") && item
							.permission) {
							return item
						} else if (item.button_type === "submit" && !item
							.permission) {
							// uni.showModal({
							// 	title: '按钮无权限',
							// 	content: JSON.stringify(item),
							// 	showCancel: false
							// })
							return item
						}
						break;
					case "update":
						if ((item.button_type === "reset" || item.button_type === "edit") && item
							.permission) {
							return item
						}
						break;
					case "detail":
						if ((item.button_type === "customize") && item.permission) {
							if (item.operate_params && typeof item.operate_params === 'string') {
								try {
									item.operate_params = JSON.parse(item.operate_params)
								} catch (e) {
									console.log(e)
									//TODO handle the exception
								}
								return item
							}
						}
						break;
					default:
						break;
				}
			})
			return cols
		}
		/**
		 * 树形数据封装
		 */
		Vue.prototype.treeReform = function(e, pidcol, idcol) {
			// 
			let data = Vue.prototype.deepClone(e)
			let to1Data = e.filter((item, index) => {
				// console.log(item.menu_name,item[pidcol])
				return item[pidcol] === null || item[pidcol] === ""
			})
			let to2Data = e.filter((item, index) => {
				return item[pidcol] !== null || item[pidcol] === ""
			})
			let reform = function(allData, pd, id, data) {
				// 根据顶级节点组装数有子节点
				let datas = Vue.prototype.deepClone(data) // 当前级别
				let aDatas = Vue.prototype.deepClone(allData) // 剩余data
				for (let i = 0; i < datas.length; i++) {
					let child = []
					for (let j = 0; j < aDatas.length; j++) {
						// console.log("slice==="+j,datas[i][id],aDatas[j][pd])
						if (datas[i][id] === aDatas[j][pd]) {
							child.push(aDatas[j])
							aDatas.slice(j, 1)
						}
					}
					if (child.length > 0) {
						datas[i]["_childNode"] = reform(aDatas, pd, id, child)
					} else {
						datas[i]["_childNode"] = child
					}
				}
				return datas
			}
			to1Data = reform(to2Data, pidcol, idcol, to1Data)
			// console.log("_childNode",e,to1Data)
			return to1Data
		}
		/**
		 * 普通请求方法封装
		 * @param {String} optionType -操作类型(select||operate||add...)
		 * @param {String} srv -服务名 serviceName
		 * @param {Object} req -请求参数
		 * @param {String} app 
		 */
		Vue.prototype.onRequest = async function(optionType, srv, req, app) {
			let self = this
			let reqType = optionType
			if (optionType === "add" || optionType === "update") {
				reqType = optionType
			} else if (optionType === "select") {

			}
			let url = Vue.prototype.getServiceUrl(app || uni.getStorageSync("activeApp"), srv, optionType)
			return self.$http.post(url, req)
		}
		/**
		 * 普通请求方法封装2
		 * @param {String} optionType -操作类型(select||operate||add...)
		 * @param {String} srv -服务名 serviceName
		 * @param {Object} req -请求参数
		 * @param {String} app 
		 */
		Vue.prototype.$fetch = async function(optionType, srv, req, app) {
			if (!req.colNames) {
				req.colNames = ['*']
			}
			if (!req.serviceName) {
				req.serviceName = srv
			}
			if (!req.page) {
				req.page = {
					pageNo: 1,
					rownumber: 10
				}
			}
			let self = this
			let reqType = optionType
			if (optionType === "add" || optionType === "update") {
				reqType = optionType
			} else if (optionType === "select") {

			}
			let url = Vue.prototype.getServiceUrl(app || uni.getStorageSync("activeApp"), srv, optionType)
			let res = await Vue.prototype.$http.post(url, req)
			if (res.data.state === 'SUCCESS') {
				// select
				if (optionType === "select") {
					return {
						success: true,
						page: res.data.page,
						data: res.data.data
					}
				} else if (optionType === "multi") {
					if (Array.isArray(res.data.data)) {
						return {
							success: true,
							data: res.data.data
						}
					}
				} else {
					// update|add|delete
					if (
						Array.isArray(res.data.response) &&
						res.data.response.length > 0 &&
						res.data.response[0].response &&
						Array.isArray(res.data.response[0].response.effect_data) &&
						res.data.response[0].response.effect_data.length > 0
					) {
						return {
							success: true,
							data: res.data.response[0].response.effect_data
						}
					} else if (Array.isArray(res.data.response) &&
						res.data.response.length > 0 &&
						res.data.response[0].response) {
						return {
							success: true,
							data: res.data.response[0].response
						}
					}
				}
			} else {
				let result = {
					success: false,
					state: res.data.state,
				}
				if (res.data.resultCode) {
					result.code = res.data.resultCode
				}
				if (res.data.resultMessage) {
					result.msg = res.data.resultMessage
				}
				if (res.data.serviceInfo) {
					result.info = res.data.serviceInfo
				}
				return result
			}
		}


		// -------------------公共方法-------------------------------
		/**
		 * @param {String} app 
		 * @param {String} srv - 服务名(serviceName)
		 * @param {String} srvType 
		 * @param {String} url - 协议+ip+端口
		 */
		Vue.prototype.getServiceUrl = function(app, srv, srvType, url) {
				// 获取转换URL app, srv, srvType, url
				let singleApp = this.$api.singleApp

				let urlVal = url || this.$api.srvHost
				let appVal = app
				if (singleApp) {
					appVal = this.$api.appName

				} else {
					appVal = uni.getStorageSync('activeApp')
				}
				if (app) {
					appVal = app
				}
				let srvTypeVal = srvType
				let srvVal = srv
				console.log("url:", urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal)
				return urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal
			},

			/**
			 * 封装配置的校验信息
			 *  @param {String} vds - col 配置的 validators
			 *  @param {String} msg - col 配置的 validators_message
			 */
			Vue.prototype.getValidators = function(vds, msg) { // 获取校验信息返回组件data
				if (vds !== null && msg !== null) {
					let str = vds
					console.log('vds', vds)
					let getStr = function(val, state, end) {
						if (val.length > state.length + end.length) {
							let s = val.indexOf(state)
							if (s === -1) {
								return ''
							} else {
								let nval = val.slice(s + state.length, val.length)
								let e = nval.indexOf(end)
								let str = nval.slice(0, e)
								if (e === -1) {
									str = nval.slice(0)
								}
								return str
							}
						} else {
							return ''
						}
					}
					let Validators = {}
					let reg = /required/gi
					Validators['max'] = getStr(str, 'ngMaxlength=', ';').length > 0 ? parseInt(getStr(str,
							'ngMaxlength=', ';')) :
						null
					Validators['min'] = getStr(str, 'ngMinlength=', ';').length > 0 ? parseInt(getStr(str,
							'ngMinlength=', ';')) :
						null
					Validators['reg'] = getStr(str, 'ngPattern=', ';')
					Validators['required'] = reg.test(str)
					Validators['msg'] = getStr(msg, 'ngPattern=', ';')
					Validators['isType'] = function(e) {
						let reg = new RegExp(getStr(str, 'ngPattern=', ';'))
						if (reg.test(e)) {
							let obj = {
								valid: reg.test(e),
								msg: "有效"
							}
							return obj
						} else {
							let msgs = getStr(msg, 'ngPattern=', ';')
							msgs = msgs === '' ? '信息有误' : msgs
							let obj = {
								valid: reg.test(e),
								msg: msgs
							}
							return obj
						}
					}
					return Validators
				} else if (vds && !msg) {
					let reg = /required/gi
					let Validators = {}
					Validators['required'] = reg.test(vds)
					return Validators
				} else {
					return false
				}
			}
		Vue.prototype.isType = function(e) {
			let reg = new RegExp(getStr(str, 'ngPattern=', ';'))
			if (reg.test(e)) {
				let obj = {
					valid: reg.test(e),
					msg: "有效"
				}
				return obj
			} else {
				let msgs = getStr(msg, 'ngPattern=', ';')
				msgs = msgs === '' ? '信息有误' : msgs
				let obj = {
					valid: reg.test(e),
					msg: msgs
				}
				return obj
			}
		}
		Vue.prototype.deepClone = function(obj) {
			// 深拷贝
			function isObject(o) {
				return (typeof o === 'object' || typeof o === 'function') && o !== null
			}
			if (!isObject(obj)) {
				console.log('非对象', obj)
				throw new Error('非对象', obj)
			}
			let isArray = Array.isArray(obj)
			let newObj = isArray ? [...obj] : {
				...obj
			}
			Reflect.ownKeys(newObj).forEach(key => {
				newObj[key] = isObject(obj[key]) ? Vue.prototype.deepClone(obj[key]) : obj[key]
			})
			return newObj
		}

		Vue.prototype.toPreviousPage = function() {
			uni.navigateBack({
				animationDuration: 2000,
				animationType: 'zoom-fade-in',
				delta: 1
			});
		}

		Vue.prototype.formateDate = function(date, type = 'date') {
			date = new Date(date)
			let o = {
				'yy': date.getFullYear(),
				'MM': (() => {
					let MM = date.getMonth() + 1
					if (MM < 10) {
						MM = '0' + MM
					}
					return MM
				})(),
				'dd': date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
				'HH': date.getHours(),
				'mm': (() => {
					let mm = date.getMinutes()
					if (mm < 10) {
						mm = '0' + mm
					}
					return mm
				})(),
				'ss': date.getSeconds()
			};
			if (type === 'date') {
				return o.yy + '-' + o.MM + '-' + o.dd
			} else {
				return o.yy + '-' + o.MM + '-' + o.dd + ' ' + o.HH + ':' + o.mm + ':' + o.ss;
			}
		};
		// -------------------- 微信相关 -----------------
		/**
		 *  判断是否当前环境是微信
		 *  @return {boolean} true||false
		 */
		Vue.prototype.isWeixinClient = function() {
			// #ifdef H5
			let ua = navigator.userAgent.toLowerCase()
			// 微信公众号环境
			let isWeixin = ua.indexOf('micromessenger') !== -1
			if (isWeixin) {
				return true
			} else {
				return false
			}
			// #endif
			// #ifdef MP-WEIXIN
			// 微信小程序环境
			return true
			// #endif
		};
		// 表单
		Vue.prototype.getCoulmnConfig = function(e) {
			let cnCol = {
				// "activity_no": "20200208002600000007",
				// "item_no":"000001",
				"item_seq": 1,
				"item_title": e.item_title,
				"item_type": e.item_type,
				"is_require": e.is_require,
				// "column":e.column,
				"item_type_attr": {},
				"is_public": "否",
				"show_cfg": "",
				// "option_data":[]
			}
			switch (e.item_type) {
				case "文本":
					cnCol.item_type_attr['view_model'] = e.view_model
					cnCol.item_type_attr['max_len'] = e.max_len
					break;
				case "选项":
					cnCol.item_type_attr['radioType'] = e.option_type === '单选' ? 'single' : e.option_type === '多选' ?
						'multi' : '',
						console.log(cnCol.item_type_attr['radioType'])
					break;
				case "时间日期":
					cnCol.item_type_attr['dateType'] = e.format
					break;
				case "数字":
					cnCol.item_type_attr['numberType'] = e.decimal_places
					cnCol.item_type_attr['max'] = e.max
					cnCol.item_type_attr['min'] = e.min
					break;
				case "图片":
					cnCol.item_type_attr['fileNum'] = e.max_num
					break;
				default:
					''
			}
			cnCol.item_type_attr = JSON.stringify(cnCol.item_type_attr)
			// cnCol.show_cfg = JSON.stringify(cnCol.show_cfg)
			cnCol.option_data = JSON.stringify(cnCol.option_data)
			return cnCol
		}
		/**
		 * QUsHE inputs inputsArray 数据构造
		 * 
		 * */
		Vue.prototype.getInputsArray = function(e) {
			let viewCfg = e
			let inputTemp = function() {
				let a = {
					type: "", //input textarea pics  radio checkbox picker-date（picker-dateTime| String| 日期加时间| | picker-date| String| 日期| | picker-time| String| 时间|） picker-city text  infinitePics
					title: "名称", //
					inputType: "", // text number
					maxlength: "", // 最大长度
					// ignore:false,// 是否为空
					defaultValue: "", // 默认值
					itemArray: [], // 选项值和名称 name value
					column: "",
				}
				return a
			}
			let inputsDatas = viewCfg.map((item, index) => {
				let inputData = inputTemp()
				inputData.title = item.item_title
				inputData.column = item.column
				inputData.no = item.item_no
				inputData.width = "100"
				switch (item.item_type) {
					case "string":
						if (item.item_type_attr.hasOwnProperty("view_model")) {
							if (item.item_type_attr.view_model === "单行") {
								inputData.type = "input"

								return inputData
							} else if (item.item_type_attr.view_model === "多行") {
								inputData.type = "textarea"
								return inputData
							}
						} else {
							inputData.type = "input"

							return inputData
						}
						break;
					case "checkbox":
						if (item.item_type_attr.hasOwnProperty("option_type")) {

							if (item.item_type_attr.option_type === "单选") {
								inputData.type = "radio"
								inputData.itemArray = item.option_data.map((item, index) => {
									let a = {
										name: item.option_value,
										value: item.option_no
									}
									return a
								})
								return inputData
							} else if (item.item_type_attr.option_type === "多选") {
								inputData.type = "checkbox"
								inputData.itemArray = item.option_data.map((item, index) => {
									let a = {
										name: item.option_value,
										value: item.option_no
									}
									return a
								})
								return inputData
							}
						}
						break;
					case "date":
						inputData.type = "picker-date"
						if (item.item_type_attr.hasOwnProperty("format")) {
							if (item.item_type_attr.format === 'date') {
								inputData.mode = "picker-date"
							} else if (item.item_type_attr.format === 'time') {
								inputData.mode = "picker-time"
							} else if (item.item_type_attr.format === 'datetime') {
								inputData.mode = "picker-datetime"
							}
						}
						return inputData
						break;
					case "number":
						inputData.type = "input"
						inputData.inputType = "number"
						if (item.item_type_attr.hasOwnProperty("decimal_places")) {
							if (item.item_type_attr.decimal_places === "decimal") {
								inputData.verifyType = "Number"
								inputData.filterType = "twoDecimalPlaces"
							} else if (item.item_type_attr.decimal_places === "Int") {
								inputData.verifyType = "Int"
							}
						}
						return inputData
						break;
					case "image":
						if (item.item_type_attr.hasOwnProperty("max_num")) {
							inputData.type = "infinitePics"
							inputData.max = item.item_type_attr.max_num
							return inputData
						}
						break;
					default:
						return inputData
				}
			})
			return inputsDatas
		}
		// eval 替代方案
		Vue.prototype.evalInTo = function(e, q) {
				let item = q
				let exp = e.isShowExp
				let showExp = false
				let isShowNum = 0
				if (exp && exp.length > 0) {
					for (let i = 0; i < exp.length; i++) {
						if (exp[i].type === 'eq') {
							if (item[exp[i].column] === exp[i].value) {
								isShowNum++
							}
						} else if (exp[i].type === 'neq') {
							if (item[exp[i].column] !== exp[i].value) {
								isShowNum++
							}
						}
					}
					return exp.length === isShowNum
				} else {
					return true
				}
			},
			/**
			 * 是否显示item
			 * @param {Object} e 
			 * @param {Object} q 
			 */
			Vue.prototype.colItemShowExps = function(e, q) {
				let data = e
				let obj = q
				let exp = e.isShowExp
				let showExp = false
				let isShowNum = 0
				if (exp && exp.length > 0) {
					exp.forEach(item => {
						if (item.ruleType === 'eq') {
							if (obj[item.colName] === item.value) {
								isShowNum++
							}
						} else if (item.ruleType === 'neq') {
							if (obj[item.colName] !== item.value) {
								isShowNum++
							}
						}
					})
					return exp.length === isShowNum
				} else {
					return true
				}

			}
		// 获取图片路径
		Vue.prototype.getFilePath = async function(e) {
			let url = Vue.prototype.getServiceUrl('file', 'srvfile_attachment_select', 'select')
			let req = {
				"serviceName": "srvfile_attachment_select",
				"colNames": ["*"],
				"condition": [{
					"colName": "file_no",
					"value": e,
					"ruleType": "eq",
				}, {
					"colName": "is_delete",
					"value": "1",
					"ruleType": "eq",
				}, ]
			}
			if (e) {
				let response = await this.$http.post(url, req);
				console.log('srvfile_attachment_select', response);
				if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
					return response.data.data
				}
			}
		}
		Vue.prototype.getDayDate = function(e, type) {
			let date = new Date();
			if (e) {
				date = new Date(e);
			}
			let year = date.getFullYear()
			let mon = date.getMonth() + 1
			let day = date.getDate()
			let hour = date.getHours()
			let mint = date.getMinutes()
			let scends = date.getSeconds()
			// if (date.getFullYear() < 10) {
			// 	year = '0' + date.getFullYear()
			// }
			if (mon < 10) {
				mon = '0' + mon
			}
			if (day < 10) {
				day = '0' + day
			}
			if (hour < 10) {
				hour = '0' + hour
			}
			if (mint < 10) {
				mint = '0' + mint
			}
			if (scends < 10) {
				scends = '0' + scends
			}
			let str = year + '-' + mon + '-' + day

			if (type && type == 'all') {
				str = year + '-' + mon + '-' + day + ' ' + hour + ':' + mint + ':' + scends
			}
			return str
		}
		Vue.prototype.getResData = function(e) {
			if (e.length > 0) {
				return e[0].response.effect_data[0]
			}
		}
		Vue.prototype.getWxUserInfo = async function(userInfo) {
				//查找微信用户头像昵称
				let optionType = 'select';
				let srv = 'srvwx_basic_user_info_select';
				let app = 'wx';
				let req = {
					serviceName: 'srvwx_basic_user_info_select',
					colNames: ['*'],
					condition: [{
						colName: 'app_no',
						ruleType: 'eq',
						value: uni.getStorageSync('_appNo') ? uni.getStorageSync('_appNo') : Vue
							.prototype.$api.appNo.wxmp
					}]
				};
				let res = await Vue.prototype.onRequest(optionType, srv, req, app);

				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
					let wxUser = res.data.data[0];
					uni.setStorageSync('backWxUserInfo', wxUser);
					if (!wxUser.nickname) {
						if (userInfo) {
							Vue.prototype.setWxUserInfo(userInfo)
						}
					}
				} else if (userInfo) {
					Vue.prototype.setWxUserInfo(userInfo)
				}
			},
			Vue.prototype.setWxUserInfo = async function(e) {
				let userInfo = null
				// #ifdef H5
				userInfo = JSON.parse(e)
				// #endif
				// #ifdef MP-WEIXIN
				userInfo = e
				// #endif
				console.log("setWxUserInfo", userInfo)
				uni.setStorageSync('backWxUserInfo', userInfo);
				let url = Vue.prototype.getServiceUrl('wx', 'srvwx_basic_user_info_save', 'operate')
				let req = [{
					"serviceName": "srvwx_basic_user_info_save",
					"data": [{
						"app_no": uni.getStorageSync('_appNo') ? uni.getStorageSync('_appNo') :
							Vue.prototype.$api.appNo.wxmp,
						// "app_no": uni.getStorageSync('_appNo'),
						"nickname": userInfo.nickName,
						"sex": userInfo.gender,
						"country": userInfo.country,
						"province": userInfo.province,
						"city": userInfo.city,
						"headimgurl": userInfo.avatarUrl
					}],
				}]
				if (e) {
					let response = await this.$http.post(url, req);
					console.log('setWxUserInfo', response);
					if (response.data.state === 'SUCCESS' && response.data.data && response.data.data.length >
						0) {
						// Vue.prototype.wxLogin()
						return response.data.data
					}
				}
			}
		Vue.prototype.isInvalid = function(e) {
			if (e === '' || e === null || e === undefined) {
				return false
			} else {
				return true
			}
		}
		Vue.prototype.arraySort = function(arr, col) {
			var compare = function(prop) {
				return function(obj1, obj2) {
					var val1 = obj1[prop];
					var val2 = obj2[prop];
					if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
						val1 = Number(val1);
						val2 = Number(val2);
					}
					if (val1 < val2) {
						return -1;
					} else if (val1 > val2) {
						return 1;
					} else {
						return 0;
					}
				}
			}
			return arr.sort(compare(col))
		}
		Vue.prototype.judgeClientEnviroment = function() {
			let client_env = '';
			// #ifdef H5
			const isWeixin = Vue.prototype.isWeixinClient();
			console.log('isWeixin', isWeixin);
			client_env = isWeixin ? 'wxh5' : 'web';

			// #endif
			// #ifdef MP-WEIXIN
			client_env = 'wxmp';
			//#endif
			// #ifdef APP-PLUS
			client_env = 'app';
			// #endif
			let client_type = '';
			switch (uni.getSystemInfoSync().platform) {
				case 'android':
					console.log('运行Android上');
					client_type = 'android';
					break;
				case 'ios':
					console.log('运行iOS上');
					client_type = 'ios';
					break;
				default:
					client_type = 'web';
			}
			uni.setStorageSync('client_env', client_env);
			uni.setStorageSync('client_type', client_type);
		}
		Vue.prototype.getDecodeUrl = function(e) {
			if (Vue.prototype.isInvalid(e)) {
				let url = decodeURIComponent(e)
				console.log('getDecodeUrl 01', url)
				if (url.indexOf("%") !== -1) {
					console.log('getDecodeUrl 02', url)
					url = decodeURIComponent(e)
					Vue.prototype.getDecodeUrl(url)
				} else {
					console.log('getDecodeUrl 03', url)
					return url
				}
			} else {
				return false
			}
		}
		Vue.prototype.iObject = function(e) {
			if (e) {
				return Object.prototype.toString.call(e) === "[object Object]"
			} else {
				return false
			}
		}
		Vue.prototype.isArray = function(e) {
			return Array.isArray(e)
			// if (e) {
			//   // return Array.isArray(e)
			//   return Object.prototype.toString.call(e) === "[object Array]"
			// } else {
			//   return false
			// }
		}
		Vue.prototype.setCodeUrl = function(obj) {
			if (obj) {
				let url = ""
				for (let key in obj) {
					url += ("&" + key + "=" + (Vue.prototype.iObject(obj[key]) || Vue.prototype.iArray(obj[key]) ?
						encodeURIComponent(JSON.stringify(obj[key])) : encodeURIComponent(obj[key])))
				}
				return url
			} else {
				return false
			}
		}
		Vue.prototype.setFieldsDefaultVal = function(field, values) {
			if (Vue.prototype.isArray(field) && Vue.prototype.iObject(values)) {
				for (let i = 0; i < field.length; i++) {
					for (let key in values) {
						if (field[i].column === key) {
							field[i].value = values[key]
							field[i].defaultValue = values[key]
						}
					}
				}
				console.log('1111', field, values)
				return field
			} else {
				return false
			}
		}
		Vue.prototype.onButtonRequest = function(e) {
			let btn, row, condition, defaultVal
			if (e && Vue.prototype.iObject(e) && e.hasOwnProperty("button")) {
				btn = e.button
				let params = {
					"type": "update",
					"condition": [{
						"colName": "id",
						"ruleType": "in",
						"value": e.hasOwnProperty("row") ? e.row.id : null
					}],
					"serviceName": btn.service_name,
					"defaultVal": null
				}
				switch (btn.button_type) {
					case "edit":
						if (e.hasOwnProperty("row")) {
							row = e.row
							let params = {
								"type": "update",
								"condition": [{
									"colName": "id",
									"ruleType": "in",
									"value": row.id
								}],
								"serviceName": btn.service_name,
								"defaultVal": row
							}
							console.log("点击了【有效】的公共编辑按钮", row)
							uni.navigateTo({
								url: "/pages/public/formPage/formPage?params=" + encodeURIComponent(JSON
									.stringify(params))
							})
						} else {
							console.log("点击了【无效】的公共编辑按钮")
						}
						//代码块
						break;
					case "delete":
						return new Promise((resolve, reject) => {
							uni.showModal({
								content: "是否确认删除操作？",
								success: function(res) {
									if (res.confirm) {
										console.log('用户点击确定');
										let req = [{
											"serviceName": params.serviceName,
											"colNames": ["*"],
											"condition": params.condition
										}]
										Vue.prototype.onRequest("delete", params.serviceName,
											req).then((res) => {
											if (res.data.state === "SUCCESS") {

												resolve(res.data)
												// uni.showToast({
												// 	title:e.button.button_name
												// })
											} else {
												reject(res.data)
											}

										})
									} else if (res.cancel) {
										resolve('用户点击取消')
									}
								}
							})
						})
						//代码块
						break;
					case "add":
						//代码块
						break;
					default:
						//默认代码块
				}
			}
		}
		/**
		 * 按钮跳转的统一处理
		 * 
		 */
		Vue.prototype.onButtonToUrl = function(e) {
			console.log("onButtonToUrl", e)
			let btn, row, condition, defaultVal
			if (e && Vue.prototype.iObject(e)) {
				btn = e.button
				if (btn.is_public) {
					switch (btn.button_type) {
						case "edit":
							if (e.hasOwnProperty("row")) {
								row = e.row
								let params = {
									"type": "update",
									"condition": [{
										"colName": "id",
										"ruleType": "in",
										"value": row.id
									}],
									"serviceName": btn.service_name,
									"defaultVal": row
								}
								console.log("点击了【有效】的公共编辑按钮", row, params)
								uni.navigateTo({
									url: "/pages/public/formPage/formPage?params=" + encodeURIComponent(JSON
										.stringify(params))
								})
							} else {
								console.log("点击了【无效】的公共编辑按钮")
							}
							return new Promise((resolve, reject) => {
								resolve("跳转")

							})
							//代码块
							break;
						case "delete":
							return new Promise((resolve, reject) => {
								Vue.prototype.onButtonRequest(e).then((res) => {
									if (res) {
										resolve(res)
									} else {
										reject(res)
									}
								})
							})
							//代码块
							break;
						case "add":
							//代码块
							return new Promise((resolve, reject) => {
								resolve(e)
							})
							break;
						case "detail":
							return new Promise((resolve, reject) => {
								resolve(e)
							})
							break;
						default:
							return new Promise((resolve, reject) => {
								resolve(e)
							})
							//默认代码块
					}
				} else {
					switch (btn.button_type) {
						case "detail":
							if (e.hasOwnProperty("row")) {
								row = e.row
								let params = {
									"type": "detail",
									"condition": [{
										"colName": "id",
										"ruleType": "in",
										"value": row.id
									}],
									"serviceName": btn.service_name,
									"defaultVal": row
								}

								console.log("点击了【有效】的公共编辑按钮", row)
								uni.navigateTo({
									url: "/pages/public/formPage/formPage?params=" + encodeURIComponent(JSON
										.stringify(params))
								})
							} else {
								console.log("点击了【无效】的公共编辑按钮")
							}
							case "customize":
								//代码块
								// if (btn.operate_type === '流程申请') {
								// uni.navigateTo({
								// 	url: "/pages/public/proc/apply/apply?serviceName=" + btn.operate_service
								// })
								return new Promise((resolve, reject) => {
									resolve(e)
								})
								// }
								break;
							case "delete":
								//代码块
								break;
							case "add":
								//代码块
								break;
							default:
								//默认代码块
					}
				}
				console.log("btn", btn)
			} else {
				uni.showToast({
					title: "参数错误"
				})
			}

		}
		Vue.prototype.debounce = function(fn, delay) {
			// 记录上一次的延时器
			var timer = null;
			var delay = delay || 200;
			return function() {
				var args = arguments;
				var that = this;
				// 清除上一次延时器
				clearTimeout(timer)
				timer = setTimeout(function() {
					fn.apply(that, args)
				}, delay);
			}
		}
		Vue.prototype.throttle = function(func, wait) {
			var previous = 0;
			return function() {
				let now = Date.now();
				let context = this;
				let args = arguments;
				if (now - previous > wait) {
					func.apply(context, args);
					previous = now;
				}
			}
		}


		Vue.prototype.verifyLogin = function(code) {
			//验证登录(静默登录)
			let url = Vue.prototype.$api.verifyLogin.url;
			let req = [{
				data: [{
					code: code,
					app_no: Vue.prototype.$api.appNo.wxmp
				}],
				serviceName: 'srvwx_app_login_verify'
			}];
			return new Promise((resolve, reject) => {
				Vue.prototype.$http.post(url, req).then(response => {
					if (response.data.resultCode === 'SUCCESS') {
						uni.hideLoading();
						uni.setStorageSync('isLogin', true);
						let resData = response.data.response[0].response;
						let loginMsg = {
							bx_auth_ticket: resData.bx_auth_ticket,
							expire_time: resData.expire_time
						};
						uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
						if (resData.login_user_info.user_no) {
							uni.setStorageSync('login_user_info', resData.login_user_info);
							Vue.prototype.$store.commit('setLoginUser', resData.login_user_info)
						}
						uni.setStorageSync('isLogin', true);
						resolve(resData)
					} else if (response.data.resultCode === 'FAILURE') {
						uni.setStorageSync('isLogin', false);
						uni.showToast({
							title: response.data.resultMessage,
							icon: 'none'
						});
						reject(response.data)
					}
				});
			})
		}
		Vue.prototype.getBasicsInfo = async function() {
			let userInfo = uni.getStorageSync('login_user_info');
			let url = Vue.prototype.getServiceUrl('zhxq', 'srvzhxq_member_select', 'select');
			let req = {
				serviceName: 'srvzhxq_member_select',
				colNames: ['*'],
				condition: [{
					colName: 'openid',
					value: userInfo.user_no,
					ruleType: 'eq'
				}],
				page: {
					pageNo: 1,
					rownumber: 10
				}
			};
			let res = await Vue.prototype.$http.post(url, req);
			if (res.data.data.length > 0) {
				uni.setStorageSync('basics_info', res.data.data[0]);
				return res.data.data[0]
			}
		}
		Vue.prototype.checkAuthorization = function() {
			// 查看是否授权获取用户信息
			// #ifdef MP-WEIXIN
			uni.authorize({
				scope: 'scope.userInfo',
				success(res) {
					uni.setStorageSync('isAuth', true)
					// 获取用户信息
					uni.getUserInfo({
						provider: 'weixin',
						success: function(infoRes) {
							uni.setStorageSync('isAuth', true);
							uni.setStorageSync('wxuserinfo', infoRes.userInfo);
							Vue.prototype.getWxUserInfo(infoRes.userInfo);
						},
						fail: errMsg => {
							uni.setStorageSync('isAuth', false)
							console.log('获取用户信息失败失败', errMsg);
							Vue.prototype.toLoginPage()
						}
					});
				},
				fail(errMsg) {
					console.log('获取用户信息失败失败', errMsg);
					uni.setStorageSync('isAuth', false)
					uni.setStorageSync('isToLogin', false)
					debugger
					Vue.prototype.throttle(Vue.prototype.wxLogin(), 3000)

				}
			});
			// #endif
		}
		Vue.prototype.wxLogin = function(backUrl) {
			wx.login({
				success(res) {
					if (res.code) {
						//发起网络请求
						Vue.prototype.verifyLogin(res.code)
						wx.getSetting({
							success(res) {
								// checkAuthorization
								let isAuthUserInfo = res.authSetting['scope.userInfo']
								let isAuth = uni.getStorageSync('isAuth')
								let wxuserinfo = uni.getStorageSync('wxuserinfo')
								if (!isAuthUserInfo && !isAuth) {
									uni.showModal({
										title: '提示',
										content: "请先登录",
										success(res) {
											uni.setStorageSync('isToLogin', true)
											if (res.confirm) {
												Vue.prototype.judgeClientEnviroment()
												if (backUrl) {
													uni.navigateTo({
														url: '/pages/public/accountExec/accountExec?backUrl=' +
															backUrl
													})
												} else {
													uni.navigateTo({
														url: '/pages/public/accountExec/accountExec'
													})
												}
											} else {
												uni.setStorageSync('isAuth', false)
												uni.setStorageSync('isToLogin', false)
											}
										},
									})
								} else if (isAuthUserInfo) {
									wx.getUserInfo({
										success: function(res) {
											uni.setStorageSync('wxuserinfo', res
												.userInfo);
											Vue.prototype.getWxUserInfo(res
												.userInfo);
											// self.setWxUserInfo(res.userInfo);
											uni.setStorageSync('isAuth', true);
										},
										fail: function() {
											uni.setStorageSync('isAuth', false);
											uni.showToast({
												title: '未授权获取用户信息',
												icon: 'none'
											});
										}
									});
								}
							}
						})
					} else {
						uni.showToast({
							title: '授权失败！' + res.errMsg,
							icon: 'none'
						})
					}
				}
			})
		}
		Vue.prototype.toLoginPage = function(backUrl) {
			// if (!uni.getStorageSync('isToLogin')) {
			// #ifdef MP-WEIXIN
			wx.checkSession({
				success() {
					//session_key 未过期，并且在本生命周期一直有效
					if (uni.getStorageSync('isLogin') === false) {
						// 虽然session_key 未过期但是在百想后台的登录状态过期了
						Vue.prototype.throttle(Vue.prototype.wxLogin(backUrl), 3000)
						// Vue.prototype.wxLogin(backUrl)
					}
				},
				fail() {
					// session_key 已经失效，需要重新执行登录流程
					//重新登录
					debugger
					Vue.prototype.throttle(Vue.prototype.wxLogin(backUrl), 3000)
					// Vue.prototype.wxLogin(backUrl)
				}
			})
			// #endif
			// #ifdef H5
			if (uni.getStorageSync('isLogin') === false) {
				uni.showModal({
					title: '提示',
					content: "您还未登录,请先登录在进行相关操作,点击确定按钮跳转到登录页面",
					success(res) {
						if (res.confirm) {
							uni.setStorageSync('isToLogin', true)
							Vue.prototype.judgeClientEnviroment()
							if (backUrl) {
								uni.navigateTo({
									url: '/pages/public/accountExec/accountExec?backUrl=' +
										backUrl
								})
							} else {
								uni.navigateTo({
									url: '/pages/public/accountExec/accountExec'
								})
							}
						} else {
							uni.setStorageSync('isToLogin', false)
						}
					}
				})
			}
			// #endif
			// }
		}
		Vue.prototype.selectInfoFromMember = async function() {
			console.log('selectInfoFromMember')
			let userInfo = uni.getStorageSync('login_user_info');
			let wxUserInfo = uni.getStorageSync('wxuserinfo');
			if (userInfo.openid) {
				let url = Vue.prototype.getServiceUrl('zhxq', 'srvzhxq_member_front_select', 'select');
				let req = {
					serviceName: 'srvzhxq_member_front_select',
					colNames: ['*'],
					condition: [{
						colName: 'openid',
						value: userInfo.user_no,
						ruleType: 'eq'
					}],
					page: {
						pageNo: 1,
						rownumber: 10
					}
				};
				let res = await Vue.prototype.$http.post(url, req)
				if (res.data.state === 'SUCCESS' && res.data.data.length === 0) {
					// 基础信息表中不存在当前登录用户信息，跳转到填写基础信息表单
					uni.showModal({
						title: '提示',
						content: '请完善您的基础信息',
						showCancel: false,
						success(res) {
							if (res.confirm) {
								let params = {
									type: 'add',
									serviceName: 'srvzhxq_member_add'
								};
								let cond = [{
									"colName": "openid",
									value: userInfo.user_no
								}, {
									"colName": "nick_name",
									value: wxUserInfo.nickName
								}, {
									"colName": "avatar",
									value: wxUserInfo.avatarUrl
								}, {
									"colName": "gender",
									value: wxUserInfo.gender
								}, {
									"colName": "country",
									value: wxUserInfo.country
								}, {
									"colName": "province",
									value: wxUserInfo.province
								}, {
									"colName": "city",
									value: wxUserInfo.city,
								}]
								uni.navigateTo({
									url: '/pages/addInfo/addInfo?params=' + JSON.stringify(
										params) + '&cond=' + JSON.stringify(
										cond)
								});
							}
						}
					});
					return false
				} else if (res.data.state === 'SUCCESS' && res.data.data.length > 0 && res.data.data[0]
					.islock === '是') {
					uni.showModal({
						title: "提示",
						content: "当前帐号无权限访问",
						showCancel: false,
						confirmText: "知道了",
					})
					return false
				} else return true

			} else return false
		}
		Vue.prototype.getImagePath = (no, notThumb) => {
			if (no && (no.indexOf('http://') !== -1 || no.indexOf('https://') !== -1)) {
				return no
			} else if (no) {
				if (no.indexOf('&bx_auth_ticket') !== -1) {
					no = no.split('&bx_auth_ticket')[0]
				}
				if (notThumb) {
					return api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
						'bx_auth_ticket');
				} else {
					return api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
							'bx_auth_ticket') +
						'&thumbnailType=fwsu_100';
				}
			} else {
				return ''
			}
		}
		Vue.prototype.toPreviewImage = (urls) => {
			if (!urls) {
				return;
			}
			if (typeof urls === 'string') {
				urls = [urls];
			}
			urls = urls.map(url => {
				//若图片地址携带压缩图参数则预览时去掉此参数
				return url.replace(/&thumbnailType=fwsu_100/gi, '');
			});
			uni.previewImage({
				urls: urls,
				longPressActions: {
					itemList: ['发送给朋友', '保存图片', '收藏'],
					success: function(data) {
						console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
					}
				}
			});
		}
		Vue.prototype.strReplace = function(str, before, after) {
			console.log(str, before, after)
			if (str && before) {
				let a = before
				return str.replace(/[a]/g, after)
			} else {
				return false
			}
		}
		Vue.prototype.html2text = (str) => {
			let strs = ""
			if (!!str) {
				strs = str.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '')
					.replace(
						/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ')
			}

			return strs
		}
	}
}
