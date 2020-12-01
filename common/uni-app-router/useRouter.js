import Vue from 'vue'
import Router from 'uni-simple-router';
Vue.use(Router);
const router = new Router({
	routes: [{
			path: "/pages/index/index",
			name: 'index'
		},{
			path: "/pages/list/tabList",
			name: 'list'
		},
		
	]
});

// router.beforeEach((to, from, next) => {
// 	if (to.name == 'tabbar-5') {
// 		next({
// 			name: 'router4',
// 			params: {
// 				msg: '我拦截了tab5并重定向到了路由4页面上',
// 			},
// 			NAVTYPE: 'push'
// 		});
// 		//next();
// 	} else {
// 		if (to.name == 'tabbar-1') {
// 			next({
// 				path: '/pages/tabbar/tabbar-3/tabbar-3',
// 				NAVTYPE: 'pushTab'
// 			});
// 		} else {
// 			next();
// 		}
// 	}
// 	// console.log(to);
// 	// console.log(from)
// })
router.afterEach((to, from) => {
	// console.log(to);
	// console.log(from)
})
// console.log(router)

export default router
