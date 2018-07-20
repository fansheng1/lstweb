var configGroupModule = angular.module('configGroupModule', ['ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.pagination','ui.grid.moveColumns','ui.grid.autoResize','ui.grid.resizeColumns']);
configGroupModule.controller('configGroupListCtrl',['$scope','$http','factory_data','i18nService',function($scope, $http,factory_data,i18nService){
	// 国际化
	i18nService.setCurrentLang("zh-cn");
	$scope.edit = (entity) => { // 编辑
		window.location.href = '#/dev/cameragroups/' + entity.id + '/info';
	};
	var parser = new CameraGroupModel1();
	$scope.group_id_arr= [];

	$scope.gridOptions = {
		defaultClick: entity => $scope.edit(entity),
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
			{field: 'name', displayName: '组名称',cellTooltip:true},
			{field: 'desc', displayName: '说明',cellTooltip:true},
			{field: 'length', displayName: '子设备数量',cellTooltip:true},
			{
				field: "操作",
				cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.edit(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.delCameraConfigGroup(row.entity.id);$event.stopPropagation()" title="删除"></i>
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
					$scope.getNumOfCamgroups();
				}
				$scope.cameraConfigGroupList(new_page,page_size);
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
	};

	function getSearchData () {
		$scope.searchName = $scope.searchName ? $scope.searchName : ''
	}

	$scope.getNumOfCamgroups = function () {
		getSearchData();
		var url = "";
		if(!$scope.searchName || $scope.searchName==""){
			url = '/controller/cameragroups/count'
		}else{
			url = '/controller/cameragroups/count?name='+ $scope.searchName
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
		});
	};

	$scope.cameraConfigGroupList = function (current_page, page_size) {
		$scope.gridOptions.paginationCurrentPage = current_page
		getSearchData();
		var url = "";
		if(!$scope.searchName || $scope.searchName==""){
			url = '/controller/cameragroups?' + "page="+ current_page + "&pagesize=" + page_size
		}else{
			url = '/controller/cameragroups?name=' + $scope.searchName + "&page="+ current_page + "&pagesize=" + page_size
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: url
		}).then(function successCallback(response) {
			$scope.gridOptions.data = response.data;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};

	$scope.searchDataList = () => {
		$scope.getNumOfCamgroups();
		$scope.cameraConfigGroupList(1,$scope.gridOptions.paginationPageSize);
	}

	$scope.searchDataList();

	$scope.editCameraConfigGroup = function (group_id) {
		factory_data.setter({
			group_id: group_id
		});
		$location.path("/camgroup_new")
	}
	$scope.delCameraConfigGroup = function (group_id) {
		if (group_id && group_id.length > 0 && group_id != "b03d96a8-e2bd-11e0-8dae-000f1f79ca39") {
			$http({
				method: "delete",
				url: "/controller/cameragroup/" + group_id,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function (response) {
				var data = response.data;
				if (data.status) {
					$scope.cameraConfigGroupList($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
				} else {
					$.LstTips("默认组不可删除");
				}
			});
		} else {
			$.LstTips("默认组不可删除");
		}
	}

	$scope.removeCameraConfigGroups = function () {
		$scope.group_id_arr.forEach(function (e) {
			//console.log("removed task ID: "+e)
			$scope.delCameraConfigGroup(e)
		})
	};

	$scope.keyDown = function ($event) {
		if ($event.keyCode == 13) {
			$scope.searchDataList();
		}
	}
}]);


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

.controller('newConfigGroupCtrl', function($scope, $http, factory_data, DB, $location,$stateParams,$state,$q) {
	var group_id = factory_data.getter().group_id;
	group_id=$stateParams.groupid;
	var type=$stateParams.type;
	var parser = new CameraGroupModel1();

	$scope.model = { cameras:[] };
	$scope.cameraConfigGroup = { cameras:[] };
	var cameraConfig = [];
	$scope.cameraSearch = "";
	$scope.configSearch = "";

	//新建摄像机组
	$scope.addConfigGroup = function(){
		var choosedCamera = null;
		$('input[name="cameraItem"]').each(function(index){
			if($(this).prop("checked") == false){
				return
			}
			choosedCamera={id: $(this).val(), name: $(this).prop("dataset").cname};
			$scope.model = parser.addCameraGroupData($scope.model,choosedCamera);
		});
		//提交新建请求
		var group_data = parser.setNewGroupData($scope.model);
		if(group_data.name==undefined || group_data.name==""){
			return $.LstTips("组名称不能为空");
		}
		$http({
			method: "post",
			url: "/controller/cameragroup" ,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: group_data
		}).then(function(response) {
			var data = response.data;
			if(data.status){
				$scope.model=parser.procAddCameraGroupResp($scope.model, data);
				$state.go('dev.cameragroups');
			} else {
				$.LstTips("组名称不能相同")
			}
		})
	};

	//该配置组摄像机
	$scope.getCameraConfigGroup = function(group_id) {
		$http({
			method: "get",
			url: "/controller/cameragroup/" + group_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.cameraConfigGroup = parser.procCameraGroupData(data);
			cameraConfig = $scope.cameraConfigGroup.cameras;
		});
	};

	if (group_id && group_id.length > 10&&type=="info") {
		$scope.getCameraConfigGroup(group_id)
	}

	//全选
	$scope.isCheckedAll = false;
	$scope.CheckedAll = function () {
		$scope.isCheckedAll = !$scope.isCheckedAll;
	};

	//搜索摄像机
	$scope.searchAllCameraByName = function() {
		var c_name = $scope.cameraSearch;
		var scope = angular.element(document.getElementById("idCameraGroupList")).scope();
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
		var scope = angular.element(document.getElementById("idCameraGroupList")).scope();
		if(c_name == undefined || c_name == "") {
			scope.cameras = $scope.addCameraList;
			return;
		}
		var re = new RegExp(c_name, 'i');
		scope.cameras =  $scope.addCameraList.filter((camera) => {
			return re.test(camera.cameraName) ? true : false
		});
	};
	//搜索配置组摄像机
	$scope.searchConfigByName = function() {
		var c_name = $scope.configSearch;
		$scope.cameraConfigGroup.cameras = cameraConfig;
		if(c_name == undefined || c_name == "") {
			$scope.cameraConfigGroup.cameras = cameraConfig;
			return;
		}
		$scope.cameraConfigGroup.cameras = factory_data.search(c_name,cameraConfig);
	};
	//搜索配置组
	$scope.searchGroupByName = function() {
		var scope = angular.element(document.getElementById("cameraGroup")).scope();
		var c_name = scope.groupSearch;
		if(c_name == undefined || c_name == "") {
			scope.cameragroups = scope.groupList;
			return;
		}
		scope.cameragroups = factory_data.search(c_name, scope.groupList);
	};

	//添加摄像机到配置组
	$scope.showGroupDialog = function(){
		if($scope.configSearch && $scope.configSearch!=""){
			$scope.configSearch = "";
			$scope.cameraConfigGroup.cameras = cameraConfig;
		}
		var scope = angular.element(document.getElementById("idCameraGroupList")).scope();
		scope.uniqCameraList($scope.cameraConfigGroup.cameras);
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
			$scope.cameraConfigGroup = parser.addCameraGroupData($scope.cameraConfigGroup,choosedCamera);
		});
		cameraConfig = $scope.cameraConfigGroup.cameras;
		if(choosedCamera == undefined){
			$.hiddenDialog('.addCamera');
			return;
		}
		//update
		var scope = angular.element(document.getElementById("idCameraGroupList")).scope();
		scope.uniqCameraList($scope.cameraConfigGroup.cameras);
		$.hiddenDialog('.addCamera');
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
		var defer = $q.defer();      //延迟加载对象
		var group_id = move_group_id;
		var move_cid = move_cid_arr;

		if(move_group_id=="" || move_cid.length==0){
			return $.LstTips("请选择摄像机和配置组");
		}
		$http({
			method: "PUT",
			url: "/controller/cameragroup/"+$scope.cameraConfigGroup.id+"/to/"+ group_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: move_cid
		}).then(function(response) {
			var data = response.data;
			if(data.status){
				$scope.cameraConfigGroup=parser.procMoveModel($scope.cameraConfigGroup, move_cid);
				defer.resolve();          //传入解决派生的 promise
				//$location.path("/dev/cameragroups")
			} else {
				defer.reject();           //传入拒绝派生的 promise
				return//alert("组名称不能相同")
			}
		});
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
	};
	//从配置组成员中删除摄像机
	$scope.removeCameraRels = function(){
		//默认配置组id
		var defaultGroupId = 'b03d96a8-e2bd-11e0-8dae-000f1f79ca39';
		if(group_id == defaultGroupId){
			return $.LstTips("默认配置组相机不可删除")
		}
		var deleted_camera_id = [];
		$('input[name="cameraGroupItem"]').each(function(index){
			if( $(this).prop("checked") == true ){
				var camera_id = $(this).val();
				deleted_camera_id.push(camera_id);
			}
		});
		//$scope.cameraConfigGroup = parser.removeCameraFromGroup(deleted_camera_id);
		if(deleted_camera_id.length > 0){
			$scope.moveTo(defaultGroupId, deleted_camera_id).then(function(){
				$state.go('dev.cameragroups');
			});
		}
	};

	//保存配置组修改
	$scope.saveConfigGroup = function() {
		var dst_group_id = $scope.group_id;
		if($scope.configSearch && $scope.configSearch!==""){
			$scope.configSearch = "";
			$scope.cameraConfigGroup.cameras = cameraConfig;
		}
		var move_cid = [];
		$("input[name='cameraGroupItem']").each(function(){
			if( $(this).prop("checked") == false){
				return
			}
			move_cid.push($(this).val());
		});
		if(move_cid.length>0 && dst_group_id!==""){
			$scope.moveTo(dst_group_id, move_cid).then(function(){
				saveConfig();
			})
		}else{
			saveConfig();
		}
		function saveConfig(){
			var group_data = parser.setNewGroupData($scope.cameraConfigGroup);
			if(group_data.name==undefined || group_data.name==""){
				return $.LstTips("组名称不能为空");
			}
			var url = "/controller/cameragroup/" + group_data.id;
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
					$scope.cameraConfigGroup=parser.procAddCameraGroupResp($scope.cameraConfigGroup, data);
					$state.go('dev.cameragroups');
				} else {
					$.LstTips("组名称不能相同")
				}
			})
		}
	};

})