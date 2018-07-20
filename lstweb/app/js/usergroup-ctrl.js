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

.controller('rolectrl', function($scope, $http, $location, factory_mondata) {
	var parser = new RoleModel();
	var Pager = new PagerModel()

	$scope.goto = function(){
		Pager.setPagerTo($scope.pager.page, $scope.pager.page_size)
		$scope.roleList()
	}
	$scope.gotoFirst = function(){
		Pager.setPagerTo(1, $scope.pager.page_size)
		$scope.roleList()
	}
	$scope.gotoPrev = function(){
		Pager.setPagerNext(false, $scope.pager.page_size)
		$scope.roleList()
	}
	$scope.gotoNext = function(){
		Pager.setPagerNext(true, $scope.pager.page_size)
		$scope.roleList()
	}
	$scope.gotoTail = function(){
		Pager.setPagerTo(1000000, $scope.pager.page_size)
		$scope.roleList()
	}

	$scope.getNumOfCaptures = function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/roles/count'
		}).then(function successCallback(response) {
			var data = response.data
			$scope.roleList()
			Pager.setPagerInfo(1, 12, data.count)
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}

	$scope.getNumOfCaptures()


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
	$scope.roleRightsList()

	$scope.addRoleRightsToList = function(){
		var mod = $scope.selectedOption

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
		$scope.$apply()
	}

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

	$scope.roleList=function(){
		$http({
			method: 'GET',
			url: '/controller/roles'+'?' + Pager.getPagerParams(),
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}).then(function successCallback(response) {
			//alert(JSON.stringify(response.data));
			$scope.roles = response.data;
			$scope.pager = Pager.getPagerInfo()
		}, function errorCallback(response) {
		// 请求失败执行代码
		});
	}

	$scope.clickIt = function(index, rights){
		var r = $scope.model.rights[index]
		r[rights] = (r[rights]) ? false:true
	}

	$scope.addRole = function() {
		//var role_data = parser.setNewRoleData($scope.model)
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
				alert(data.reason);
				return
			}
			$scope.model=parser.newRightsResponseModel(data)
		});
	}

	$scope.updateRole = function() {
		var role_data = parser.setNewRoleData($scope.model)
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
				$scope.model=parser.newRightsResponseModel(data)
			});
	}

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

	var role_id = factory_mondata.getter().role_id;

	if (role_id && role_id.length > 0) {
		$scope.edit_status="编辑用户组信息";
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
	}else{
		$scope.edit_status="新建用户组信息";
	}

	$scope.delRole = function(role_id) {
		if (role_id && role_id.length > 0) {
			$http({
				method: "delete",
				url: "/controller/role/" + role_id,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				var data = response.data;
				if(data.status){
					$scope.roleList()
				}
			});
		}
	}

	$scope.SearchRole = function() {	
		var role_name=$("#role_name").val()	
			$http({
				method: "get",
				url: "/controller/roles/cond/" + role_name,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				$scope.roles = response.data;
			});
	}
	$scope.keyDown=function($event){
		if($event.keyCode==13){
			$scope.SearchRole();
		}
	}
	$scope.selectAll = function(){
		var group_checked = $('#roleListSelAll').prop("checked")

		$('input[name="vehicleItem"]').each(function(item){
			$(this).prop("checked", group_checked)
		})
	}

	$scope.removeRole = function(){
		var role_id_arr = []
		$('input[name="vehicleItem"]').each(function(index){
			if( $(this).prop("checked") == false)
				return
			var role_id = $scope.roles[index].role_id
			role_id_arr.push(role_id)
		})

		role_id_arr.forEach(function(e){
			//console.log("removed task ID: "+e)
			$scope.delRole(e)
		})
	}

})