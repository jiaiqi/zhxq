<script>
	import Vue from 'vue'
	  
	export default {
		onLaunch: function() {
			this.judgeClientEnviroment()
			uni.setStorageSync("isThirdParty",this.$api.isThirdParty)
			uni.getSystemInfo({
				success: function(e) {
					// #ifndef MP
					Vue.prototype.StatusBar = e.statusBarHeight;
					if (e.platform == 'android') {
						Vue.prototype.CustomBar = e.statusBarHeight + 50;
					} else {
						Vue.prototype.CustomBar = e.statusBarHeight + 45;
					};
					// #endif

					// #ifdef MP-WEIXIN
					Vue.prototype.StatusBar = e.statusBarHeight;
					let custom = wx.getMenuButtonBoundingClientRect();
					Vue.prototype.Custom = custom;
					Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
					// #endif		

					// #ifdef MP-ALIPAY
					Vue.prototype.StatusBar = e.statusBarHeight;
					Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif
				}
			})

			Vue.prototype.ColorList = [{
					title: '嫣红',
					name: 'red',
					color: '#e54d42'
				},
				{
					title: '桔橙',
					name: 'orange',
					color: '#f37b1d'
				},
				{
					title: '明黄',
					name: 'yellow',
					color: '#fbbd08'
				},
				{
					title: '橄榄',
					name: 'olive',
					color: '#8dc63f'
				},
				{
					title: '森绿',
					name: 'green',
					color: '#39b54a'
				},
				{
					title: '天青',
					name: 'cyan',
					color: '#1cbbb4'
				},
				{
					title: '海蓝',
					name: 'blue',
					color: '#0081ff'
				},
				{
					title: '姹紫',
					name: 'purple',
					color: '#6739b6'
				},
				{
					title: '木槿',
					name: 'mauve',
					color: '#9c26b0'
				},
				{
					title: '桃粉',
					name: 'pink',
					color: '#e03997'
				},
				{
					title: '棕褐',
					name: 'brown',
					color: '#a5673f'
				},
				{
					title: '玄灰',
					name: 'grey',
					color: '#8799a3'
				},
				{
					title: '草灰',
					name: 'gray',
					color: '#aaaaaa'
				},
				{
					title: '墨黑',
					name: 'black',
					color: '#333333'
				},
				{
					title: '雅白',
					name: 'white',
					color: '#ffffff'
				},
			]

		},
		onShow: function() {
			if(this.$api.singleApp){
				// uni.setStorageSync('activeApp',this.$api.appName)
			}			
		},
		onHide: function() {
			console.log('App Hide')
		},
		onLoad(option) {
			console.log("app onLoad",option)
		}

	}
</script>

<style lang="less">
	@import "colorui/main.css";
	@import "colorui/icon.css";
	/*每个页面公共css */
	#app,uni-page-body,uni-page-wrapper{
		background: #f1f1f1 !important;
	}
	html,body{
		height: auto;
		background: #f1f1f1 !important;
	}
	uni-page-body>uni-view{
		height: 100%;
	}
	uni-page-wrapper,uni-page-body{
		min-height: calc(100vh - 44px);
	}
	// .cu-modal{
	// 	text-align: left;
	// }
	.cu-card.article>.cu-item .title{
		padding: 0;
	}
	.uni-input-placeholder,.uni-textarea-placeholder{
		box-sizing: border-box;
		padding: 10upx;
	}
	.cu-form-group {
		background-color: #ffffff;
		padding: 1upx 30upx;
		display: flex;
		flex-direction: column;
		align-items: self-start;
		flex-grow:1;
		min-height: 140upx;
		justify-content: space-between;
		.flex_row_c{
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
		>uni-view{
			width: 100%;
			box-sizing: border-box;
			display: block;
		}
		uni-input{
			line-height: 2.8em;
			height: 2.8em;
			min-height: 2.8em;
			overflow: hidden;
			margin:0upx;
			width: 100%;
			padding: 0;
			.uni-input-input{
				flex: 1;
				font-size: 32upx;
				color: #555;
				box-sizing: border-box;
				padding: 10upx;
				text-indent: 0;
				background: transparent;
				border: 1rpx solid #d0d4d6;
				resize:none; 
				border-radius: 4upx;
				outline:none;  /*清除选中效果的默认蓝色边框 */
				-webkit-appearance:none;  /*清除浏览器默认的样式 */
				line-height: normal;   /*光标问题*/
			}
			.uni-input-input:focus,.uni-textarea-textarea:focus{
				border: 1upx solid #0055ff;
				color: #333333;
				// background-color: #e9eef0;
				border-bottom-left-radius: 1px;
				border-bottom-right-radius: 1px;
			}
			&.valid_error{
				.uni-input-input{
					border: 1rpx solid #ff0000!important;
				}
			}
			&.date-input{
				.uni-input-wrapper{
					.uni-input-input{
							padding-right: 60upx!important;
					}
				}
			}
		}
		
		.title {
			// min-width: calc(4em + 15px);
			// width: 100vw;
			width: 100%;
			display: block;
			height: 80upx;
			line-height: 80upx;
			box-sizing: border-box;
		}
		.title.valid_error{
			color: #ff0000!important;
		}
		uni-textarea{
			margin: 0;
			.uni-textarea-textarea{
				flex: 1;
				font-size: 32upx;
				color: #555;
				box-sizing: border-box;
				padding: 10upx;
				text-indent: 0;
				background: transparent;
				border: 1rpx solid #d0d4d6;
				resize:none; 
				border-radius: 4upx;
				outline:none;  /*清除选中效果的默认蓝色边框 */
				-webkit-appearance:none;  /*清除浏览器默认的样式 */
				line-height: normal;   /*光标问题*/
			}
			&.valid_error{
				.uni-textarea-textarea{
					border: 1rpx solid #ff0000!important;
				}
			}
			.uni-input-input:focus,.uni-textarea-textarea:focus{
				border: 1upx solid #0055ff;
				color: #333333;
				// background-color: #e9eef0;
				border-bottom-left-radius: 1px;
				border-bottom-right-radius: 1px;
			}
		}
	}
	
	uni-checkbox-group {
	  // width: 100%;
	  display: flex;
	  flex-wrap: wrap;
	  .checkbox {
	    // width: 30%;
		padding: 10upx;
	    // line-height: 80upx;
	    text {
	      padding-left: 20upx;
		  span{
		  	font-size: 1.2em;
		  	padding: 0 10upx;
		  }
	    }
	  }
	}
	uni-radio-group{
		display: flex;
		flex-direction: row;
		flex-wrap:wrap;
		width: 100%;
		justify-content: flex-start;
		flex: 2;
		uni-radio{
			padding: 10upx;
			// width: 40%;
			.uni-radio-wrapper{
				span{
					font-size: 1.2em;
					padding: 0 10upx;
				}
			}
		}
	}
	uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked{
		background-color: #0081FF;
	}
	uni-page-head .uni-page-head{
		display: none;
	}
	uni-app uni-page-head {
	    // display: none;
		display: none;
	    box-sizing: border-box;
	}
	// .cu-dialog{
	// 	height: 100vh;
	// }
</style>
