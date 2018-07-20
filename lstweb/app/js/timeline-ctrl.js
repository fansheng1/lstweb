angular.module('myApp')

// inter-controller communication
.factory('factory_data', function() {
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

.controller('newTimeCtrl', function($scope, $http, $location, factory_data, $interval,$stateParams) {
	var task_id = $stateParams.timelineid;
	var type=$stateParams.type;
	var imagesArray = []
	
	$scope.model = {};
	var parser = new TimeSearchTaskModel();

	if (task_id && task_id.length > 10 && type=="info") {
		$scope.edit_status="编辑任务详情";
		$http({
			method: "get",
			url: "/controller/timeSearch/" + task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
		}).then(function(response) {
			var data = response.data;
			$scope.model = parser.task2model(data)
		});
	}else{
		$scope.edit_status="新建任务详情";
	}

	$scope.updateTimeSearchTask = function(task) {
		$scope.addTimeSearchTask( (task.task_id == undefined) ? true : false)
	}

	$scope.addTimeSearchTask = function(is_new_task) {
		$scope.model.startTime = $('#start_time').val()
		$scope.model.endTime = $('#stop_time').val()
		if(compareDatetime($scope.model.startTime, $scope.model.endTime)>=0){
			return alert("任务开始时间大于或等于结束时间，请重新设置！")
		}
		var task_data = parser.setNewTimeTaskData($scope.model);
		var url = (is_new_task) ? "/controller/timeSearch" :
			"/controller/timeSearch"+"/"+$scope.model.task_id

		$http({
			method: is_new_task ? "post" : "put",
			url: url,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: task_data,
		}).then(function(response) {
			var data = response.data;
			$scope.model = parser.newTaskResponseModel(data)
		}, null);
	};
})

.controller('viewTimeCtrl', function($scope, $http, factory_data, $interval, DB, RefreshManager,$stateParams) {
	var task_id = $stateParams.timelineid;
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
	var parser = new TimeSearchTaskModel();
	var Pager = new PagerModel()
	var isRefresh = false;
	$scope.goto = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerTo($scope.pager.page, $scope.pager.page_size)
		$scope.viewTimeSearchTask()
	}
	$scope.gotoFirst = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerTo(1, $scope.pager.page_size)
		$scope.viewTimeSearchTask()
	}
	$scope.gotoPrev = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerNext(false, $scope.pager.page_size)
		$scope.viewTimeSearchTask()
	}
	$scope.gotoNext = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerNext(true, $scope.pager.page_size)
		$scope.viewTimeSearchTask()
	}
	$scope.gotoTail = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerTo(1000000, $scope.pager.page_size)
		$scope.viewTimeSearchTask()
	}

	$scope.getNumOfViewSearchs = function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url:  '/controller/timeSearchs/history/count/'+task_id
		}).then(function successCallback(response) {
			var data = response.data
			$scope.viewTimeSearchTask()
			Pager.setPagerInfo(1, 7, data.count)
			$scope.pager = Pager.getPagerInfo()
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}

	$scope.getNumOfViewSearchs()

	$scope.viewTimeSearchTask=function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/timeSearch/history/'+task_id +'/result'+'?' + Pager.getPagerParams()
		}).then(function successCallback(response) {
			var data=response.data
			$scope.image_seqence = parser.viewProcTasks(data.results,$scope.conf)
			$scope.pager = Pager.getPagerInfo()
			$scope.getStatus();
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}
	$scope.conf = {
		max_list_item: 7,
		refresh: false,
		refresh_interval: 1000,
		refersh_timer: null
	}

	$scope.toggleRefreshTimeResult = function(intv) {
		var conf = $scope.conf
		if (intv != undefined && intv >= 1000) {
			$scope.conf.refresh_interval = intv
		}
		if(task_id == undefined){
			return
		}
		if (conf.refresh == false) {
			var max_list_item = $scope.conf.max_list_item

			$scope.conf.refresh = true
			$(".active-img").css("display","none");
			$(".active-img-right").css("display","block");
			RefreshManager.interval($interval,function() {
				$.ajax({
					url: "/controller/timeSearch/" + task_id + "/result?delta=1000000&page=1&pagesize=20",
					type: "get",
					success: function(msg) {
						$scope.image_seqence = parser.procSearchResult(msg.results, $scope.conf)
						$scope.getStatus();
					}
				});
			}, conf.refresh_interval);
		} else {
			RefreshManager.cancel()
			isRefresh = false
			$scope.conf.refresh = false
			$(".active-img").css("display","block");
			$(".active-img-right").css("display","none");
			$scope.getNumOfViewSearchs();
		}
	}

		$scope.$on('$destroy', function(){
			RefreshManager.cancel()
			$scope.conf.refresh = false
		})

		$scope.toggleRefreshTimeResult();
})

	.controller('timeListCtrl',['$scope', '$http', '$location', 'factory_data', 'i18nService' ,function($scope, $http, $location, factory_data, i18nService) {
		i18nService.setCurrentLang("zh-cn");
		$scope.edit = entity => window.location.href = '#/app/timeline/' + entity.task_id + '/info'  // 编辑
		$scope.detail = entity => window.location.href = '#/app/timeline/' + entity.task_id + '/view' // 查看
		$scope.formatStatus = e => e == true ? '运行中' : '未运行' // 翻译
		$scope.formatStatusClass = e => e == true ? 'coinGreenInline':'coinRedInline' // formatClass
		// var parser = new TimeSearchTaskModel();
		$scope.task_id_arr = [];
		$scope.gridOptions = {
			defaultClick: entity => $scope.detail(entity),
			LstPagination:true,
			paginationPageSizes: [12,20,30,50,75],
			paginationPageSize: 12,
			paginationCurrentPage: 1,
			enableGridMenu: true,
			enablePagination: true,
			useExternalPagination: true,
			enableSorting: false,
			enableColumnMenus:false,
			columnDefs: [
				{field: 'task_name', displayName: '任务名称'},
				{field: 'running', displayName: '状态',cellTemplate:`
					<div class="ui-grid-cell-contents">
						<span class={{grid.appScope.formatStatusClass(row.entity.running)}}></span>{{grid.appScope.formatStatus(row.entity.running)}}
					</div>
				`},
				{field: 'create_time', displayName: '创建时间'},
				{
					field: "操作",
					cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.edit(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="detail-icon tasklist-action-btn" ng-click="grid.appScope.detail(row.entity);$event.stopPropagation()" title="查看"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.deleteTimeTask(row.entity.task_id);$event.stopPropagation()" title="删除"></i>
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
						$scope.getNumOfSearchs();
					}
					$scope.timeSearchTask(new_page,page_size);
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
		}
		function getName () {
			$scope.searchName = $scope.searchName ? $scope.searchName : ''
		}
		$scope.getNumOfSearchs = function(){
			getName()
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url: '/controller/timeSearch/count?name='+$scope.searchName
			}).then(function successCallback(response) {
				var data = response.data;
				$scope.gridOptions. totalItems = data.count;
			}, function errorCallback(response) {
				// 请求失败执行代码
			});
		}

		$scope.timeSearchTask=function(current_page, page_size){
			$scope.gridOptions.paginationCurrentPage = current_page
			getName()
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url: '/controller/timeSearchs?name='+$scope.searchName  + "&page="+ current_page + "&pagesize=" + page_size
			}).then(function successCallback(response) {
				var data=response.data
				if(data.status != undefined && data.status == false){
					$.LstTips(data.reason)
					return
				}
				// $scope.gridOptions.data = parser.procTasks(response.data);
				$scope.gridOptions.data = response.data
			}, function errorCallback(response) {
				// 请求失败执行代码
			});
		}

		$scope.getNumOfSearchs()
		$scope.timeSearchTask(1, $scope.gridOptions.paginationPageSize);

		//编辑操作
		$scope.editTimeTask = function(task_id, $event) {
			factory_data.setter({
				task_id: task_id
			});
			if($event && $event.srcElement.tagName == 'INPUT' ){
				return
			}
			$location.path("/timeline-new")
		}

		//查询操作
		$scope.TimeTaskInfo = function(task_id, $event) {
			factory_data.setter({
				task_id: task_id
			});
			if($event && $event.srcElement.tagName == 'INPUT' ){
				return
			}
			$location.path("/timeline-view")
		}

		$scope.removeTimeTasks = function(){
			if($scope.task_id_arr == []){
				return
			}
			$scope.task_id_arr.forEach(function(e){
				$scope.deleteTimeTask(e)
			})
		}

		$scope.deleteTimeTask = function(task_id) {
			if (task_id && task_id.length > 0) {
				$http({
					method: "delete",
					url: "/controller/timeSearch/" + task_id,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					var data = response.data;
					if(data.status){
						$scope.timeSearchTask($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
					}
				});
			}
		}

		$scope.keyDown=function($event){
			if($event.keyCode==13){
				$scope.timeSearchTask(1, $scope.gridOptions.paginationPageSize);
				$scope.getNumOfSearchs()
			}
		}

		$scope.getSearchList = () => {
			$scope.timeSearchTask(1, $scope.gridOptions.paginationPageSize);
			$scope.getNumOfSearchs()
		}

	}])