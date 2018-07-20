var logDetailModule=angular.module('logDetailModule',['ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.pagination','ui.grid.moveColumns','ui.grid.cellNav']);
	logDetailModule.controller('logDetailCtrl',['$scope','$stateParams','$http','i18nService',function($scope,$stateParams,$http,i18nService){
		i18nService.setCurrentLang("zh-cn");
		var type=$stateParams.type;
		var parser = new LogModel();
		if(type=="info"){
			$scope.edit_status="查看日志详情";
			$scope.gridOptions = {
			  paginationPageSizes: [10, 25, 50, 75],
			  paginationPageSize: 10,
			  paginationCurrentPage:1,
			  enableGridMenu: true,
			  enablePagination: true,
			  useExternalPagination: true,
			  columnDefs: [
			  	{field: 'log_id', displayName: '日志Id', visible:false},
				{field: 'user_id', displayName: '用户Id', visible:false},
				{field: 'user_name', displayName: '用户名'},
				{field: 'time', displayName: '时间'},
				{field: 'log_content', displayName: '日志内容'},
				{field: 'action', displayName: '动作'},
				{field: 'is_success', displayName: '状态'}
			  ],
			  onRegisterApi:function(gridApi){
			  	$scope.gridApi = gridApi;
			  	gridApi.pagination.on.paginationChanged($scope,(new_page,page_size)=>{
					if(new_page==1 || new_page==parseInt($scope.gridOptions.totalItems/page_size)+1){
				        getCountOfHistory();
			  		}
			        getHistory(new_page,page_size);
			  	})
			  }
			
			};
			var getLogDetailData=function(current_page,page_size){
				$http({
					method: 'GET',
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					url: '/controller/audit/log/'+$stateParams.logid
				}).then(function successCallback(response) {
					if(response.status==200){
						$scope.logdetail = parser.LogModel(response.data);
						getCountOfHistory();
						getHistory(current_page,page_size);
					}
				}, function errorCallback(response) {
					// 请求失败执行代码
				});
			}
			var getHistory=function(current_page,page_size){
				$http({
					method: 'GET',
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					url: '/controller/audit/'+$scope.logdetail.module+'/'+$scope.logdetail.content.id+'/history'+'?page='+current_page+'&pagesize='+page_size
				}).then(function successCallback(response) {
					if(response.status==200){
						$scope.gridOptions.data = parser.newUserResponseModel(response.data);
					}
				}, function errorCallback(response) {
					// 请求失败执行代码
				});
			};
			var getCountOfHistory = function (){
				$http({
					method: 'GET',
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					url: '/controller/audit/'+$scope.logdetail.module+'/'+$scope.logdetail.content.id+'/history/count'
				}).then(function(response){
					if(response.status==200){
						$scope.gridOptions.totalItems = response.data.count;
					}
				},function(){
					// 请求失败执行代码
				});
			}
			/*请求日志详情数据*/
			getLogDetailData(1,$scope.gridOptions.paginationPageSize);
		}

	}]);

