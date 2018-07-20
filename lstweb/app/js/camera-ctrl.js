var cameraListModule = angular.module('cameraListModule', ['ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.pagination','ui.grid.moveColumns','ui.grid.autoResize','ui.grid.resizeColumns']);
cameraListModule.controller('cameraListCtrl',['$scope','$http','$interval','$location','factory_data','RefreshManager','i18nService',function($scope, $http, $interval, $location, factory_data, RefreshManager,i18nService){
	// 国际化
	i18nService.setCurrentLang("zh-cn");
	$scope.edit = (entity) => { // 编辑
		window.location.href = '#/dev/camera/' + entity.cid + '/info';
	};
	$scope.data = factory_data.getter();
	$scope.search_mode = false;
	$scope.search_key = "";
	$scope.task_id_arr = [];

	var parser = new CameraModel();

	$scope.deleteCamera = function(cid) {
		if (cid && cid.length > 0) {
			$http({
				method: "delete",
				url: "/controller/camera/" + cid,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				var data = response.data;
				if(data.status){
					$scope.cameraList($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
				}
			});
		}
	};
	$scope.editCamera = function(cid) {
		factory_data.setter({
			cid: cid
		});
		$location.path("/cam_edit")
	};
	$scope.viewCamera = function(cid) {
		factory_data.setter({
			cid: cid
		});
		$location.path("/cam_view")
	};
	$scope.rebootCamera = function(cid) {
		$http({
			method: "get",
			url: "/controller/camera/" + cid + "/restart",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			if(data.status){
				$scope.cameraList($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
			}
		});
	};
	$scope.removeCameras = function(){
		$scope.task_id_arr.forEach(function(e){
			//console.log("removed task ID: "+e)
			$scope.deleteCamera(e)
		})
	};

	$scope.formatStatus= function(num){
		return num == 1 ? '在线' : '不在线'
	};
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
			{field: 'name', displayName: '摄像机名称', width:'13%',cellTooltip:true},
			{field: 'online', displayName: '状态', width:'5%',
				cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.formatStatus(row.entity.online)}}</div>'
			},
			{field: 'up_to_time', displayName: '运行时间', width:'15%',cellTooltip:true},
			{field: 'model', displayName: '版本', width:'5%',cellTooltip:true},
			{field: 'temperature_humidity', displayName: '温度(℃)/湿度(RH%)', width:'12%',
				cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.temperature}}/{{row.entity.humidity}}%</div>'
			},
			{field: 'mac', displayName: 'MAC地址', width:'15%',cellTooltip:true},
			{field: 'ip', displayName: 'IP地址', width:'8%',cellTooltip:true},
			{field: 'g_name', displayName: '所属组', width:'7%',cellTooltip:true},
			{
				field: "操作",
				cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.edit(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="mark-icon tasklist-action-btn" ng-click="grid.appScope.markCamera(row.entity);$event.stopPropagation()" title="标注"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.deleteCamera(row.entity.cid);$event.stopPropagation()" title="删除"></i>
                            <i class="reboot-icon tasklist-action-btn" ng-click="grid.appScope.rebootCamera(row.entity.cid);$event.stopPropagation()" title="重启"></i>
                        </div>
                    `,
				width:'18%'
			}
		],
		onRegisterApi: function(gridApi){
			$scope.gridApi = gridApi;
			//分页按钮事件
			gridApi.pagination.on.paginationChanged($scope,(new_page,page_size)=>{
				//清空全选
				gridApi.selection.clearSelectedRows();

				if(new_page==1 || new_page==parseInt($scope.gridOptions.totalItems/page_size)+1){
					$scope.getNumOfCameras();
				}
				$scope.cameraList(new_page,page_size);
			});
			//行选中事件
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.task_id_arr = [];
				var rows = $scope.gridApi.selection.getSelectedGridRows();
				rows.forEach((item)=>{
					$scope.task_id_arr.push(item.entity.cid)
				});
			});
			//全选事件
			gridApi.selection.on.rowSelectionChangedBatch($scope,function(row){
				var selectionAll  =  $scope.gridApi.selection.getSelectAllState();
				//调用这个方法可以判断是否全选，返回正则类型
				if(!selectionAll){
					let rows = $scope.gridApi.selection.getSelectedGridRows();
					$scope.task_id_arr = [];
					rows.forEach((item)=>{
						$scope.task_id_arr.push(item.entity.cid)
					})
				}else{
					$scope.task_id_arr = [];
				}
			});
		}
	};
	function getWord () {
		$scope.searchWord = $scope.searchWord ? $scope.searchWord : ''
	}
	$scope.getNumOfCameras = function(){
		getWord();
		var url = "";
		if($scope.searchWord=="" || $scope.searchWord==undefined){
			url= '/controller/cameras/count'
		}else{
			url= '/controller/cameras/count?name='+ $scope.searchWord
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
	};

	$scope.cameraList = function(current_page, page_size){
		$scope.gridOptions.paginationCurrentPage = current_page
		getWord();
		var url = "";
		if($scope.searchWord=="" || $scope.searchWord==undefined){
			url= '/controller/cameras?'+"filter=all&page="+ $scope.gridOptions.paginationCurrentPage + "&pagesize=" + $scope.gridOptions.paginationPageSize
		}else{
			url= '/controller/cameras?name='+ $scope.searchWord +"&filter=all&page="+ $scope.gridOptions.paginationCurrentPage + "&pagesize=" + $scope.gridOptions.paginationPageSize
		}
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: url
		}).then(function successCallback(response) {
			$scope.cameras = parser.procCamerasInfo(response.data);
			$scope.gridOptions.data = $scope.cameras;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};

	$scope.keyDown=function($event){
		if($event.keyCode==13){
			$scope.searDataList();
		}
	};

	$scope.searDataList = () => {
		$scope.getNumOfCameras();
		$scope.cameraList(1,$scope.gridOptions.paginationPageSize);
	}

	$scope.searDataList();

	$scope.updateCameraPos = function(camera, pos, updateSuccess) {
		var camera_pos = {
			longitude: pos.lng,
			latitude: pos.lat
		};

		$http({
			method: 'PUT',
			url: '/controller/camera/' + camera.cid,
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			data: camera_pos
		}).then(function successCallback(response) {
			//alert(JSON.stringify(response.data));
			$scope.gridOptions.data.forEach(function(cam) {
				if (camera == cam) {
					cam.pos = camera_pos;
				}
			});
			if (updateSuccess) {
				updateSuccess();
			}
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};

	$scope.getGeoLocation = function() {
		// 添加定位控件
		var geolocationControl = new BMap.GeolocationControl();
		geolocationControl.addEventListener("locationSuccess", function(e) {
			// 定位成功事件
			var address = '';
			address += e.addressComponent.province;
			address += e.addressComponent.city;
			address += e.addressComponent.district;
			address += e.addressComponent.street;
			address += e.addressComponent.streetNumber;
			alert("当前定位地址为：" + address);
		});
		geolocationControl.addEventListener("locationError", function(e) {
			// 定位失败事件
			alert(e.message);
		});
	};

	$scope.markCamera = function(camera) {
		var center = {
			lng: 114.025973657,
			lat: 22.5460535462
		};
		var camera_pos = camera.pos;
		var camera_id = camera.cid;
		var camera_has_pos = false;
		var camera_maker_title = "cid: " + camera.cid + "\n";
		camera_maker_title += "\ngroup: " + camera.group_name;
		camera_maker_title += "\nmodel: " + camera.model;
		var mapwin = $("#map_box");
		var marker = null;

		mapwin.css("display", 'block');

		if (camera_pos.longitude != undefined && camera_pos.latitude != undefined) {
			center = {
				lng: camera_pos.longitude,
				lat: camera_pos.latitude
			}
			camera_has_pos = true;
		} else {

		}
		var map = loadMap("allmap", "baidu", center, function(e) {
			var address = '';
			address += e.addressComponent.province;
			address += e.addressComponent.city;
			address += e.addressComponent.district;
			address += e.addressComponent.street;
			address += e.addressComponent.streetNumber;
			console.log("当前定位地址为：" + address);
		});

		if (camera_has_pos) {
			marker = setCameraPos(map, center, camera_maker_title);
		}

		addMapEventHander(map, "click", function(e) {
			//alert("mark camera {"+camera_id+"} to "+ e.point.lng + ", " + e.point.lat);
			var camPos = {
				camera_id: camera_id,
				lng: e.point.lng,
				lat: e.point.lat
			}

			$scope.updateCameraPos(camera, camPos, function() {
				if (marker) {
					unsetCameraPos(map, marker);
				}
				marker = setCameraPos(map, camPos, camera_maker_title);
			});

		})
	};

	$scope.closeBox = function(id){
		$('#'+id).css("display", "none")
	};

	$scope.conf = {
		max_list_item: 21,
		refresh: false,
		refresh_interval: 5000,
		refresh_timer: null
	};
	$scope.toggleRefreshCameraResult = function() {
		var conf = $scope.conf;
		if (conf.refresh == false) {
			$scope.conf.refresh = true;
			RefreshManager.interval($interval, function() {
				getWord();
				var url = "";
				if($scope.searchWord=="" || $scope.searchWord==undefined){
					url= '/controller/cameras?'+"filter=all&page="+ $scope.gridOptions.paginationCurrentPage + "&pagesize=" + $scope.gridOptions.paginationPageSize
				}else{
					url= '/controller/cameras?name='+ $scope.searchWord +"&filter=all&page="+ $scope.gridOptions.paginationCurrentPage + "&pagesize=" + $scope.gridOptions.paginationPageSize
				}
				$.ajax({
					url: url,
					type: "get",
					success: function(msg) {
						$scope.cameras = parser.procCamerasInfo(msg);
						$scope.gridOptions.data = $scope.cameras;
					}
				});
			}, conf.refresh_interval);
		} else {
			RefreshManager.cancel();
			$scope.conf.refresh = false;
		}
	};

	$scope.$on('$destroy', function(){
		RefreshManager.cancel();
		$scope.conf.refresh = false
	});

	$scope.toggleRefreshCameraResult();

}]);

angular.module('myApp')
	.factory('factory_data', function() {
		var data = {
			cid: ''
		};
		return {
			getter: function() {
				return data
			},
			setter: function(s) {
				data = s
			}
		}
	})

	.controller('editCameraCtrl', function($scope, $http, factory_data, $location,$stateParams,$state){

		var cid=$stateParams.cameraid;
		var type=$stateParams.type;
		var parser = new CameraModel();

		$scope.model = {};

		if (cid && cid.length > 10 &&type=="info") {
			$scope.edit_status="编辑摄像机详情";
			$http({
				method: "get",
				url: "/controller/camera/" + cid,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				var data = response.data;
				$scope.model = parser.Cameramodel(data)
				if($scope.model.nvr == undefined){
					$scope.model.nvr = {}
				}
			});
		}else{
			$scope.edit_status="新建摄像机详情";
		}

		$scope.saveCamera = function() {
			if($scope.model.nvr && $scope.model.nvr.chid){
				$scope.model.nvr.chid = parseInt($scope.model.nvr.chid)
			}
			var camera_data = parser.setNewCameraData($scope.model)
			$http({
				method: "PUT",
				url: "/controller/camera/cameraInfo/" + cid,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				},
				data: camera_data
			}).then(function successCallback(response) {
				var data = response.data;
				if(data.status){
					$scope.model=parser.Cameramodel(data);
					$state.go('dev.camera');
				}
			}, function errorCallback(response) {

			});
		}
	})
	.controller('viewCameraCtrl', function($scope, $http, factory_data, $location,$state,$stateParams){
		var cid=$stateParams.cameraid;
		var type=$stateParams.type;
		var parser = new CameraModel();
		$scope.model = {};
		if (cid && cid.length > 10 &&type=="info") {
			$scope.edit_status="编辑摄像机";
			$http({
				method: "get",
				url: "/controller/camera/" + cid,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				}
			}).then(function(response) {
				var data = response.data;
				$scope.model = parser.Cameramodel(data)
			});
		}else{
			$scope.edit_status="新建摄像机";
		}

		$scope.saveCamera = function() {
			var stream = $("#latitude").val();
			$http({
				method: "POST",
				url: "/controller/camera" ,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Accept': 'application/json; charset=utf-8'
				},
				data: stream
			}).then(function successCallback(response) {
				var data = response.data;
				if(data.status){
					$scope.model=parser.Cameramodel(data);
					$state.go('dev.camera');
				}
			}, function errorCallback(response) {

			});
		}
	})

