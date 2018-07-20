angular.module('myApp')

.config(function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('dev',{
			url:'/dev',
			views:{
				'':{
					templateUrl:'pages/frm/main-top-bottom.html'
				},
				'topbar@dev':{
					templateUrl:'pages/nav-topbar.html'
				},
				'bottom@dev':{
					templateUrl:'pages/frm/main-left-right.html'
				},
				'sidebar@dev':{
					controller: 'sidebarCtrl',
					templateUrl:'pages/sidebar-dev.html'
				},
				'main@dev':{
					controller: 'cameraListCtrl',
					templateUrl: 'pages/camera/camera-list.html'
				}
			}
		})
		/* 摄像机信息 */
		.state('dev.camera',{
			url:'/camera',
			views:{
				'main@dev':{
					controller: 'cameraListCtrl',
					templateUrl: 'pages/camera/camera-list.html'
				}
			}
		})
		/* 摄像机  编辑*/
		.state('dev.camera.cameradetail',{
			url:'/:cameraid/:type',
			views:{
				'main@dev':{
					controller: 'editCameraCtrl',
					templateUrl: 'pages/camera/cam-edit.html'
				}
			}
		})
		/* 摄像机  新建*/
		.state('dev.camera.new',{
			url:'/new',
			views:{
				'main@dev':{
					controller: 'viewCameraCtrl',
					templateUrl: 'pages/camera/cam-view.html'
				}
			}
		})
		/* 摄像机组配置*/
		.state('dev.cameragroups',{
			url:'/cameragroups',
			views:{
				'main@dev':{
					controller: 'configGroupListCtrl',
					templateUrl: 'pages/camera-group/cameragroup-list.html'
				}
			}
		})
		/* 摄像机组配置  编辑*/
		.state('dev.cameragroups.camgroupsdetail',{
			url:'/:groupid/:type',
			views:{
				'main@dev':{
					controller: 'newConfigGroupCtrl',
					templateUrl: 'pages/camera-group/camgroup-view.html'
				}
			}
		})
		/* 摄像机组配置  新建*/
		.state('dev.cameragroups.new',{
			url:'/new',
			views:{
				'main@dev':{
					controller: 'newConfigGroupCtrl',
					templateUrl: 'pages/camera-group/camgroup-new.html'
				}
			}
		})
		/*设备存储摄像机列表*/
		.state('dev.camerastorage',{
			url:'/camerastorage',
			views:{
				'main@dev':{
					controller: 'cameraStorageCtrl',
					templateUrl: 'pages/camera-storage/camera-storage.html'
				}
			}
		})
		/*设备存储摄像机  详情*/
		.state('dev.camerastorage.detail',{
			url:'/:cid',
			views:{
				'main@dev':{
					controller: 'cameraStorageDetailCtrl',
					templateUrl: 'pages/camera-storage/camera-storage-detail.html'
				}
			}
		})
		
})