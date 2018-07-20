angular.module('myApp')

.factory('factory_mondata', function() {
	var data = {
		user_id: ''
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

.controller('userListCtrl',['$scope','$http','$location','factory_mondata','i18nService',function($scope,$http,$location,factory_mondata,i18nService) {
	// 国际化
	i18nService.setCurrentLang("zh-cn");

	var parser = new UserModel();
	$scope.user_id_arr = [];
	var adminInfo = JSON.parse(sessionStorage.getItem("user"));

	$scope.gridOptions = {
		defaultClick: entity => $scope.editUser(entity),
		LstPagination:true,
		paginationPageSizes: [12,20,30,50,75],
		paginationPageSize: 20,
		paginationCurrentPage: 1,
		enableGridMenu: true,
		enablePagination: true,
		useExternalPagination: true,
		enableSorting: false,
		enableColumnMenus:false,
		columnDefs: [
			{field: 'user_name', displayName: '用户名',cellTooltip:true},
			{field: 'u_name', displayName: '用户名全称',cellTooltip:true},
			{field: 'role_name', displayName: '角色',cellTooltip:true},
			{
				field: "操作",
				cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.editUser(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.delUser(row.entity);$event.stopPropagation()" title="删除"></i>
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
				$scope.userList(new_page,page_size);
			});
			//行选中事件
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.user_id_arr = [];
				var rows = $scope.gridApi.selection.getSelectedGridRows();
				rows.forEach((item)=>{
					$scope.user_id_arr.push({
						user_id: item.entity.user_id,
						user_name: item.entity.user_name
					})
				});
			});
			//全选事件
			gridApi.selection.on.rowSelectionChangedBatch($scope,function(row){
				var selectionAll  =  $scope.gridApi.selection.getSelectAllState();
				//调用这个方法可以判断是否全选，返回正则类型
				if(!selectionAll){
					$scope.user_id_arr = [];
					var rows = $scope.gridApi.selection.getSelectedGridRows();
					rows.forEach((item)=>{
						$scope.user_id_arr.push({
							user_id: item.entity.user_id,
							user_name: item.entity.user_name
						})
					})
				}else{
					$scope.user_id_arr = [];
				}
			});
		}
	};

	function getWord () {
		$scope.searchWord = $scope.searchWord ? $scope.searchWord : ''
	}
	$scope.getNumOfCaptures = function(){
		getWord();
		var url = "";
		if($scope.searchWord=="" || $scope.searchWord==undefined){
			url = '/controller/users/count'
		}else{
			url = '/controller/users/count?name=' + $scope.searchWord
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: url
		}).then(function successCallback(response) {
			var data = response.data;
			$scope.gridOptions.totalItems = data.count;
		}, function errorCallback(response) {
			// 请求失败执行代码
			$.LstTips("连接失败");
		});
	};
	$scope.userList = function(current_page, page_size){
		getWord();
		var url = "";
		if($scope.searchWord=="" || $scope.searchWord==undefined){
			url = '/controller/users?' + "page="+ current_page + "&pagesize=" + page_size;
		}else{
			url = '/controller/users?name='+$scope.searchWord + "&page="+ current_page + "&pagesize=" + page_size;
		}
		$http({
			method: 'GET',
			url: url,
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}).then(function successCallback(response) {
			//alert(JSON.stringify(response.data));
			$scope.gridOptions.data = response.data;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};
	$scope.getNumOfCaptures();
	$scope.userList(1,$scope.gridOptions.paginationPageSize);

	//搜索
	$scope.SearchUser = function(){
		$scope.getNumOfCaptures();
		$scope.userList(1,$scope.gridOptions.paginationPageSize);
	};
	$scope.keyDown=function($event){
		if($event.keyCode==13){
			$scope.SearchUser();
		}
	};

	$scope.editUser = function(entity) {
		if(entity.user_name=="admin" && adminInfo.user_name!=="admin"){
			return $.LstTips("管理员不能被编辑");
		}
		//$state.go("setting.user.userdetail",{userid:entity.user_id, type:'info'});
		$location.path("setting/user/"+ entity.user_id +"/info");
	};

	$scope.delUser = function(entity) {
		if(entity.user_name == "admin"){
			return $.LstTips("管理员不能被删除");
		}
		if (entity.user_id && entity.user_id.length > 0) {
			$http({
				method: "delete",
				url: "/controller/user/" + entity.user_id,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				var data = response.data;
				if(data.status){
					$scope.userList($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
				}else{
					$.LstTips("管理员不能被删除");
					//$scope.userList($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
				}
			});
		}
	};
	$scope.removeUser = function(){
		if($scope.user_id_arr.length > 0){
			$scope.user_id_arr.forEach(function(e){
				//console.log("removed task ID: "+e);
				$scope.delUser(e)
			})
		}
	};
}])


.controller('userCtrl', function($scope,$http,$location,factory_mondata,$stateParams,$state) {
	var parser = new UserModel();
	var Pager = new PagerModel()
	$scope.model={}

	/*var user_id = factory_mondata.getter().user_id;*/
	console.log("Please remove old code")
	var user_id = $stateParams.userid;
	var type=$stateParams.type;

	if (user_id && user_id.length > 0&&type=="info") {
		$scope.disabledInput = false;
		$scope.password = {};
		$http({
			method: "get",
			url: "/controller/user/" + user_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			if(response.status){
				var data = response.data;
				if(data.user_name=="admin"){
					$scope.disabledInput = true;
					$scope.adminUserName = data.user_name;
				}
				$scope.model = parser.Usermodel(data);
				$scope.password.first_passwd = $scope.model.u_passwd;
				$scope.password.confirm_passwd = $scope.model.u_passwd;
			}
		});
	}
	//获取所有用户组
	$scope.AllroleList=function(){
		$http({
			method: 'GET',
			url: '/controller/roles?filter=list&page=1&pagesize=1000',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}).then(function successCallback(response) {
			//alert(JSON.stringify(response.data));
			$scope.allroles = response.data;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}
	$scope.AllroleList()


	$scope.addUser = function() {
		if($scope.password.first_passwd == $scope.password.confirm_passwd){
			$scope.model.u_passwd = $scope.password.confirm_passwd;
		}else{
			return $.LstTips("两次密码输入不一致");
		}
		var user_data = parser.setNewUserData($scope.model);
		if(!user_data.user_name || !user_data.u_name || !user_data.u_passwd || !user_data.role_id){
			return $.LstTips("请填写用户名、密码及用户名全称，并选择添加组");
		}
			$http({
				method: "post",
				url: "/controller/user",
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				},
				data: user_data
			}).then(function(response) {
				var data = response.data;
				if(data.status){
					$scope.model=parser.newUserResponseModel(data);
					$state.go('setting.user');
				}else{
					$.LstTips(data.reason)
				}
			});
	}

	$scope.updateUser = function(user_id) {
		if($scope.password.first_passwd==$scope.password.confirm_passwd){
			$scope.model.u_passwd = $scope.password.confirm_passwd;
		}else{
			$scope.model.u_passwd = "";
			return $.LstTips("两次密码输入不一致");
		}
		var user_data = parser.setNewUserData($scope.model);
		if($scope.adminUserName && $scope.adminUserName=="admin"){
			user_data.user_name = $scope.adminUserName;
		}
		if(!user_data.user_name || !user_data.u_name || !user_data.u_passwd || !user_data.role_id){
			return $.LstTips("请填写用户名、密码及用户名全称");
		}
		$http({
			method: "put",
			url: "/controller/user/"+user_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: user_data
		}).then(function(response) {
			var data = response.data;
			if(data.status){
				$scope.model=parser.newUserResponseModel(data);
				$state.go('setting.user');
			}
		});
	}


	$scope.updUserRole = function() {
		//var user_data = parser.setNewUserData($scope.model)
			$http({
				method: "put",
				url: "/controller/user_role",
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				},
				//data: user_data
			}).then(function(response) {
				var data = response.data;
				//$scope.model=parser.newUserResponseModel(data)
			});
	}

})

