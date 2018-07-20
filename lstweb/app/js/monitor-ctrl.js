angular.module('myApp')

// inter-controller communication
.factory('factory_mondata', function() {
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

	.controller('monitorTaskListCtrl', ['$scope', '$http', '$state', 'factory_mondata', 'i18nService',function($scope, $http, $state , factory_mondata, i18nService) {
		i18nService.setCurrentLang("zh-cn");
		var parser = new MonitorTaskModel();
		$scope.task_id_arr = [];
		$scope.formatStatus = e => e == true ? '运行中' : '未运行'
		$scope.formatStatusClass = e => e == true ? 'coinGreenInline':'coinRedInline'
		$scope.gridOptions = {
			defaultClick:(entity) => $scope.viewMoniterTask(entity),
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
				{field: 'task_name', displayName: '任务名称',cellTooltip:true},
				{field: 'running', displayName: '状态',cellTemplate:`
					<div class="ui-grid-cell-contents">
						<span class={{grid.appScope.formatStatusClass(row.entity.running)}}></span>{{grid.appScope.formatStatus(row.entity.running)}}
					</div>
				`},
				{field: 'create_time', displayName: '创建时间',cellTooltip:true},
				{field: 'task_desc', displayName: '说明',cellTooltip:true},
				{field: 'operation', displayName: '操作',
					cellTemplate: '<div class="ui-grid-cell-contents">' +
					'<a class="tasklist-action-btn" ng-click="grid.appScope.editMoniterTask(row.entity);$event.stopPropagation()"><i class="edit-icon" title="编辑"></i></a>' +
					'<a class="tasklist-action-btn" ng-click="grid.appScope.viewMoniterTask(row.entity);$event.stopPropagation()"><i class="detail-icon" title="查看"></i></a>' +
					'<button class="tasklist-action-btn" ng-click="grid.appScope.delMoniterTask(row.entity.task_id);$event.stopPropagation()"><i class="delete-icon" title="删除"></i></button>' +
					'</div>'
				}
			],
			onRegisterApi: function(gridApi){
				$scope.gridApi = gridApi;
				//分页按钮事件
				gridApi.pagination.on.paginationChanged($scope,(new_page,page_size)=>{
					//清空全选
					gridApi.selection.clearSelectedRows();
					/*if(new_page==1 || new_page==parseInt($scope.gridOptions.totalItems/page_size)+1){
						$scope.getNumOfMonitors();
					}*/
					$scope.newPage = new_page;
					$scope.pageSize = page_size;
					$scope.monitorList(new_page,page_size);
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
		};

		$scope.getNumOfMonitors = function(){
			$scope.searchName = $scope.searchName || '';
			let url = '/controller/monitors/count'
			if($scope.searchName){
				url = '/controller/monitors/count?name=' + $scope.searchName
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
				$.LstTips("连接失败");
			});
		};
		$scope.monitorList=function(current_page=1, page_size=20){
			$scope.searchName = $scope.searchName || '';
			let url = '/controller/monitors?page='+ current_page + "&pagesize=" + page_size
			if($scope.searchName){
				url =  '/controller/monitors?name='+ $scope.searchName + "&page="+ current_page + "&pagesize=" + page_size
			}
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url
			}).then(function successCallback(response) {
				var data = response.data
				if(data.status != undefined && data.status == false){
					$.LstTips(data.reason)
					return
				}
				/*if(response.status==200 && response.data.length==0){
					if($scope.searchName){
						$scope.searchName = null;
						monitorList(1, $scope.pageSize);
						getNumOfMonitors();
						return
					}
					$scope.gridOptions.data = response.data;
					$scope.gridOptions.totalItems = 0;
				}else if(response.status==200) {*/
					$scope.gridOptions.data = parser.procTasks(response.data);
					$scope.gridOptions.paginationCurrentPage = current_page;
					$scope.gridOptions.paginationPageSize = page_size;

			}, function errorCallback(response) {
				// 请求失败执行代码
				$.LstTips("连接失败");
			});
		};

		$scope.getNumOfMonitors();
		$scope.monitorList(1, $scope.gridOptions.paginationPageSize);
		//根据任务名称搜索
		$scope.SearchMonitorTask = function(){
			$scope.monitorList(1,$scope.gridOptions.paginationPageSize);
			$scope.getNumOfMonitors();
		};
		$scope.keyDown=function($event){
			if($event.keyCode==13){
				$scope.SearchMonitorTask();
			}
		};

		//编辑
		$scope.editMoniterTask = function(entity) {
			$state.go('app.monitor.monitordetail', {monitorid: entity.task_id, type:"info"});
		};
		//查看
		 $scope.viewMoniterTask = function(entity) {
			 sessionStorage.setItem('monitor_task_name', entity.task_name);
			 $state.go('app.monitor.monitorview', {monitorid:entity.task_id});
		 };
		$scope.removeTasks = function(){
			if($scope.task_id_arr == []){
				return
			}
			$scope.task_id_arr.forEach(function(e){
				//console.log("removed task ID: "+e)
				$scope.delMoniterTask(e)
			})
		}
		$scope.delMoniterTask = function(task_id) {
			if (task_id && task_id.length > 0) {
				$http({
					method: "delete",
					url: "/controller/monitor/" + task_id,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					var data = response.data;
					if(data.status){
						$scope.monitorList($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
					}
				});
			}
		}
	}])

.controller('monitorCtrl', function($scope, $http, $interval, factory_mondata,$stateParams,appService,$timeout,$state,RefreshManager) {
		RefreshManager.interval($interval, function() {
			if($scope.model){
				$scope.model.startTime = $("#mon_start_time")[0].value
				$scope.model.endTime = $("#mon_stop_time")[0].value
			}
		},200)
		$scope.$on('$destroy', function(){
			RefreshManager.cancel()
		})
	var task_id = factory_mondata.getter().task_id;
	task_id=$stateParams.monitorid;
	var type=$stateParams.type;
	var parser = new MonitorTaskModel()
	$scope.model = {}
	$scope.picMeta = {}

	var monitor_task_name = "";
	$scope.getMonitorTask=function(task_id){
		$http({
			method: "get",
			url: "/controller/monitor/" + task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			if(response.data.reason){
				$.LstTips(response.data.reason,4000)
				return
			}
			var data = response.data;
			$scope.model = parser.procGetMonitorTaskModel(data)
			monitor_task_name = $scope.model.task_name;
		});
	};
	$scope.getMonitorOptions = function(data){
		$http({
			method: "get",
			url: "/controller/extlibs/info",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			$scope.monitorOptionsList = [];
			function formatStatus (item) {
				let obj = {0:'未关联',1:'被关联'}
				return obj[item]
			}
			for(var i in response.data){
				$scope.monitorOptionsList[i] = {}
				$scope.monitorOptionsList[i].message = response.data[i].id + '-' + response.data[i].name + '-' + formatStatus(response.data[i].status)
				$scope.monitorOptionsList[i].key = response.data[i].id
				$scope.monitorOptionsList[i].status = response.data[i].status
			}
			$scope.monitorOptionsList.unshift({key:0,message:'不关联布控库',status:2})
			$scope.item = data.db_id
			if($scope.item==0){
				$scope.btnCtrl = false
			}else{
				$scope.btnCtrl = true
			}
		});
	};
	var meta_uploaded_image = {};

	$scope.uploadTaskPic = function(is_new_task) {
		var sid = $("#mon_db_id").val()
		var mon_sid = (sid==undefined)?0:parseInt(sid)

		if((mon_sid <=0)  || (sid == "") ){
			var files=_idFiles1.files
			if(files&&files.length > 0){
				$("#tf").ajaxSubmit({
					success: function(data) {
						$scope.model = parser.uploadTaskPicModel(data, function(){
							$scope._addMonitorTask(is_new_task)
						})
						_idFiles1.value = null
					}
				});
			}else{
				$scope._addMonitorTask(is_new_task)
			}
		}else{
			$scope._addMonitorTask(is_new_task)
		}
	};
	$scope.deleteMonitorPicture=function(url,$event){
		if($(".div-showimg").length == 1){
			return $.LstTips("在不关联布控库的情况下，照片数量至少为一张")
		}
		var uid = url.lastIndexOf('/')
		var file = url.substring(uid+1)
		if(file.length > 0){
			parser.removeFileFromTask(file)
		}
		$($event.target).parent().remove();
	}
/*	$scope.addMonitorTask = function() {
		$scope.uploadTaskPic();
	};*/
	$scope.$watch("model",function(){
		$scope.getMonitorOptions($scope.model);
	});
	$scope.bindModel = () => {
		$http({
			method: "get",
			url: "/controller/extlibs/info",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			$scope.monitorOptionsList = [];
			function formatStatus (item) {
				let obj = {0:'未关联',1:'被关联'}
				return obj[item]
			}
			for(var i in response.data){
				$scope.monitorOptionsList[i] = {}
				$scope.monitorOptionsList[i].message = response.data[i].id + '-' + response.data[i].name + '-' + formatStatus(response.data[i].status)
				$scope.monitorOptionsList[i].key = response.data[i].id
				$scope.monitorOptionsList[i].status = response.data[i].status
			}
			$scope.monitorOptionsList.unshift({key:0,message:'不关联布控库',status:2})
		})
		if($scope.item==0){
			$scope.btnCtrl = false
		}else{
			$scope.btnCtrl = true
		}
		if($scope.model){
			$scope.model.db_id=$scope.item
		}
	};
	$scope._addMonitorTask = function(is_new_task) {
		$scope.model.startTime = $('#mon_start_time').val()
		$scope.model.endTime = $('#mon_stop_time').val()
		if(compareDatetime($scope.model.startTime, $scope.model.endTime)>=0){
			$.LstTips('任务开始时间大于或等于结束时间，请重新设置！')
			return
		}
		if($scope.model.objects == undefined){  // 图片判断
			let haveImg = true
			$scope.monitorOptionsList.forEach(function(value,index){
				if($scope.item == $scope.monitorOptionsList[index].key){
					if(value.status == 2){
						let img = _idFiles1.files
						if(img.length == 0){
							haveImg = false
						}
					}
				}
			})
			if(haveImg == false){
				return $.LstTips('请选择图片后进行更新')
			}
		}
		var task_data = parser.setNewTaskData($scope.model, is_new_task);
		if(task_data == undefined){
			return
		}
		if((is_new_task == false) && (task_data.task_id == undefined)){
			return
		}
		var url = (is_new_task) ? "/controller/monitor" :
			"/controller/monitor"+"/"+task_data.task_id
		$http({
			method: is_new_task ? "post" : "put",
			url: url,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: task_data
		}).then(function(response) {
			if(response.data.Extlibrarystatus == false){
				$.LstTips("请求失败，不能使用被关联的布控库进行关联")
			}
			if(response.data.imageStatus == false){
				$.LstTips("更新失败，在不关联布控库的条件下，选择布控图片后更新",5000)
			}
			if(response.data.reason){
				$.LstTips(response.data.reason,4000)
				return
			}
			var data = response.data;
			if(response.data.Extlibrarystatus == undefined && response.data.imageStatus == undefined){
				$scope.model = parser.newTaskResponseModel(data)
				$scope.model.startTime = response.data.start_time
				$scope.model.endTime = response.data.stop_time
				monitor_task_name = $scope.model.task_name;
			}

			if(is_new_task == false) {
				if(data.task_id){
					$scope.getMonitorTask(data.task_id)
				}else{
					$scope.getMonitorTask($scope.model.task_id)
				}
			}
		}, function(res){

		});
	};
	$scope.updateMonitorTask = function(){
		let status = false
		if(status == true){
			return ''
		}
		var task_id = $scope.model.task_id
		$scope.uploadTaskPic((task_id == undefined)?true:false);
	}
	$scope.startMonitor = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/monitor/" + $scope.model.task_id + "/start",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			if(data.status != undefined && data.status == false){
				$.LstTips(data.reason)
				return
			}
			$('#taskStatus').text(data.status ? "开始布控..." : "开始布控失败");
		}, null);

	/*	$scope.conf.refresh = false
		$scope.toggleRefreshMonitorResult()*/

	};

	$scope.stopMonitor = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/monitor/" + $scope.model.task_id + "/stop",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			if(data.status != undefined && data.status == false){
				$.LstTips(data.reason)
				return
			}
			$('#taskStatus').text(data.status ? "已停止布控" : "停止布控失败");
		}, null);
	};

	$scope.goMonitorView=function(model){
		if(model.task_id){
			sessionStorage.setItem("monitor_task_name",monitor_task_name);
			$state.go('app.monitor.monitorview', {monitorid:model.task_id});
		}
	}

	$scope.showMonitorPicture=function(object){
		$("#popup").css({"top":"30%","right":"20%"});
		appService.drag("popup");
		if(object==undefined){
			return
		}
		var posId = object.url.lastIndexOf('/')
		var photoId= object.url.substring(posId+1)
		if(photoId == undefined){
			return
		}
		$http({
			method: "get",
			url: "/controller/standard/photo/"+photoId,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			if (data.status == undefined) {
				object.meta = data
				$scope.picMeta=object.meta
				$scope.picMeta.id=photoId
				if($scope.picMeta.age == 0){
					$scope.picMeta.age="";
				}
				$scope.picMeta.first = false
				$(".popup").css("display","block");
			}else{
				reqFail()
			}
		}, function(resp){
			reqFail()
		})
		function reqFail(){
			if(object && object.meta==undefined){
				object.meta = {}
			}
			$scope.picMeta=object.meta
			$scope.picMeta.id=photoId
			$scope.picMeta.first = true
			$(".popup").css("display","block");
		}
	}
	$scope.closeInfo=function(){
		$(".popup").css("display","none");
	}
	$scope.savePictureMeta=function(){
		$scope.picMeta.age = parseInt($scope.picMeta.age)
		var photo_meta = $scope.picMeta
		var method = "post"
		var request = "/controller/standard/photo"

		parser.updatePhotoMeta($scope.model, $scope.picMeta);
		if(photo_meta.first == false){
			method = "put"
			request += "/"+photo_meta.id
		}
		delete photo_meta.first

		$http({method: method, url: request,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: photo_meta
		}).then(function(response) {
			var data = response.data;
			if (data.status ) {

			}
		})
		$(".popup").css("display","none");
	}
	$scope.conf={
		refresh: false
	}
	if (task_id && task_id.length > 0 && type=="info") {
		$scope.edit_status="编辑任务详情";
		$scope.getMonitorTask(task_id)
	}else{
		$scope.conf.refresh =true
		$scope.edit_status="新建任务详情";
	}
})
.controller('viewMonitorCtrl', function($scope, $http, $interval,$timeout,factory_mondata, DB, RefreshManager,appService,$stateParams,$document,factory_data) {
	var task_id = $stateParams.monitorid;
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
	$scope.getStatus()
	var seq = factory_data.getter();
	if(seq && seq.task_id!==undefined){
		task_id = seq.task_id;
		factory_data.setter({});
	}
	if(sessionStorage.getItem('monitor_task_name') !== null){
		$scope.task_name = "["+sessionStorage.getItem('monitor_task_name')+"]";
	}

	$scope.conf = {
		max_list_item: 8,
		refresh: false,
		refresh_interval: 2000,
		refersh_timer: null
	}
	$scope.model = {task_id: task_id};
	var tsak_id=$scope.model.task_id;
	var parser = new MonitorTaskModel();
	var Pager = new PagerModel();

	$scope.goto = function(){
		Pager.setPagerTo($scope.pager.page, $scope.pager.page_size);
		$scope.viewMonitorList();
	};
	$scope.gotoFirst = function(){
		$scope.getNumOfViewMonitors();
	};
	$scope.gotoPrev = function(){
		Pager.setPagerNext(false, $scope.pager.page_size);
		$scope.viewMonitorList();
	};
	$scope.gotoNext = function(){
		Pager.setPagerNext(true, $scope.pager.page_size);
		$scope.viewMonitorList();
	};
	$scope.gotoTail = function(){
		Pager.setPagerTo(1000000, $scope.pager.page_size);
		$scope.viewMonitorList();
	};
	$scope.getNumOfViewMonitors = function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/monitors/history/count/'+task_id
		}).then(function successCallback(response) {
			var data = response.data;
			var infoPageSize = 7;
			if($scope.pager){
				infoPageSize = $scope.pager.page_size;
			}
			Pager.setPagerInfo(1, infoPageSize, data.count)
			$scope.pager = Pager.getPagerInfo()
			$scope.viewMonitorList();
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};
	$scope.getNumOfViewMonitors();
	$scope.viewMonitorList=function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'multipart/form-data'
			},
            processData:false,
            contentType:false,
			url: '/controller/monitor/history/'+task_id +'/result'+'?' + Pager.getPagerParams()
		}).then(function successCallback(response) {
			var data = response.data;
			if(data.status != undefined && data.status == false){
				$.LstTips(data.reason)
				return
			}
			$scope.viewMonitorLists = parser.procTasksResult(response.data);
			$scope.pager = Pager.getPagerInfo()
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	};
	$scope.startMonitor = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/monitor/" + $scope.model.task_id + "/start",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$('#taskStatus').text(data.status ? "开始布控..." : "开始布控失败");
			$scope.getStatus()
		}, null);

		/*$scope.conf.refresh = false
		$scope.toggleRefreshMonitorResult()*/

	};
	$scope.stopMonitor = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/monitor/" + $scope.model.task_id + "/stop",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$('#taskStatus').text(data.status ? "已停止布控" : "停止布控失败");
			$scope.getStatus()
		}, null);
	};

	$scope.toggleRefreshMonitorResult = function() {
		var conf = $scope.conf
		if (conf.refresh == false) {
			$scope.conf.refresh = true
			$(".active-img").css("display","block");
			$(".active-img-right").css("display","none");

			RefreshManager.interval($interval, function() {
				$.ajax({
					url: "/controller/monitor/" + $scope.model.task_id + "/result",
					type: "get",
					success: function(msg) {
						$scope.image_seqence = parser.procMonitorResult(msg, $scope.conf)
					}
				});
			}, conf.refresh_interval)
		} else {
			RefreshManager.cancel()
			$scope.conf.refresh = false
			$(".active-img").css("display","none");
			$(".active-img-right").css("display","block");
		}
	}

	$scope.$on('$destroy', function(){
		RefreshManager.cancel();
		$scope.conf.refresh = false;
		$interval.cancel(pic_timer); //关闭请求大图和视频地址的定时器
		$interval.cancel(vlc_inter);   //清除vlc播放定时器
		sessionStorage.removeItem("monitor_task_name");
	})

	$scope.toggleRefreshMonitorResult();
	/* 显示对比大图片 */
	$scope.showPic=function(seq){
		/*console.log(this);*/
		$("#show-pic-div").css("display","block");
		$("#target-image").attr("src",seq.url_target_image);
		$("#monitor-image").attr("src",seq.url_monitor_image);
	}
	$scope.hiddenPic=function(){
		$("#show-pic-div").css("display","none");
	}
	/* 显示对比大图片 End */
	/* 打开布控对比详情对话框 */
	$scope.showDialogBox = false;
	$scope.isProgressBar = false;
	var vlcEmbed = document.getElementById('vlcEmbed');   //flv视频vlc播放容器
	var pic_timer;    //请求图片定时器
	var vlc_inter;    //vlc播放定时器
	$scope.openMonitorDialogBox=function(seq){
		$interval.cancel(vlc_inter);   //清除vlc播放定时器
		$scope.tabStatus = [1,0,0];
		$("#vlcEmbed").parents("li").css("display","none");
		$scope.showDialogBox = true;
		$interval.cancel(pic_timer);
		$scope.isProgressBar = true;
		$scope.progress = 0;
		$scope.progressMes = '视频加载中......';
		$scope.progressStyle = {
			"width": $scope.progress + "%"
		};
		$scope.input_time = 0;
		$scope.monitor_id = seq.monitor_id;
		$("#monitor-dialog-box").css("display","block");
		$("#popup").css({"top":"15%","right":"20%"});
		appService.drag("monitor-dialog-box", "monitor-dialog-title", true);
		$scope.monitorEntity=seq;
		var data;
		$http({
			method: "get",
			url: "/controller/monitor/" + seq.task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			if (response.status==200) {
				data = response.data;
				data = parser.procGetMonitorTaskModel(data);
				$scope.monitorEntity.task_name=data.task_name;
				$scope.monitorEntity.task_desc=data.task_desc;
			}
		});
		//请求大图和视频地址
		let status= {
			imgStatus: false,
			flvStatus: false
		};
		$scope.video_url = '';    //flv视频路径
		$scope.scene_size = '';   //全景图大小
		$scope.video_size = '';   //视频大小
		$scope.pic_req_time = 0;
		pic_timer = $interval(function(){
			if(!status.imgStatus) {
				$scope.pic_req_time += 2;
				$scope.monitorEntity.max_pic_load=true;
				$scope.monitorEntity.max_pic_error=false;
				$http({
					method: "get",
					url: "/controller/monitor/result/" + $scope.monitorEntity.monitor_id,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(function (response) {
					if (response.status==200) {
						var data = response.data;
						if(data.photo_size && data.photo_size>=1024*1024){
							$scope.scene_size = '(' + Math.round((data.photo_size/1024/1024)*100)/100 + 'MB)';
						}else if(data.photo_size && data.photo_size<1024*1024){
							$scope.scene_size = '(' + Math.round((data.photo_size/1024)*100)/100 + 'KB)';
						}
						if (data.status) {
							console.log("stop--->获取到了");
							status.imgStatus = true;
							$scope.monitorEntity.max_pic_load = false;
							$scope.monitorEntity.max_pic_error = false;
							$scope.monitorEntity.max_pic_url = data.url;
							$scope.monitorEntity.max_pic_name = $scope.monitorEntity.max_pic_url.replace(/\/store\/result\//, '');
							$scope.monitorEntity.max_pic_name = $scope.monitorEntity.max_pic_name.replace(/.*\//, '');
						} else {
							console.log("stop--->获取失败");
							picLoadFail();
						}
					}else{
						picLoadFail();
					}
				},function(response){
					//请求失败代码
					if ($scope.pic_req_time >= 100) {
						status.imgStatus = true;
						$scope.monitorEntity.max_pic_load = false;
						$scope.monitorEntity.max_pic_error = true;
					}
				});
				function picLoadFail(){
					if ($scope.pic_req_time >= 100) {
						status.imgStatus = true;
						$scope.monitorEntity.max_pic_url = undefined;
						$scope.monitorEntity.max_pic_load = false;
						$scope.monitorEntity.max_pic_error = true;
					}
				}
			}
			console.log("请求数据");
			if(!status.flvStatus) {
				$scope.progress += 1.9;
				//进度条长度
				$scope.progressStyle = {
					"width": $scope.progress + "%"
				};
				$http({
					method: "get",
					url: "/controller/monitor/video/" + seq.monitor_id,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(function (response) {
					if (response.status==200) {
						data = response.data;
						if(data.video_size && data.video_size>=1024*1024){
							$scope.video_size = '(' + Math.round((data.video_size/1024/1024)*100)/100 + 'MB)';
						}else if(data.video_size && data.video_size<1024*1024){
							$scope.video_size = '(' + Math.round((data.video_size/1024)*100)/100 + 'KB)';
						}
						if(data.status && data.video_status) {
							status.flvStatus = true;
							$scope.progressMes = "视频加载完成";
							$scope.progress = 100;
							$scope.progressStyle = {
								"width": $scope.progress + "%"
							};
							$timeout(function () {
								$scope.isProgressBar = false;
								$scope.video_url = data.video_url;
								//如果在视频播放窗口，直接播放
								if($("#vlcEmbed").parents("li").css("display") == "block"){
									$scope.inputState = 0;
									vlcEmbed.src = data.video_url;
									vlcEmbed.playlist.stop();
									vlcEmbed.playlist.items.clear();
									var item_id = vlcEmbed.playlist.add(data.video_url);
									vlcEmbed.playlist.playItem(item_id);
									vlcEmbed.playlist.play();
									goInputTime();
									vlcEmbed.input.time = $scope.input_time-10*1000;
									vlc_inter = $interval(function(){
										if(vlcEmbed.input.state > 4){
											$("#vlcEmbed").parents("li").css("display","none");
											$("#vlcEmbed").parents("li").css("display","block");
											vlcEmbed.src = data.video_url;
											vlcEmbed.playlist.stop();
											vlcEmbed.playlist.items.clear();
											var item_id = vlcEmbed.playlist.add(data.video_url);
											vlcEmbed.playlist.playItem(item_id);
											vlcEmbed.playlist.play();
											goInputTime();
											vlcEmbed.input.time = $scope.input_time-10*1000;
											$scope.inputState = vlcEmbed.input.state;
											console.log(vlcEmbed.input.state)
										}else if(vlcEmbed.input.state == 3){
											console.log(vlcEmbed.input.state);
											$scope.inputState = 3;
											$interval.cancel(vlc_inter)
										}
									},3000);
								}
							}, 500);
						}else{
							loadFail();
						}
					}else{
						loadFail();
					}
				},function(response){
					//请求失败代码
					loadFail();
				});
				//请求失败处理代码
				function loadFail(){
					if($scope.progress >= 95){
						status.flvStatus = true;
						$scope.progressMes = "视频加载失败";
						$scope.progress = 0;
						$scope.progressStyle = {
							"width": $scope.progress + "%"
						};
					}
				}
			}
			if(status.imgStatus && status.flvStatus){
				$interval.cancel(pic_timer)
			}
		}, 2000);
		if($scope.showDialogBox){
			$document[0].onkeydown = function(ev){
				if(ev.keyCode == 27){
					$scope.closeMonitorDialogBox();
				}
			}
		}
	};
	function goInputTime(){
		if($scope.video_url == ''){
			return
		}
		/*/store/result/5fea8a7c-e940-11e7-8c56-2c4d544505ff/video/2018-01-18_10:45:54-2018-01-18_10:47:34.flv*/
		//跳转抓拍时间之前
		var start_time = $scope.video_url.substr($scope.video_url.indexOf('/video/')+7,19);
		start_time = start_time.replace(/\_/, ' ').replace(/\-/g, '/');
		var mon_cap_time = $scope.monitorEntity.mon_cap_time.replace(/\-/g, '/');
		$scope.input_time = new Date(mon_cap_time) - new Date(start_time);
	}

	//从查看页面跳转过来，直接打开弹窗
	if(seq && seq.task_id!==undefined){
		$scope.openMonitorDialogBox(seq)
	}

	/* 打开布控对比详情对话框 End */
	/* 视频播放控制方法 */
	$scope.fp_play = function(){vlcEmbed.playlist.play();};
	$scope.fp_pause = function(){ vlcEmbed.playlist.pause() };
	$scope.fp_continue = function(){ vlcEmbed.playlist.play() };
	$scope.fp_stop = function(){ vlcEmbed.playlist.stop()};
	/* 视频播放控制方法 End */
	/* 关闭布控对比详情对话框 */
	$scope.closeMonitorDialogBox=function(){
		console.log("stop--->关闭了");
		$scope.showDialogBox = false;  //关闭弹出框
		$interval.cancel(pic_timer);   //关闭请求大图和视频地址的定时器
		$interval.cancel(vlc_inter);   //清除vlc播放定时器
		$scope.progress = 0;
		$scope.progressStyle = {
			"width": $scope.progress+"%"
		};
		if(vlcEmbed.playlist !== undefined){
			vlcEmbed.playlist.stop();     //停止vlc播放
			vlcEmbed.playlist.items.clear();
		}
		$("#vlcEmbed").parents("li").css("display","none");
	};
	/* 关闭布控对比详情对话框 End */
	/* 关闭布控对比详情对话框Tab效果 */
	$scope.tabStatus = [1,0,0];
	$scope.changeTab = index => {
		$scope.tabStatus = [0,0,0];
		$scope.tabStatus[index] = 1;
		$("#vlcEmbed").parents("li").css("display","none");
	};
	$scope.videoTab = function(){
		$scope.tabStatus = [0,0,1];
		$("#vlcEmbed").parents("li").css("display","none");
		$("#vlcEmbed").parents("li").css("display","block");
		if($scope.video_url == ""){
			return
		}
		$scope.inputState = 0;
		goInputTime();
		vlcEmbed.src = $scope.video_url;
		vlcEmbed.playlist.play();
		vlcEmbed.input.time = $scope.input_time-10*1000;
		$timeout(function(){
			if(vlcEmbed.input.state == 3){
				$scope.inputState = 3;
			}
		},4000);
	};
	/* 关闭布控对比详情对话框Tab效果 End */
})
