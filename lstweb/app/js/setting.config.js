angular.module('myApp')

.config(function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('setting',{
			url:'/setting',
			views:{
				'':{
					templateUrl:'pages/frm/main-top-bottom.html'
				},
				'topbar@setting':{
					templateUrl:'pages/nav-topbar.html'
				},
				'bottom@setting':{
					templateUrl:'pages/frm/main-left-right.html'
				},
				'sidebar@setting':{
					controller: 'sidebarCtrl',
					templateUrl:'pages/sidebar-setting.html'
				},
				'main@setting':{
					controller: 'userListCtrl',
					templateUrl: 'pages/user/user-list.html'
				}
			}
		})
		/* 日志管理 */
		.state('setting.logmanage',{
			url:'/logmanage',
			views:{
				'main@setting':{
					controller: 'logctrl',
					templateUrl: 'pages/audit-log/log-list.html'
				}
			}
		})
		/* 用户/角色 */
		.state('setting.user',{
			url:'/user',
			views:{
				'main@setting':{
					controller: 'userListCtrl',
					templateUrl: 'pages/user/user-list.html'
				}
			}
		})
		/* 日志详情 */
		.state('setting.logmanage.logdetail',{
			url:'/:logid/:type',
			views:{
				'main@setting':{
					controller: 'logDetailCtrl',
					templateUrl: 'pages/audit-log/audit-log-detail.html'
				}
			}
		})
		/* 用户/角色 编辑 */
		.state('setting.user.userdetail',{
			url:'/:userid/:type',
			views:{
				'main@setting':{
					controller: 'userCtrl',
					templateUrl: 'pages/user/user-view.html'
				}
			}
		})
		/* 用户/角色 新建 */
		.state('setting.user.new',{
			url:'/new',
			views:{
				'main@setting':{
					controller: 'userCtrl',
					templateUrl: 'pages/user/new-user.html'
				}
			}
		})
		/* 用户组 */
		.state('setting.role',{
			url:'/role',
			views:{
				'main@setting':{
					controller: 'rolectrl',
					templateUrl: 'pages/role/role-list.html'
				}
			}
		})
		/* 用户组  编辑*/
		.state('setting.role.roledetail',{
			url:'/:roleid/:type',
			views:{
				'main@setting':{
					controller: 'rolectrl',
					templateUrl: 'pages/role/role-view.html'
				}
			}
		})
		/* 用户组 新建 */
		.state('setting.role.new',{
			url:'/new',
			views:{
				'main@setting':{
					controller: 'rolectrl',
					templateUrl: 'pages/role/new-role.html'
				}
			}
		})
		/* 报警列表 */
		.state('setting.alarm',{
			url:'/alarm',
			views:{
				'main@setting':{
					controller: 'alarmListCtrl',
					templateUrl: 'pages/alarm/alarm-list.html'
				}
			}
		})
		/* 集群存储 */
		.state('setting.clusterstorage',{
			url:'/clusterstorage',
			views:{
				'main@setting':{
					controller: 'clusterStorageCtrl',
					templateUrl: 'pages/cluster-storage/cluster-storage.html'
				}
			}
		})
		/* 集群存储摄像机列表 */
		.state('setting.clusterstorage.list',{
			url:'/detail',
			views:{
				'main@setting':{
					controller: 'clusterStorageListCtrl',
					templateUrl: 'pages/cluster-storage/cluster-storage-list.html'
				}
			}
		})
		/* 集群存储摄像机详情 */
		.state('setting.clusterstorage.detail',{
			url:'/:cid',
			views:{
				'main@setting':{
					controller: 'clusterStorageDetailCtrl',
					templateUrl: 'pages/cluster-storage/cluster-storage-detail.html'
				}
			}
		});

})