var alarmModule = angular.module('alarmModule', ['ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.pagination','ui.grid.moveColumns','ui.grid.autoResize','ui.grid.resizeColumns']);
alarmModule.controller('alarmListCtrl', ['$scope', '$http', '$location','$state', 'i18nService',function ($scope, $http,$location,$state,i18nService) {
	i18nService.setCurrentLang("zh-cn");
	var parser = new AlarmModel();

	function rowTemplate(){
		return "<div ng-click=\"grid.appScope.showDetail(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
	}

	$scope.showDetail = (row)=>{
		var e = window.event
		if(e.srcElement.tagName == "A"){
			return
		}
		$state.go('setting.logmanage.logdetail', {logid:row.entity.log_id, type: 'info'});
	}
	$scope.gotoMonitorView = function(entity){
		sessionStorage.setItem("monitor_task_name", entity.data.t_name);
		window.location.href = entity.url_content;
	}

	$scope.gridOptions1 = {
	  paginationPageSizes: [10,20, 30, 50, 75],
	  paginationPageSize: 20,
	  paginationCurrentPage:1,
	  enableGridMenu: true,
  	  enablePagination: true, 
  	  enableSorting:true,
	  useExternalPagination: true,
	  columnDefs: [
	  	{field: 'id', displayName: '报警Id', visible:false, enableSorting:false,cellTooltip:true},
		{field: 'cata', displayName: '报警类别',width: '18%', enableSorting:false,cellTooltip:true},
		{field: 'time', displayName: '报警时间',width: '15%',cellTooltip:true},
		{field: 'level', displayName: '报警级别',width: '8%',cellTooltip:true},
		{field: 'sender', displayName: '发送者',width: '10%',cellTooltip:true},
		{field: 'describe', displayName: '详情', enableSorting:false,
			cellTemplate:
				'<div class="ui-grid-cell-contents">' +
					'<a class="alarm_detail" href="{{row.entity.task_url}}">“{{row.entity.data.t_name}}”</a>在' +
					'<a class="alarm_detail" href="{{row.entity.camera_url}}">“{{row.entity.data.camera}}”</a>' +
					'上发生报警,<a class="alarm_detail" style="" ng-click="grid.appScope.gotoMonitorView(row.entity)">描述:{{row.entity.data.t_desc}}</a>' +
				'</div>'
		}
	  ],
		<!--href="{{row.entity.url_content}}"-->
		onRegisterApi:function(gridApi){
	  	$scope.gridApi = gridApi;
	  	gridApi.pagination.on.paginationChanged($scope,(new_page,page_size)=>{
			if(new_page==1 || new_page==parseInt($scope.gridOptions1.totalItems/page_size)+1){
		        getCount();
	  		}
	  		getAlarmData(new_page,page_size);
	  	});
	  }
	};

	var getAlarmData = function(current_page,page_size){
		havecata()
		var url = '';
		if($scope.formateCata=="" || $scope.formateCata==undefined){
			url = '/controller/alarms?user_id='+JSON.parse(sessionStorage.user).user_id+'&page='+ current_page + '&pagesize=' +page_size;
		}else{
			url = '/controller/alarms?user_id='+JSON.parse(sessionStorage.user).user_id+'&cata='+$scope.formateCata+'&page='+ current_page + '&pagesize=' +page_size;
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: url
		}).then(function successCallback(response) {
			if(response.status==200){
			    $scope.gridOptions1.data = parser.newAlarmResponseModel(response.data);
			}
		}, function errorCallback(response) {
			// 请求失败执行代码
		});

	};
	function havecata() { // 前端写死的类别，如果有增加。需要重新定义
		$scope.cata = !$scope.cata ? '' : $scope.cata;
		$scope.formateCata = "";
		if(!$scope.cata){
			return
		}
		let reg = new RegExp($scope.cata);
		if(reg.test('任务管理')){
			$scope.formateCata = 'task'
		}else if(reg.test('摄像机管理')){
			$scope.formateCata = 'camera'
		}else if(reg.test('用户管理')){
			$scope.formateCata = 'user'
		}else{
			$.LstTips('系统内不存在该报警类别')
		}
	}
	var getCount =function(){
		havecata();
		var url = '';
		console.log($scope.formateCata)
		if($scope.formateCata=="" || $scope.formateCata==undefined){
			url = '/controller/alarms/count?user_id='+JSON.parse(sessionStorage.user).user_id;
		}else{
			url = '/controller/alarms/count?user_id='+JSON.parse(sessionStorage.user).user_id+'&cata='+ $scope.formateCata;
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: url
		}).then(function successCallback(response) {
			if(response.status==200){
				$scope.gridOptions1.totalItems = response.data.count;
			}
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};
	getCount();
	getAlarmData(1,$scope.gridOptions1.paginationPageSize)
	$scope.getSearch = () => {
		getCount();
		getAlarmData(1,$scope.gridOptions1.paginationPageSize)
	}
 	$scope.keyDown = e => {
		if(e.keyCode == 13){
			$scope.getSearch()
		}
	}
}]);


