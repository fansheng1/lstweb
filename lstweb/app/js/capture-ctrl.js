angular.module('myApp')

.factory('factory_mondata', function() {
	var data = {
		task_id: ''
	}
	return {
		getter: function() {
			return data
		},
		setter: function(s) {
			data = s
		}
	}
})

.controller('taskListCtrl', ['$scope', '$http', '$location', 'factory_mondata','i18nService', function($scope, $http, $location, factory_mondata, i18nService) {
		// 国际化
		i18nService.setCurrentLang("zh-cn");
		$scope.formatStatus = e => e == true ? '运行中' : '未运行'
		$scope.formatStatusClass = e => e == true ? 'coinGreenInline':'coinRedInline'
		var parser = new CaptureTaskModel();
		$scope.task_id_arr = [];
		$scope.edit = entity => {
			window.location.href = '#/app/capture/' + entity.task_id + '/info'
		}
		$scope.detail = entity => { //#/app/capture/{{row.entity.task_id}}/view
			window.location.href = '#/app/capture/' + entity.task_id + '/view'
		}
		$scope.gridOptions = {
			defaultClick:(entity) => {
				// window.location.href = '#/app/monitorManage/detail/' + entity.extlib_id
				window.location.href = '#/app/capture/' + entity.task_id + '/view'
			},
			LstPagination:true,
			paginationPageSizes: [10,20,30,50,75], //每页显示个数可选项
			paginationPageSize: 20, //
			paginationCurrentPage: 1,
			enableGridMenu: true,
			enablePagination: true,
			useExternalPagination: true,
			enableSorting: false,
			enableColumnMenus:false,
			columnDefs: [
				{field: 'task_name', displayName: '任务名称',cellTooltip:true},
				{field: 'running', displayName: '状态',cellTemplate:`
					<div class="ui-grid-cell-contents">
						<span class={{grid.appScope.formatStatusClass(row.entity.running)}}></span>{{grid.appScope.formatStatus(row.entity.running)}}
					</div>
				`},
				{field: 'create_time', displayName: '创建时间',cellTooltip:true},
				{field: 'task_desc', displayName: '说明',cellTooltip:true},
				{
					field: "操作",
					cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.edit(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="detail-icon tasklist-action-btn" ng-click="grid.appScope.detail(row.entity);$event.stopPropagation()" title="查看"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.delCaptureTask(row.entity.task_id);$event.stopPropagation()" title="删除"></i>
                        </div>
                    `
				}
			],
			onRegisterApi: function(gridApi){
				$scope.gridApi = gridApi;
				//分页按钮事件
				gridApi.pagination.on.paginationChanged($scope,(new_page,page_size)=>{
					//清空全选
					gridApi.selection.clearSelectedRows();
					if(new_page==1 || new_page==parseInt($scope.gridOptions.totalItems/page_size)+1){
						$scope.getNumOfCaptures();
					}
					$scope.CaptureTask(new_page,page_size);
				});
				//行选中事件
				gridApi.selection.on.rowSelectionChanged($scope,function(row){
					$scope.task_id_arr = [];
					var rows = $scope.gridApi.selection.getSelectedGridRows();
					rows.forEach((item)=>{
						$scope.task_id_arr.push(item.entity.task_id)
					});
				});
				//全选事件
				gridApi.selection.on.rowSelectionChangedBatch($scope,function(row){
					var selectionAll  =  $scope.gridApi.selection.getSelectAllState();
					//调用这个方法可以判断是否全选，返回正则类型
					if(!selectionAll){
						$scope.task_id_arr = [];
						var rows = $scope.gridApi.selection.getSelectedGridRows();
						rows.forEach((item)=>{
							$scope.task_id_arr.push(item.entity.task_id)
						})
					}else{
						$scope.task_id_arr = [];
					}
				});
			}
		};

	function getWord (url) {
		$scope.searchWord = $scope.searchWord ? $scope.searchWord : ''
	}
	$scope.getNumOfCaptures = function(){
		getWord ();
		let url ='/controller/captures/count'
		if($scope.searchWord){
			url = '/controller/captures/count?name='+$scope.searchWord
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url
		}).then(function successCallback(response) {
			$scope.gridOptions.totalItems = response.data.count;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
		};
		$scope.CaptureTask=function(current_page,page_size){
			getWord();
			let url = '/controller/captures?page='+ current_page + "&pagesize=" + page_size
			if($scope.searchWord){
				url = '/controller/captures?name=' + $scope.searchWord + "&page="+ current_page + "&pagesize=" + page_size
			}
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url
			}).then(function successCallback(response) {
				var data = response.data;
				if(data.status != undefined && data.status == false){
					$.LstTips(data.reason);
					return
				}
				$scope.gridOptions.data = parser.procTasks(response.data);
				$scope.gridOptions.paginationCurrentPage = current_page;
				$scope.gridOptions.paginationPageSize = page_size;
			}, function errorCallback(response) {
				// 请求失败执行代码
			});
		}

		$scope.getNumOfCaptures();
		$scope.CaptureTask(1,$scope.gridOptions.paginationPageSize);

		$scope.editCaptureTask = function(task_id, $event) {
			factory_mondata.setter({
				task_id: task_id
			})
			if($event && $event.srcElement.tagName == 'INPUT' ){
				return
			}
			$location.path("/capture/new")
		}
		$scope.viewCaptureTask = function(task_id, $event) {
			factory_mondata.setter({
				task_id: task_id
			})
			if($event && $event.srcElement.tagName == 'INPUT' ){
				return
			}
			$location.path("/cap-view")
		}

		$scope.removeTasks = function(){
			if($scope.task_id_arr == []){
				return
			}
			$scope.task_id_arr.forEach(function(e){
				//console.log("removed task ID: "+e)
				$scope.delCaptureTask(e)
			})
		}
		$scope.delCaptureTask = function(task_id) {
			if (task_id && task_id.length > 0) {
				$http({
					method: "delete",
					url: "/controller/capture/" + task_id,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					var data = response.data;
					if(data.status){
						$scope.CaptureTask($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
					}
				});
			}
		};

		$scope.SearchCaptureTask = function(){
			$scope.getNumOfCaptures();
			$scope.CaptureTask(1,$scope.gridOptions.paginationPageSize);
		};
		$scope.keyDown=function($event){
			if($event.keyCode==13){
				$scope.SearchCaptureTask();
			}
		};

	/*
            $scope.SearchCaptureTask = function() {
                var t_name=$("#t_name").val();
                if(t_name==undefined || t_name == ""){
                    $.LstTips("请输入查询条件");
                    $scope.CaptureTask(1,$scope.gridOptions.paginationPageSize);
                }else{
                    $http({
                        method: "get",
                        url: "/controller/captures/cond/" + t_name,
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Accept': 'application/json; charset=utf-8'
                        }
                    }).then(function(response) {
                        //$scope.captureTasks = parser.procTasks(response.data);
                        $scope.gridOptions.data = parser.procTasks(response.data);
                    });
                }
            }
    */
}])

.controller('captureCtrl', function($scope, $http, $interval,factory_mondata,$stateParams) {
	$scope.routerStr = "添加"
	var task_id = factory_mondata.getter().task_id;
	task_id=$stateParams.captureid;
	if(task_id){
		$scope.routerStr = "更新"
	}
	var type=$stateParams.type;
	$scope.model = {}
	var parser = new CaptureTaskModel();

	if (task_id && task_id.length > 0 && type=="info") {
		$scope.edit_status = "编辑采集参数"
		$http({
			method: "get",
			url: "/controller/capture/" + task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.model = parser.taskmodel(data)
		});
	} else {
		$scope.edit_status = "新建采集任务"
	}

	$http({
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		url: '/controller/cameragroups'
	}).then(function successCallback(response) {
		$scope.cameraGroups = response.data;
	}, function errorCallback(response) {
		// 请求失败执行代码
	});

	$scope.addCaptureTask = function(isNew) {
		$scope.model.startTime = $("#cap_start_time").val()
		$scope.model.endTime = $("#cap_stop_time").val()
		if(compareDatetime($scope.model.startTime, $scope.model.endTime)>=0){
			return $.LstTips("任务开始时间大于或等于结束时间，请重新设置！")
		}
		var task_data = parser.setNewTaskData($scope.model)
		$http({
			method: isNew ? "post" : "put",
			url: "/controller/capture",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: task_data
		}).then(function(response) {
			if(response.data.reason){
				$.LstTips(response.data.reason,3000)
				return
			}
			var data = response.data;
			$scope.model = parser.newTaskResponseModel(data);
			$scope.routerStr = "更新"
		}, null);
	};

	$scope.updateCaptureTask = function(task){
		$scope.addCaptureTask( (task.task_id == undefined) ? true : false)
	}

	$scope.startCapture = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}
		$http({
			method: "get",
			url: "/controller/capture/" + $scope.model.task_id + "/start",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			if(data.status != undefined && data.status == false){
				$scope.taskStatus = data.reason;
				return
			}
			$scope.taskStatus = data.status ? "开始采集..." : "开始采集失败";
		}, null);
	};

	$scope.stopCapture = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/capture/" + $scope.model.task_id + "/stop",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			if(data.status != undefined && data.status == false){
				$scope.taskStatus = data.reason;
				return
			}
			$scope.taskStatus = data.status ? "已停止采集" : "停止采集失败";
		}, null);
	};
})

.controller('captureViewCtrl', function($scope, $http, $interval,factory_mondata, RefreshManager,$stateParams) {
	var task_id = factory_mondata.getter().task_id;
	task_id=$stateParams.captureid;
	$scope.running = false
	$scope.getStatus = () => {
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/task/'+ task_id + '/status'
		}).then(function(res){
			$scope.running = res.data.running
		})
	}
	$scope.getStatus();
	var imagesArray = []
	$scope.conf = {
		max_list_item: 21,
		refresh: false,
		refresh_interval: 2000,
		refersh_timer: null
	}
	$scope.model = {task_id: task_id}

	var parser = new CaptureTaskModel();
	var Pager = new PagerModel();
	$scope.goto = function(){
		Pager.setPagerTo($scope.pager.page, $scope.pager.page_size);
		$scope.viewCaptureTask();
	};
	$scope.gotoFirst = function(){
		Pager.setPagerTo(1, $scope.pager.page_size);
		$scope.viewCaptureTask();
	};
	$scope.gotoPrev = function(){
		Pager.setPagerNext(false, $scope.pager.page_size);
		$scope.viewCaptureTask();
	};
	$scope.gotoNext = function(){
		Pager.setPagerNext(true, $scope.pager.page_size);
		$scope.viewCaptureTask();
	};
	$scope.gotoTail = function(){
		Pager.setPagerTo(1000000, $scope.pager.page_size);
		$scope.viewCaptureTask();
	};
	$scope.getNumOfViewCaptures = function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/captures/history/count/'+task_id
		}).then(function successCallback(response) {
			var data = response.data
			$scope.viewCaptureTask();
			Pager.setPagerInfo(1, 12, data.count)
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};
	$scope.getNumOfViewCaptures();
	$scope.viewCaptureTask=function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/capture/history/'+task_id +'/result'+'?' + Pager.getPagerParams()
		}).then(function successCallback(response) {
			var data = response.data;
			if(data.status != undefined && data.status == false){
				$.LstTips(data.reason)
				return
			}
			$scope.viewCaptureTasks = parser.procTasksResult(response.data);
			$scope.pager = Pager.getPagerInfo()
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};
	if (task_id && task_id.length > 0) {
		$http({
			method: "get",
			url: "/controller/capture/" + task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function (response) {
			var data = response.data;
			$scope.model = parser.taskmodel(data)
			$scope.title = "任务: ["+$scope.model.task_name + "] 实时采集结果"
		});
	} else {
		$scope.title = "实时采集结果"
	}

	$scope.startCapture = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}
		$http({
			method: "get",
			url: "/controller/capture/" + $scope.model.task_id + "/start",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.getStatus();
		}, null);
	};

	$scope.stopCapture = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/capture/" + $scope.model.task_id + "/stop",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.getStatus();
		}, null);
	};

	$scope.toggleRefreshCaptureResult = function() {
		var conf = $scope.conf

		if (conf.refresh == false) {
			$scope.conf.refresh = true
			$(".active-img").css("display","block");
			$(".active-img-right").css("display","none");

			RefreshManager.interval($interval, function() {
				$.ajax({
					url: "/controller/capture/" + $scope.model.task_id + "/result"+"?delta=3",
					type: "get",
					success: function(msg) {
						$scope.image_seqence = parser.procCaptureResult(msg, $scope.conf)
					}
				});
			}, conf.refresh_interval);

		} else {
			RefreshManager.cancel()
			$scope.conf.refresh = false;
			$(".active-img").css("display","none");
			$(".active-img-right").css("display","block");
		}

	}

	$scope.$on('$destroy', function(){
		RefreshManager.cancel()
		$scope.conf.refresh = false
	})

	$scope.toggleRefreshCaptureResult();
})

