angular.module('myApp')

.factory('factory_mondata', function() {
	var data = {
		role_id: '',
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

.controller('rolectrl', ['$scope', '$http', '$location', 'factory_mondata','$state','$stateParams','i18nService',function($scope, $http, $location, factory_mondata,$state,$stateParams,i18nService) {
	i18nService.setCurrentLang("zh-cn");

	var parser = new RoleModel();
	$scope.role_id_arr = [];

	$scope.gridOptions = {
		defaultClick: entity => $scope.editorRole(entity),
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
			{field: 'role_name', displayName: '名称',cellTooltip:true},
			{field: 'role_remark', displayName: '说明',cellTooltip:true},
			{field: 'operation', displayName: '操作',
				cellTemplate:
					'<div style="text-align: center">' +
						'<a class="edit-icon" title="编辑" ng-click="grid.appScope.editorRole(row.entity);$event.stopPropagation()"></a>' +
						'<i class="delete-icon" title="删除" ng-click="grid.appScope.delRole(row.entity);$event.stopPropagation()"></i>' +
					'</div>'
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
				$scope.roleList(new_page,page_size);
			});
			//行选中事件
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.role_id_arr = [];
				var rows = $scope.gridApi.selection.getSelectedGridRows();
				rows.forEach((item)=>{
					$scope.role_id_arr.push({
						role_id: item.entity.role_id,
						role_name: item.entity.role_name
					})
				});
			});
			//全选事件
			gridApi.selection.on.rowSelectionChangedBatch($scope,function(row){
				var selectionAll  =  $scope.gridApi.selection.getSelectAllState();
				//调用这个方法可以判断是否全选，返回正则类型
				if(!selectionAll){
					$scope.role_id_arr = [];
					var rows = $scope.gridApi.selection.getSelectedGridRows();
					rows.forEach((item)=>{
						$scope.role_id_arr.push({
							role_id: item.entity.role_id,
							role_name: item.entity.role_name
						})
					})
				}else{
					$scope.role_id_arr = [];
				}
			});
		}
	};

	function getWord() {
		$scope.searchWord = $scope.searchWord ? $scope.searchWord : ''
	}
	$scope.getNumOfCaptures = function(){
		getWord();
		var url = "";
		if($scope.searchWord=="" || $scope.searchWord==undefined){
			url = '/controller/roles/count'
		}else{
			url = '/controller/roles/count?name='+$scope.searchWord
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: url
		}).then(function successCallback(response) {
			$scope.gridOptions.totalItems = response.data.count;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}
	$scope.roleList=function(current_page,page_size){
		getWord();
		var url = "";
		if($scope.searchWord=="" || $scope.searchWord==undefined){
			url = '/controller/roles?' + "page="+ current_page + "&pagesize=" + page_size
		}else{
			url = '/controller/roles?name='+$scope.searchWord + "&page="+ current_page + "&pagesize=" + page_size
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
			$.LstTips("连接失败");
		});
	}
	$scope.getNumOfCaptures();
	$scope.roleList(1,$scope.gridOptions.paginationPageSize);

	$scope.editorRole = function(entity){
		//console.log('setting/role/'+ entity.role_id +'/info')
		if(entity.role_name == '管理员组'){
			return $.LstTips("管理员组为默认权限，不能编辑");
		}else if(entity.role_name == '普通用户组'){
			return $.LstTips("普通用户组不能被编辑");
		}
		$location.path('setting/role/'+ entity.role_id +'/info')
	};
	$scope.delRole = function(entity) {
		if(entity.role_name == '管理员组'){
			return $.LstTips("管理员组为默认权限，不能删除");
		}else if(entity.role_name == '普通用户组'){
			return $.LstTips("普通用户组不能被删除");
		}
		var current_page = $scope.gridOptions.paginationCurrentPage;
		if (entity.role_id && entity.role_id.length > 0) {
			$http({
				method: "delete",
				url: "/controller/role/" + entity.role_id,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				var data = response.data;
				if(data.status){
					$scope.roleList(current_page,$scope.gridOptions.paginationPageSize)
				}else{
					$.LstTips("管理员组为默认权限，不能删除");
					//$scope.roleList(current_page,$scope.gridOptions.paginationPageSize)
				}
			});
		}
	}
	$scope.removeRole = function(){
		if($scope.role_id_arr.length == 0){
			return;
		}
		$scope.role_id_arr.forEach(function(e){
			//console.log("removed task ID: "+e)
			$scope.delRole(e)
		})
	};

	$scope.SearchRole = function() {
		$scope.getNumOfCaptures();
		$scope.roleList(1,$scope.gridOptions.paginationPageSize);
	}
	$scope.keyDown=function($event){
		if($event.keyCode==13){
			$scope.SearchRole();
		}
	}

	//编辑页面
	var role_id = factory_mondata.getter().role_id;
	role_id=$stateParams.roleid;
	var type=$stateParams.type;
	if (role_id && role_id.length > 0&&type=="info") {
		//$scope.edit_status="编辑用户组信息";
		$http({
			method: "get",
			url: "/controller/role/" + role_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.model = parser.Rolemodel(data)
		});
	}

	//=================================================
	//编辑 新建
	$scope.isCheckedItem = function(item, key){
		item[key] = !item[key];
	};

	$scope.roleRightsList=function(){
		$http({
			method: 'GET',
			url: '/controller/rights/modules',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}).then(function successCallback(response) {
			//alert(JSON.stringify(response.data));
			$scope.meta_rights_modules = response.data;
			//$scope.pager = Pager.getPagerInfo()
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}
	$scope.roleRightsList();

	$scope.addRoleRightsToList = function(){
		var mod = $scope.selectedOption;

		if($scope.model == undefined) {
			$scope.model = {}
		}
		if($scope.model.rights == undefined){
			$scope.model.rights = []
		}

		var name_is_exist = false
		$scope.model.rights.forEach((item)=>{
			if(item.name == mod.name){
				name_is_exist = true
				return false
			}
		})

		if(name_is_exist){
			return
		}
		$scope.model.rights.push({
			id: mod.id, name: mod.name, desc: mod.desc,
			short_name: mod.short_name,
			read: false, write: false, exec: false
		})
		$scope.model.rights = parser.sortRightsList($scope.model.rights)
	}

	$scope.addRole = function() {
		//var role_data = parser.setNewRoleData($scope.model)
		if($scope.model==undefined || $scope.model.name==undefined ||$scope.model.rights==undefined){
			return $.LstTips("请填写用户组名称并添加权限模块");
		}
		$http({
			method: "post",
			url: "/controller/role",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: $scope.model
		}).then(function(response) {
			var data = response.data;
			if(data.status != undefined && data.status==false){
				return $.LstTips(data.reason);
			}
			$scope.model=parser.newRightsResponseModel(data);
			$state.go('setting.role');
		});
	}
	$scope.updateRole = function() {
		var role_data = parser.setNewRoleData($scope.model);
		if($scope.model.name==undefined || $scope.model.name==""){
			return $.LstTips("请填写用户组名称");
		}
		$http({
			method: "put",
			url: "/controller/role",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: $scope.model
		}).then(function(response) {
			var data = response.data;
			if(data.status != undefined && data.status==false){
				return $.LstTips(data.reason);
			}
			$scope.model=parser.newRightsResponseModel(data);
			$state.go('setting.role');
		});
	}


	//=========================================
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

	$scope.addRightsItem = function(m){
		if($scope.model.rights == undefined){
			$scope.model.rights = []
		}
		$scope.model.rights.push({
			name: m.name, short_name: m.short_name,
			read: m.rights_val.read, write: m.rights_val.write,
			exec: m.rights_val.exec
		})
	}

	$scope.addPower = function(role_id) {
		var rights_data = parser.setNewRightsData($scope.model);
			$http({
				method: "post",
				url: "/controller/role/"+role_id+"/rights",
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				},
				data:rights_data
			}).then(function(response) {
				var data = response.data;
				$scope.model=parser.newRightsResponseModel(data)
			});
	}

	$scope.addRoleRights = function(rights_id,role_id) {
			$http({
				method: "post",
				url: "/controller/role_rights/"+role_id+"/"+rights_id,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				},
			}).then(function(response) {
				var data = response.data;
			});
	}

	$scope.editRole = function(role_id) {
			factory_mondata.setter({
			role_id: role_id
		})
		$location.path("/new-role")
	}


}])