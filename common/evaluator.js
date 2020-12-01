/**
 * @param {Object} rowData 当前行数据
 * @param {String} formula 需要根据当前js转化为表达式的json字符串
 */
// 导入方式: import evaluatorTo from 'path/evaluator.js'
//  调用方式: evaluatorTo(rowData,formula)
function evaluatorTo(rowData, formula) {
	let result = null
	let evaluator = function(formula, result) {
		if (typeof formula === 'object') {
			Object.keys(formula).forEach((operator, index) => {
				switch (operator) {
					case 'if': //if(xx){}else{}
						result = evaluator(formula[operator][0], result) ? formula[operator][1] : formula[operator][2]
						break;
					case 'and': // &&
						let a = true
						formula[operator].forEach(_formula => {
							Object.keys(_formula).forEach(_operator => {
								if (!evaluator(_formula, result)) {
									a = false //有假则假
								}
							})
						})
						result = a
						break;
					case 'or': // 或 ||
						let o = false
						formula[operator].forEach(_formula => {
							Object.keys(_formula).forEach(_operator => {
								if (evaluator(_formula, result)) {
									o = true //有真则真
								}
							})
						})
						result = o
						break;
					case 'not': //取反 !
						break;
					case 'eq': //等于 === equal
						if (!formula[operator].val) {
							result = !rowData[evaluator(formula[operator]['col'], result)]
						} else if (typeof formula[operator].val !== 'string') {
							// val为对象
							let valueObj = formula[operator].val
							let value = ''
							if (valueObj.value_key && valueObj.value_type) {
								switch (valueObj.value_type) {
									case 'rowData':
										result = rowData[evaluator(formula[operator]['col'], result)] == rowData[valueObj.value_key]
										break;
									case 'login_user_info':
										let login_user_info = uni.getStorageSync('login_user_info')
										if(login_user_info&&typeof login_user_info==='object'){
											result = rowData[evaluator(formula[operator]['col'], result)] == login_user_info[valueObj.value_key]
										}else{
											result = false
										}
										break;
									default:
										result = rowData[evaluator(formula[operator]['col'], result)] == rowData[valueObj.value_key]
										break;
								}
							}
						} else {
							result = rowData[evaluator(formula[operator]['col'], result)] == formula[operator].val
						}
						break;
					case 'neq': //不等于 !== not equal
						if (!formula[operator].val) {
							result = !!rowData[evaluator(formula[operator]['col'], result)]
						} else if (typeof formula[operator].val !== 'string') {
							// val为对象
							let valueObj = formula[operator].val
							let value = ''
							if (valueObj.value_key && valueObj.value_type) {
								switch (valueObj.value_type) {
									case 'rowData':
										result = rowData[evaluator(formula[operator]['col'], result)] != rowData[valueObj.value_key]
										break;
									case 'login_user_info':
									case 'top.user':
										let login_user_info = uni.getStorageSync('login_user_info')
										if(login_user_info&&typeof login_user_info==='object'){
											result = rowData[evaluator(formula[operator]['col'], result)] != login_user_info[valueObj.value_key]
										}else{
											result = false
										}
										break;
									default:
										result = rowData[evaluator(formula[operator]['col'], result)] != rowData[valueObj.value_key]
										break;
								}
							}
						} else {
							result = rowData[evaluator(formula[operator]['col'], result)] != formula[operator].val
						}
						break;
					case 'gt': // greater than or equal >
						result = rowData[evaluator(formula[operator]['col'], result)] > formula[operator].val
						break;
					case 'gte': // greater than >
						result = rowData[evaluator(formula[operator]['col'], result)] >= formula[operator].val
						break;
					case 'lt': // less than
						result = rowData[evaluator(formula[operator]['col'], result)] < formula[operator].val
						break;
					case 'le': // less than or equal
						result = rowData[evaluator(formula[operator]['col'], result)] <= formula[operator].val
						break;
					case 'add': // + 加
						break;
					case 'sub': // - 减
						break;
					case 'mul': //multiply 乘 *
						break;
					case 'div': // divide 除 /
						break;
					default:
						result = result
						break;
				}
			});
		} else {
			result = formula
		}
		return result
	};
	return evaluator(formula, result)
}

export default evaluatorTo
