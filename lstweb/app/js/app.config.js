angular.module('myApp')

.config(function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('app',{
			url:'/app',
			views:{
				'':{
					templateUrl:'pages/frm/main-top-bottom.html'
				},
				'topbar@app':{
					templateUrl:'pages/nav-topbar.html'
				},
				'bottom@app':{
					templateUrl:'pages/frm/main-left-right.html'
				},
				'sidebar@app':{
					controller: 'sidebarCtrl',
					templateUrl:'pages/sidebar-task.html'
				},
				'main@app':{
					controller: 'lookctrl',
					templateUrl: 'pages/view/look-list.html'
				}
			}
		})
		/* 查看 */
		.state('app.view',{
			url: '/view',
			views: {
				'main@app':{
					controller: 'lookctrl',
					templateUrl: 'pages/view/look-list.html'
				}
			}
		})
		/* 采集 */
		.state('app.capture',{
			url: '/capture',
			views: {
				'main@app':{
					controller: 'taskListCtrl',
					templateUrl: 'pages/capture/task-list.html'
				}
			}
		})
		/* 采集 编辑 */
		.state('app.capture.capturedetail',{
			url: '/:captureid/:type',
			views: {
				'main@app':{
					controller: 'captureCtrl',
					templateUrl: 'pages/capture/new-capture.html'
				}
			}
		})
		/* 采集 新建 */
		.state('app.capture.new',{
			url: '/new',
			views: {
				'main@app':{
					controller: 'captureCtrl',
					templateUrl: 'pages/capture/new-capture.html'
				}
			}
		})
		/* 采集 查看 */
		.state('app.capture.captureview',{
			url: '/:captureid/view',
			views: {
				'main@app':{
					controller: 'captureViewCtrl',
					templateUrl: 'pages/capture/view-capture.html'
				}
			}
		})
		/* 布控 */
		.state('app.monitor',{
			url: '/monitor',
			views: {
				'main@app':{
					controller: 'monitorTaskListCtrl',
					templateUrl: 'pages/monitor/task-list.html'
				}
			}
		})
		/* 布控 编辑 */
		.state('app.monitor.monitordetail',{
			url: '/:monitorid/:type',
			views: {
				'main@app':{
					controller: 'monitorCtrl',
					templateUrl: 'pages/monitor/new-monitor.html'
				}
			}
		})
		/* 布控 新建 */
		.state('app.monitor.new',{
			url: '/new',
			views: {
				'main@app':{
					controller: 'monitorCtrl',
					templateUrl: 'pages/monitor/new-monitor.html'
				}
			}
		})
		/* 布控 查看 */
		.state('app.monitor.monitorview',{
			url: '/:monitorid/view',
			views: {
				'main@app':{
					controller: 'viewMonitorCtrl',
					templateUrl: 'pages/monitor/view-monitor.html'
				}
			}
		})
		/* 目标检索 */
		.state('app.search',{
			url: '/search',
			views: {
				'main@app':{
					controller: 'searchTaskListCtrl',
					templateUrl: 'pages/search/task-list.html'
				}
			}
		})
		/* 目标检索 编辑*/
		.state('app.search.searchdetail',{
			url: '/:searchid/:type',
			views: {
				'main@app':{
					controller: 'newSearchTaskCtrl',
					templateUrl: 'pages/search/new-search.html'
				}
			}
		})
		/* 目标检索 新建*/
		.state('app.search.new',{
			url: '/new',
			views: {
				'main@app':{
					controller: 'newSearchTaskCtrl',
					templateUrl: 'pages/search/new-search.html'
				}
			}
		})
		/* 目标检索 查看*/
		.state('app.search.searchview',{
			url: '/:searchid/view',
			views: {
				'main@app':{
					controller: 'viewSearchInfoCtrl',
					templateUrl: 'pages/search/view-search.html'
				}
			}
		})
		/* 轨迹分析*/
		.state('app.track',{
			abstract: true,
			url: '/track',
			views: {
				'main@app':{
					//controller: 'funcTrackCtrl',
					templateUrl: 'pages/track/emTrackMap.html' 
				}
			}
		})
		/* 轨迹分析*/
		.state('app.track.map',{
			url: '/map',
			views: {
				'map@app.track':{
					controller: 'funcTrackCtrl',
					templateUrl: 'pages/track/major-data-tray.html' 
				}
			}
		})
		/* 时间分析 编辑*/
		.state('app.timeline',{
			url: '/timeline',
			views: {
				'main@app':{
					controller: 'timeListCtrl',
					templateUrl: 'pages/time-line/time-list.html'
				}
			}
		})
		.state('app.timeline.timelinedetail',{
			url: '/:timelineid/:type',
			views: {
				'main@app':{
					controller: 'newTimeCtrl',
					templateUrl: 'pages/time-line/new-time.html'
				}
			}
		})
		/* 时间分析 新建*/
		.state('app.timeline.new',{
			url: '/new',
			views: {
				'main@app':{
					controller: 'newTimeCtrl',
					templateUrl: 'pages/time-line/new-time.html'
				}
			}
		})
		/* 时间分析 查看*/
		.state('app.timeline.timelineview',{
			url: '/:timelineid/view',
			views: {
				'main@app':{
					controller: 'viewTimeCtrl',
					templateUrl: 'pages/time-line/view-timeline.html'
				}
			}
		})
		/* 业务逻辑组 */
		.state('app.logicgroup',{
			url: '/logicgroup',
			views: {
				'main@app':{
					controller: 'logicGroupListCtrl',
					templateUrl: 'pages/logic-group/logicGroup-list.html'
				}
			}
		})
		/* 业务逻辑组 编辑*/
		.state('app.logicgroup.logicgroupdetail',{
			url: '/:logicgroupid/:type',
			views: {
				'main@app':{
					controller: 'editLogicGroupCtrl',
					templateUrl: 'pages/logic-group/logicGroup-view.html'
				}
			}
		})
		/* 业务逻辑组 新建*/
		.state('app.logicgroup.new',{
			url: '/new',
			views: {
				'main@app':{
					controller: 'editLogicGroupCtrl',
					templateUrl: 'pages/logic-group/logicGroup-new.html'
				}
			}
        })
        /* 布控库管理*/
        .state('app.monitorManage',{
            url: '/monitorManage',
            views: {
                'main@app':{
                    controller: 'monitorManageCtrl',
                    templateUrl: 'pages/monitorManage/monitorManage.html'
                }
            }
        })
        /* 布控库管理 查看*/
        .state('app.monitorManage.detail',{
            url: '/detail/:id',
            views: {
                'main@app':{
                    controller: 'monitorManageDetailCtrl',
                    templateUrl: 'pages/monitorManage/monitorManageDetail.html'
                }
            }
        })
        /* 布控库管理 编辑*/
        .state('app.monitorManage.edit',{
            url: '/edit/:id/:src_id/:name/:meno',
            views: {
                'main@app':{
                    controller: 'monitorManageEditCtrl',
                    templateUrl: 'pages/monitorManage/monitorManageEdit.html'
                }
            }
        })
})