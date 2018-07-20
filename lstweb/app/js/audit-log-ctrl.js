var logModule = angular.module('logModule', ['ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.autoResize']);
logModule.controller('logctrl', ['$scope', '$http', '$location','$state', 'i18nService',function ($scope, $http,$location,$state, i18nService) {
	i18nService.setCurrentLang("zh-cn");
	var parser = new LogModel();

	function rowTemplate(){
		return "<div ng-click=\"grid.appScope.showDetail(row, $event)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
	}
	$scope.showDetail = (row, $event)=>{
		if($event.srcElement.tagName == "A"){
			return
		}
		$state.go('setting.logmanage.logdetail', {logid:row.entity.log_id, type: 'info'});
	};
	$scope.gridOptions1 = {
	  //LstPagination:false,
	  paginationPageSizes: [10,20, 30, 50, 75],
	  paginationPageSize: 20,
	  paginationCurrentPage:1,
	  enableGridMenu: true,
	  enablePagination:true,
	  enableSorting: true,
  	  useExternalPagination: true,
	  columnDefs: [
	  	{field: 'log_id', displayName: '日志Id', visible:false, enableSorting:false,cellTooltip:true},
		{field: 'user_id', displayName: '用户Id', visible:false,enableSorting:false,cellTooltip:true},
		{field: 'user_name', displayName: '用户名', enableSorting:false,
			cellTemplate: '<div class="ui-grid-cell-contents"><a style="color:#e2f7ff" href="#/setting/user/{{row.entity.user_id}}/info" title="{{row.entity.user_name}}">{{row.entity.user_name}}</a></div>'
		},
		{field: 'time', displayName: '时间',cellTooltip:true},
		{field: 'log_content', displayName: '日志内容', enableSorting:false,
			cellTemplate: '<div class="ui-grid-cell-contents"><a style="color:#e2f7ff" href="{{row.entity.url_content}}" title="{{row.entity.log_content}}">{{row.entity.log_content}}</a></div>'
		},
		{field: 'action', displayName: '动作', enableSorting:false,cellTooltip:true},
		{field: 'is_success', displayName: '状态', enableSorting:false,cellTooltip:true}
	  ],
	  rowTemplate: rowTemplate(),
	  onRegisterApi:function(gridApi){
	  	$scope.gridApi = gridApi;
	  	gridApi.pagination.on.paginationChanged($scope,(new_page,page_size)=>{
/*
			if(new_page==1 || new_page==parseInt($scope.gridOptions1.totalItems/page_size)+1){
		        getCountOfLog();
	  		}
*/
			$scope.newPage = new_page;
			$scope.pageSize = page_size;
  			getLogData(new_page,page_size);
	  	});
	  }
	};

	//根据时间搜索
	$scope.keyDown = function($event){
		if($event.keyCode==13){
			$scope.searchLogByTime();
		}
	};
	$scope.searchLogByTime = function(){
		getLogData(1, $scope.pageSize);
	};

	var getLogData = function(current_page=1, page_size=20){
		$scope.searchTime = $scope.searchTime || '';
		var url = '';
		if($scope.searchTime=="" || $scope.searchTime==undefined){
			url = '/controller/audit/logs?' + 'page=' + current_page + '&pagesize=' + page_size
		}else{
			url = '/controller/audit/logs?time='+ $scope.searchTime + '&page=' + current_page + '&pagesize=' + page_size
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json: charset=utf-8'
			},
			url: url
		}).then(function(response){
			if(response.status==200 && response.data.length==0){
				$scope.gridOptions1.totalItems = 0;
				$scope.gridOptions1.data = response.data;
			}else if(response.status==200) {
				$scope.gridOptions1.data = parser.newUserResponseModel(response.data);
				$scope.gridOptions1.paginationCurrentPage = current_page;
				$scope.gridOptions1.paginationPageSize = page_size;
				getCountOfLog();
			}
		},function(response){
			//请求失败代码
			$.LstTips("连接失败");
		});
	};
	var getCountOfLog = function(){
		$scope.searchTime = $scope.searchTime || '';
		var url = '';
		if($scope.searchTime=="" || $scope.searchTime==undefined){
			url = '/controller/audit/logs/count'
		}else{
			url = '/controller/audit/logs/count?time=' + $scope.searchTime
		}
		$http({
			method: 'Get',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: url
		}).then(function(response){
			if(response.status==200){
				$scope.gridOptions1.totalItems = response.data.count;
			}
		},function(response){
			//请求失败代码
			$.LstTips("连接失败");
		});
	};
	getLogData();
}]);


