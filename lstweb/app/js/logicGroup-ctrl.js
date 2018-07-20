angular.module('myApp')

.factory('factory_data', function() {
	var data = {
		group_id: ''
	}
	return {
		getter: function() {
			return data
		},
		setter: function(s) {
			data = s
		},
		search: function(c_name,cameras){
			var filterCameras = [];
			var re = new RegExp(c_name, 'i');
			cameras.forEach((key) => {
				if(re.test(key.name)){
					filterCameras.push(key);
				}
			});
			return filterCameras;
		}
	}
})

	.controller('logicGroupListCtrl', ['$scope', '$http', '$location', 'i18nService' ,function($scope, $http, $location, i18nService) {
		i18nService.setCurrentLang("zh-cn");
		$scope.edit = entity => {
			window.location.href = '#/app/logicgroup/' + entity.id + '/info'
		}
		var parser = new CameraGroupModel();
		$scope.group_id_arr = [];

		$scope.gridOptions = {
			defaultClick: entity => $scope.edit(entity),
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
				{field: 'name', displayName: '业务逻辑组名称',cellTooltip:true},
				{field: 'desc', displayName: '说明',cellTooltip:true},
				{field: 'length', displayName: '子设备数量',cellTooltip:true},
				{
					field: "操作",
					cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.edit(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.delCameraGroupRel(row.entity.id);$event.stopPropagation()" title="删除"></i>
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
						$scope.getNumOfCamgroupRels();
					}
					$scope.cameraGroupRelList(new_page,page_size);
				});
				//行选中事件
				gridApi.selection.on.rowSelectionChanged($scope,function(row){
					$scope.group_id_arr = [];
					var rows = $scope.gridApi.selection.getSelectedGridRows();
					rows.forEach((item)=>{
						$scope.group_id_arr.push(item.entity.id)
					});
				});
				//全选事件
				gridApi.selection.on.rowSelectionChangedBatch($scope,function(row){
					var selectionAll  =  $scope.gridApi.selection.getSelectAllState();
					//调用这个方法可以判断是否全选，返回正则类型
					if(!selectionAll){
						$scope.group_id_arr = [];
						var rows = $scope.gridApi.selection.getSelectedGridRows();
						rows.forEach((item)=>{
							$scope.group_id_arr.push(item.entity.id)
						})
					}else{
						$scope.group_id_arr = [];
					}
				});
			}
		}

		function getName() {
			$scope.searchName = $scope.searchName ? $scope.searchName : ''
		}

		$scope.getNumOfCamgroupRels = function(){
			getName()
			let url ='/controller/camappgroups/count'
			if($scope.searchName){
				url = '/controller/camappgroups/count?name=' + $scope.searchName
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
		}
		$scope.cameraGroupRelList=function(current_page, page_size){
			getName()
			let url ="/controller/camappgroups?page="+ current_page + "&pagesize=" + page_size
			if($scope.searchName){
				url = '/controller/camappgroups?name=' + $scope.searchName + "&page="+ current_page + "&pagesize=" + page_size
			}
			$scope.gridOptions.paginationCurrentPage = current_page
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url
			}).then(function successCallback(response) {
				$scope.gridOptions.data = response.data;
			}, function errorCallback(response) {
				// 请求失败执行代码
			});
		}

		$scope.getSearchList = () => {
			$scope.getNumOfCamgroupRels();
			$scope.cameraGroupRelList(1, $scope.gridOptions.paginationPageSize);
		}

		$scope.getSearchList()

		$scope.editCameraGroupRel=function(group_id, $event){
			factory_data.setter({
				group_id: group_id
			});
			if($event && $event.srcElement.tagName == 'INPUT' ){
				return
			}
			$location.path("/logicgroup-new")
		}

		$scope.removeCameraGroupRels = function(){
			if($scope.group_id_arr == []){
				return
			}
			$scope.group_id_arr.forEach(function(e){
				//console.log("removed task ID: "+e)
				$scope.delCameraGroupRel(e)
			})
		}
		$scope.delCameraGroupRel = function(group_id) {
			if (group_id && group_id.length > 0) {
				$http({
					method: "delete",
					url: "/controller/camappgroup/" + group_id,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					var data = response.data;
					if(data.status){
						$scope.cameraGroupRelList($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize)
					}
				});
			}
		};

		$scope.keyDown=function($event){
			if($event.keyCode==13){
				$scope.getSearchList()
			}
		}
	}])

.controller('editLogicGroupCtrl', function($scope, $http, factory_data, DB, $location,$stateParams,$state, $q) {
	var group_id = $stateParams.logicgroupid;
	var type=$stateParams.type;
	var parser = new CameraGroupModel();

	$scope.model = { cameras:[] };
	$scope.logicConfigGroup = { cameras:[] };
	var cameraConfig = [];
	$scope.cameraSearch = "";
	$scope.configSearch = "";

	//新建业务逻辑组
	$scope.addLogicGroup = function(){
		var choosedCamera = null;
		$('input[name="cameraItem"]').each(function(index){
			if($(this).prop("checked") == false){
				return
			}
			choosedCamera={id: $(this).val(), name: $(this).prop("dataset").cname};
			$scope.model = parser.addCameraToGroup($scope.model,choosedCamera);
		});
		if(choosedCamera == undefined){
			return;
		}
		//提交新建请求
		var group_data = parser.setNewGroupData($scope.model);
		if(group_data.name==undefined || group_data.name==""){
			return $.LstTips("组名称不能为空");
		}
		$http({
			method: "post",
			url: "/controller/camappgroup" ,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: group_data
		}).then(function(response) {
			var data = response.data;
			if(data.status){
				$scope.model=parser.procAddCameraGroupResp($scope.model, data);
				$state.go('app.logicgroup');
			} else {
				$.LstTips("组名称不能相同")
			}
		})
	};

	//该配置组摄像机
	$scope.getCameraLogicGroup = function(group_id) {
		$http({
			method: "get",
			url: "/controller/camappgroup/" + group_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.logicConfigGroup = parser.procCameraGroupData(data);
			cameraConfig = $scope.logicConfigGroup.cameras;
		});
	};
	if (group_id && group_id.length > 10 && type=="info") {
		$scope.getCameraLogicGroup(group_id)
	}

	//全选
	$scope.isCheckedAll = false;
	$scope.CheckedAll = function () {
		$scope.isCheckedAll = !$scope.isCheckedAll;
	};

	//添加摄像机到配置组
	$scope.showGroupDialog = function(){
		if($scope.configSearch && $scope.configSearch!=""){
			$scope.configSearch = "";
			$scope.logicConfigGroup.cameras = cameraConfig;
		}
		var scope = angular.element(document.getElementById("idCameraList")).scope();
		scope.uniqCameraList($scope.logicConfigGroup.cameras);
		$scope.addCameraList = scope.cameras;
		$.LstDialog('.addCamera',618,230);
	};
	$scope.addCamera = function(){
		var choosedCamera = null;
		$('input[name="cameraItem"]').each(function(index){
			if( $(this).prop("checked") == false){
				return;
			}
			choosedCamera={id: $(this).val(), name: $(this).prop("dataset").cname};
			$scope.logicConfigGroup = parser.addCameraToGroup($scope.logicConfigGroup, choosedCamera);
		});
		cameraConfig = $scope.logicConfigGroup.cameras;
		if(choosedCamera == undefined){
			$.hiddenDialog('.addCamera');
			return;
		}
		//update
		var scope = angular.element(document.getElementById("idCameraList")).scope();
		scope.uniqCameraList($scope.logicConfigGroup.cameras);
		$.hiddenDialog('.addCamera');
	};

	//搜索所有摄像机
	$scope.searchAllCameraByName = function() {
		var c_name = $scope.cameraSearch;
		var scope = angular.element(document.getElementById("idCameraList")).scope();
		if(c_name == undefined || c_name == "") {
			scope.uniqCameraList(null);
			return;
		}
		scope.uniqCameraList(null);
		var re = new RegExp(c_name, 'i');
		scope.cameras = scope.cameras.filter((camera) => {
			return re.test(camera.cameraName) ? true : false
		});
	};

	//搜索摄像机
	$scope.searchCameraByName = function() {
		var c_name = $scope.cameraSearch;
		var scope = angular.element(document.getElementById("idCameraList")).scope();
		if(c_name == undefined || c_name == "") {
			scope.cameras = $scope.addCameraList;
			return;
		}
		var re = new RegExp(c_name, 'i');
		scope.cameras = $scope.addCameraList.filter((camera) => {
			return re.test(camera.cameraName) ? true : false
		});
	};
	//搜索配置组摄像机
	$scope.searchConfigByName = function() {
		var c_name = $scope.configSearch;
		$scope.logicConfigGroup.cameras = cameraConfig;
		if(c_name == undefined || c_name == "") {
			$scope.logicConfigGroup.cameras = cameraConfig;
			return;
		}
		$scope.logicConfigGroup.cameras = factory_data.search(c_name,cameraConfig);
	};
	//搜索配置组
	$scope.searchGroupByName = function() {
		var scope = angular.element(document.getElementById("logicGroup")).scope();
		var c_name = scope.groupSearch;
		if(c_name == undefined || c_name == "") {
			scope.camappGroups = scope.groupList;
			return;
		}
		scope.camappGroups = factory_data.search(c_name, scope.groupList);
	};

	$scope.group_id = "";
	$scope.group_name = "";
	$scope.isShowSelect = false;
	$scope.showSelect = function(){
		$scope.isShowSelect = !$scope.isShowSelect;
	};
	//选择其他配置组
	$scope.selectGroupId = function(){
		$scope.group_name = this.group.name;
		$scope.group_id = this.group.id;
		$scope.isShowSelect = false;
	};
	$scope.notSelectGroup = function(){
		$scope.group_id = "";
		$scope.group_name = "";
		$scope.isShowSelect = false;
	};
	//移动摄像机到其他配置组
	$scope.moveTo = function(move_group_id, move_cid_arr){
		var defer = $q.defer();
		var group_id = move_group_id;
		var move_cid = move_cid_arr;

		if(group_id=="" || move_cid.length==0){
			return $.LstTips("请选择摄像机和配置组");
		}
		$http({
			method: "PUT",
			url: "/controller/camappgroup/"+$scope.logicConfigGroup.id+"/to/"+ group_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: move_cid
		}).then(function(response) {
			var data = response.data;
			if(data.status){
				$scope.logicConfigGroup=parser.procMoveModel($scope.logicConfigGroup, move_cid);
				defer.resolve();
				//$location.path("/app/logicgroup")
			} else {
				defer.reject();
				return//alert("组名称不能相同")
			}
		})
		return defer.promise;
	};
	$scope.delCameraName=function(group_id,camera_id){
		if (group_id && group_id.length > 0) {
			$http({
				method: "delete",
				url: "/controller/camappgroup/" + group_id+"/"+camera_id,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				var data = response.data;
				if(data.status){
					var delete_camera=parser.deleteNewCamera($scope.model)
				}
			});
		}
	}
	//从配置组成员中删除摄像机
	$scope.removeCameraRels = function(){
/*
		var defaultGroupId = 'b03d96a8-e2bd-11e0-8dae-000f1f79ca39';
		if(group_id == defaultGroupId){
			return $.LstTips("默认配置组相机不可删除")
		}
*/
		var deleted_camera_id = [];
		$('input[name="cameraGroupItem"]').each(function(index){
			if( $(this).prop("checked") == true ){
				var camera_id = $(this).val();
				deleted_camera_id.push(camera_id);
			}
		});
		//$scope.moveTo(defaultGroupId);
		$scope.logicConfigGroup = parser.removeCameraFromGroup(deleted_camera_id)
		cameraConfig = $scope.logicConfigGroup.cameras;
	};

	//保存配置组修改
	$scope.saveLogicGroup = function(){
		var dst_group_id = $scope.group_id;
		if($scope.configSearch && $scope.configSearch!=""){
			$scope.configSearch = "";
			$scope.logicConfigGroup.cameras = cameraConfig;
		}
		var move_cid = [];
		$("input[name='cameraGroupItem']").each(function(){
			if($(this).prop("checked") == false){
				return
			}
			move_cid.push($(this).val());
		});
		if(move_cid.length>0 && dst_group_id!==""){
			$scope.moveTo(dst_group_id, move_cid).then(function(){
				saveLogic();
			})
		}else{
			saveLogic();
		}

		function saveLogic(){
			var group_data = parser.setNewGroupData($scope.logicConfigGroup);
			if(group_data.name==undefined || group_data.name==""){
				return $.LstTips("组名称不能为空");
			}
			var url = "/controller/camappgroup/"+group_data.id;
			$http({
				method: "PUT",
				url: url,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				},
				data: group_data
			}).then(function(response) {
				var data = response.data;
				if(data.status){
					$scope.logicConfigGroup=parser.procAddCameraGroupResp($scope.logicConfigGroup, data);
					$state.go('app.logicgroup')
				} else {
					$.LstTips("组名称不能相同")
				}
			})
		}
	};
})